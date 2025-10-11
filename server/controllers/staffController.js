const Task = require('../models/Task');
const ExtensionRequest = require('../models/ExtensionRequest');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/extensions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .pdf, .doc, .docx, .jpg, .jpeg, .png files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * GET /api/tasks/overdue
 * Fetch overdue tasks for authenticated staff user
 */
const getOverdueTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;

    // Verify user is staff
    if (req.user.role === 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for staff members only.'
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query for overdue tasks
    const currentDate = new Date();
    const query = {
      assignedTo: userId,
      dueDate: { $lt: currentDate },
      status: { $nin: ['completed', 'submitted'] }
    };

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const overdueTasks = await Task.find(query)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalCount = await Task.countDocuments(query);

    // Calculate overdue days and add reason
    const tasksWithOverdueInfo = overdueTasks.map(task => {
      const daysOverdue = Math.ceil((currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
      
      let overdueReason = 'Task exceeded its deadline';
      if (daysOverdue === 1) {
        overdueReason = 'Task is 1 day overdue';
      } else if (daysOverdue > 1) {
        overdueReason = `Task is ${daysOverdue} days overdue`;
      }

      return {
        ...task,
        daysOverdue,
        overdueReason
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        tasks: tasksWithOverdueInfo,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: `Found ${totalCount} overdue task${totalCount !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/requests/extensions
 * Submit extension request for overdue task
 */
const submitExtensionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId, reason, customReason, requestedDueDate } = req.body;

    // Verify user is staff
    if (req.user.role === 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for staff members only.'
      });
    }

    // Validate required fields
    if (!taskId || !reason || !requestedDueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskId, reason, and requestedDueDate are required'
      });
    }

    // Validate requested due date is in the future
    const requestedDate = new Date(requestedDueDate);
    const currentDate = new Date();
    if (requestedDate <= currentDate) {
      return res.status(400).json({
        success: false,
        message: 'Requested due date must be in the future'
      });
    }

    // Validate custom reason if 'other' is selected
    if (reason === 'other' && (!customReason || !customReason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Custom reason is required when "other" is selected'
      });
    }

    // Fetch and verify task
    const task = await Task.findById(taskId).populate('assignedBy', 'name email role');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify task is assigned to requesting user
    if (task.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only request extensions for tasks assigned to you'
      });
    }

    // Verify task is overdue
    if (new Date(task.dueDate) >= currentDate) {
      return res.status(400).json({
        success: false,
        message: 'Extension requests can only be submitted for overdue tasks'
      });
    }

    // Verify task is not completed
    if (['completed', 'submitted'].includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request extension for completed or submitted tasks'
      });
    }

    // Check if there's already a pending request for this task
    const existingRequest = await ExtensionRequest.findOne({
      taskId,
      staffId: userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A pending extension request already exists for this task'
      });
    }

    // Get HOD ID (task assignedBy should be HOD)
    const hodId = task.assignedBy._id;
    if (task.assignedBy.role !== 'hod') {
      return res.status(400).json({
        success: false,
        message: 'Task must be assigned by an HOD to request extension'
      });
    }

    // Map reason to label
    const reasonLabels = {
      'technical_issues': 'Technical Difficulties',
      'resource_unavailable': 'Resources Unavailable',
      'scope_change': 'Scope Change Required',
      'dependency_delay': 'Dependency Delays',
      'personal_emergency': 'Personal Emergency',
      'workload_conflict': 'Workload Conflicts',
      'other': 'Other'
    };

    // Handle file uploads if any
    let supportingFiles = [];
    if (req.files && req.files.length > 0) {
      supportingFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }

    // Create extension request
    const extensionRequest = new ExtensionRequest({
      taskId,
      staffId: userId,
      hodId,
      reason,
      reasonLabel: reasonLabels[reason],
      customReason: customReason || '',
      originalDueDate: task.dueDate,
      requestedDueDate: requestedDate,
      supportingFiles,
      submittedAt: new Date()
    });

    await extensionRequest.save();

    // Populate the created request for response
    await extensionRequest.populate([
      { path: 'taskId', select: 'title description' },
      { path: 'staffId', select: 'name email' },
      { path: 'hodId', select: 'name email' }
    ]);

    // TODO: Send notification to HOD (implement socket.io or notification system)
    // This would be implemented when you have a notification system in place
    console.log(`Extension request submitted - notify HOD ${hodId} about request ${extensionRequest._id}`);

    res.status(201).json({
      success: true,
      data: extensionRequest,
      message: 'Extension request submitted successfully. Your HOD will review and respond.'
    });

  } catch (error) {
    console.error('Error submitting extension request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting extension request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/requests/extensions
 * Fetch extension request history for authenticated staff user
 */
const getExtensionRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status = 'all', sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

    // Verify user is staff
    if (req.user.role === 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for staff members only.'
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { staffId: userId };
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const requests = await ExtensionRequest.find(query)
      .populate('taskId', 'title description priority')
      .populate('hodId', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('reassignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalCount = await ExtensionRequest.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: `Found ${totalCount} extension request${totalCount !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Error fetching extension requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching extension requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getOverdueTasks,
  submitExtensionRequest: [upload.array('supportingFiles', 5), submitExtensionRequest],
  getExtensionRequests
};
const Task = require('../models/Task');
const ExtensionRequest = require('../models/ExtensionRequest');
const User = require('../models/User');

/**
 * GET /api/analytics/overdue-tasks
 * Get overdue task analytics for HOD dashboard
 */
const getOverdueAnalytics = async (req, res) => {
  try {
    const hodId = req.user.id;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    const currentDate = new Date();

    // Get all staff under this HOD's department
    const staffUsers = await User.find({ 
      role: 'faculty',
      // Assuming department field exists - adjust based on your schema
      // department: req.user.department 
    }).select('_id name email');

    const staffIds = staffUsers.map(staff => staff._id);

    // Aggregate overdue tasks
    const overdueTasksAggregation = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: staffIds },
          assignedBy: hodId,
          dueDate: { $lt: currentDate },
          status: { $nin: ['completed', 'submitted'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'staffInfo'
        }
      },
      {
        $unwind: '$staffInfo'
      },
      {
        $group: {
          _id: '$assignedTo',
          staffName: { $first: '$staffInfo.name' },
          staffEmail: { $first: '$staffInfo.email' },
          overdueCount: { $sum: 1 },
          tasks: { $push: '$$ROOT' }
        }
      }
    ]);

    // Get total tasks assigned by this HOD
    const totalTasksAssigned = await Task.countDocuments({
      assignedBy: hodId,
      assignedTo: { $in: staffIds }
    });

    const totalOverdueTasks = overdueTasksAggregation.reduce((sum, staff) => sum + staff.overdueCount, 0);

    // Calculate overdue percentage
    const overduePercentage = totalTasksAssigned > 0 ? 
      Math.round((totalOverdueTasks / totalTasksAssigned) * 100) : 0;

    // Get priority distribution of overdue tasks
    const priorityDistribution = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: staffIds },
          assignedBy: hodId,
          dueDate: { $lt: currentDate },
          status: { $nin: ['completed', 'submitted'] }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get trend data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendData = await Task.aggregate([
      {
        $match: {
          assignedBy: hodId,
          assignedTo: { $in: staffIds },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalTasks: { $sum: 1 },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', currentDate] },
                    { $not: { $in: ['$status', ['completed', 'submitted']] } }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format trend data for charts
    const formattedTrendData = trendData.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      overdue: item.overdueTasks,
      total: item.totalTasks,
      percentage: item.totalTasks > 0 ? Math.round((item.overdueTasks / item.totalTasks) * 100) : 0
    }));

    // Get extension request statistics
    const extensionStats = await ExtensionRequest.aggregate([
      {
        $match: {
          hodId: hodId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format extension stats
    const extensionSummary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      reassigned: 0
    };

    extensionStats.forEach(stat => {
      if (extensionSummary.hasOwnProperty(stat._id)) {
        extensionSummary[stat._id] = stat.count;
      }
    });

    // Prepare response data
    const analyticsData = {
      summary: {
        totalOverdue: totalOverdueTasks,
        totalTasks: totalTasksAssigned,
        overduePercentage,
        staffCount: staffUsers.length
      },
      overdueByStaff: overdueTasksAggregation.map(staff => ({
        staffId: staff._id,
        name: staff.staffName,
        email: staff.staffEmail,
        count: staff.overdueCount,
        assigned: staff.tasks.length
      })),
      priorityDistribution: priorityDistribution.map(item => ({
        name: item._id || 'medium',
        value: item.count,
        color: item._id === 'high' ? '#EF4444' : 
               item._id === 'medium' ? '#F97316' : '#10B981'
      })),
      trendData: formattedTrendData,
      extensionRequests: extensionSummary
    };

    res.status(200).json({
      success: true,
      data: analyticsData,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/requests/overdue
 * Fetch all extension requests for HOD review
 */
const getExtensionRequests = async (req, res) => {
  try {
    const hodId = req.user.id;
    const { page = 1, limit = 10, status = 'all', sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { hodId };
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const requests = await ExtensionRequest.find(query)
      .populate('taskId', 'title description priority status')
      .populate('staffId', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('reassignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalCount = await ExtensionRequest.countDocuments(query);

    // Add calculated fields
    const requestsWithCalculations = requests.map(request => {
      const daysOverdue = Math.ceil(
        (new Date() - new Date(request.originalDueDate)) / (1000 * 60 * 60 * 24)
      );
      
      const daysSinceRequest = Math.ceil(
        (new Date() - new Date(request.submittedAt)) / (1000 * 60 * 60 * 24)
      );

      return {
        ...request,
        daysOverdue,
        daysSinceRequest
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        requests: requestsWithCalculations,
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

/**
 * PUT /api/requests/overdue/:requestId/approve
 * Approve extension request and update task due date
 */
const approveExtensionRequest = async (req, res) => {
  try {
    const hodId = req.user.id;
    const { requestId } = req.params;
    const { newDueDate, comments } = req.body;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Validate required fields
    if (!newDueDate) {
      return res.status(400).json({
        success: false,
        message: 'New due date is required'
      });
    }

    // Validate new due date is in the future
    const approvedDate = new Date(newDueDate);
    const currentDate = new Date();
    if (approvedDate <= currentDate) {
      return res.status(400).json({
        success: false,
        message: 'New due date must be in the future'
      });
    }

    // Find and verify extension request
    const extensionRequest = await ExtensionRequest.findById(requestId)
      .populate('taskId')
      .populate('staffId', 'name email');

    if (!extensionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Extension request not found'
      });
    }

    // Verify HOD owns this request
    if (extensionRequest.hodId.toString() !== hodId) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve requests assigned to you'
      });
    }

    // Verify request is pending
    if (extensionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${extensionRequest.status}`
      });
    }

    // Update extension request
    extensionRequest.status = 'approved';
    extensionRequest.approvedDueDate = approvedDate;
    extensionRequest.hodComments = comments || '';
    extensionRequest.reviewedAt = new Date();
    extensionRequest.reviewedBy = hodId;

    await extensionRequest.save();

    // Update task due date and unlock for submission
    await Task.findByIdAndUpdate(extensionRequest.taskId, {
      dueDate: approvedDate,
      status: 'pending', // Reset to pending to allow resubmission
      updatedAt: new Date()
    });

    // TODO: Send notification to staff about approval
    console.log(`Extension approved - notify staff ${extensionRequest.staffId._id} about approval`);

    res.status(200).json({
      success: true,
      data: extensionRequest,
      message: `Extension request approved. Task due date updated to ${approvedDate.toLocaleDateString()}`
    });

  } catch (error) {
    console.error('Error approving extension request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving extension request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/requests/overdue/:requestId/reassign
 * Reassign task to different staff member
 */
const reassignTask = async (req, res) => {
  try {
    const hodId = req.user.id;
    const { requestId } = req.params;
    const { newStaffId, penaltyFlag, comments, newDueDate } = req.body;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Validate required fields
    if (!newStaffId || !newDueDate) {
      return res.status(400).json({
        success: false,
        message: 'New staff ID and new due date are required'
      });
    }

    // Validate new due date
    const reassignDate = new Date(newDueDate);
    const currentDate = new Date();
    if (reassignDate <= currentDate) {
      return res.status(400).json({
        success: false,
        message: 'New due date must be in the future'
      });
    }

    // Find and verify extension request
    const extensionRequest = await ExtensionRequest.findById(requestId)
      .populate('taskId')
      .populate('staffId', 'name email');

    if (!extensionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Extension request not found'
      });
    }

    // Verify HOD owns this request
    if (extensionRequest.hodId.toString() !== hodId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage requests assigned to you'
      });
    }

    // Verify request is pending
    if (extensionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reassign request with status: ${extensionRequest.status}`
      });
    }

    // Verify new staff exists and is faculty
    const newStaff = await User.findById(newStaffId);
    if (!newStaff) {
      return res.status(404).json({
        success: false,
        message: 'New staff member not found'
      });
    }

    if (newStaff.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Can only reassign to faculty members'
      });
    }

    // Update extension request
    extensionRequest.status = 'reassigned';
    extensionRequest.reassignedTo = newStaffId;
    extensionRequest.approvedDueDate = reassignDate;
    extensionRequest.hodComments = comments || '';
    extensionRequest.penaltyApplied = Boolean(penaltyFlag);
    extensionRequest.reviewedAt = new Date();
    extensionRequest.reviewedBy = hodId;

    await extensionRequest.save();

    // Update task assignment and due date
    await Task.findByIdAndUpdate(extensionRequest.taskId, {
      assignedTo: newStaffId,
      dueDate: reassignDate,
      status: 'pending',
      updatedAt: new Date()
    });

    // Apply penalty to original staff if requested
    if (penaltyFlag) {
      await User.findByIdAndUpdate(extensionRequest.staffId._id, {
        $inc: { penaltyCount: 1 },
        $push: {
          penalties: {
            reason: 'Task reassignment due to overdue',
            taskId: extensionRequest.taskId,
            appliedBy: hodId,
            appliedAt: new Date()
          }
        }
      });
    }

    // TODO: Send notifications
    console.log(`Task reassigned - notify original staff ${extensionRequest.staffId._id} and new staff ${newStaffId}`);

    res.status(200).json({
      success: true,
      data: extensionRequest,
      message: `Task reassigned to ${newStaff.name}. New due date: ${reassignDate.toLocaleDateString()}`
    });

  } catch (error) {
    console.error('Error reassigning task:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reassigning task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/requests/overdue/:requestId/reject
 * Reject extension request
 */
const rejectExtensionRequest = async (req, res) => {
  try {
    const hodId = req.user.id;
    const { requestId } = req.params;
    const { comments } = req.body;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Validate required fields
    if (!comments || !comments.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Find and verify extension request
    const extensionRequest = await ExtensionRequest.findById(requestId)
      .populate('taskId')
      .populate('staffId', 'name email');

    if (!extensionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Extension request not found'
      });
    }

    // Verify HOD owns this request
    if (extensionRequest.hodId.toString() !== hodId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests assigned to you'
      });
    }

    // Verify request is pending
    if (extensionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${extensionRequest.status}`
      });
    }

    // Update extension request
    extensionRequest.status = 'rejected';
    extensionRequest.hodComments = comments;
    extensionRequest.reviewedAt = new Date();
    extensionRequest.reviewedBy = hodId;

    await extensionRequest.save();

    // TODO: Send notification to staff about rejection
    console.log(`Extension rejected - notify staff ${extensionRequest.staffId._id} about rejection`);

    res.status(200).json({
      success: true,
      data: extensionRequest,
      message: 'Extension request rejected'
    });

  } catch (error) {
    console.error('Error rejecting extension request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting extension request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getOverdueAnalytics,
  getExtensionRequests,
  approveExtensionRequest,
  reassignTask,
  rejectExtensionRequest
};
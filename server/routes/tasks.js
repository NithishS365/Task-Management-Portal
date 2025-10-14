import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendTaskAssignmentNotification, sendTaskUpdateNotification} from '../socket/socketHandlers.js';

const router = express.Router();

// Import controller functions
import { 
  getAllTasks, 
  getTasksByUser, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask, 
  getTaskStats, 
  getStaffPerformanceStats,
  getOverdueAnalytics,
  getHistoricalOverdueAnalytics
} from '../controllers/taskController.js';

// Rate limiting tracker
const requestTracker = new Map();

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const userId = req.user?.userId;
  const endpoint = req.route?.path;
  const key = `${userId}_${endpoint}`;
  
  const now = Date.now();
  const requests = requestTracker.get(key) || [];
  
  // Remove requests older than 10 seconds
  const recentRequests = requests.filter(time => now - time < 10000);
  
  // Allow max 10 requests per 10 seconds
  if (recentRequests.length >= 10) {
    console.log(`⚠️  Rate limit exceeded for user ${userId} on ${endpoint}`);
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down.'
    });
  }
  
  recentRequests.push(now);
  requestTracker.set(key, recentRequests);
  
  next();
};

// @route   GET /api/tasks
// @desc    Get all tasks for the current user
// @access  Private
router.get('/', auth, rateLimit, async (req, res) => {
  try {
    console.log('📋 Fetching all tasks for user:', req.user.name);
    
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user.userId },
        { createdBy: req.user.userId }
      ]
    })
    .populate('assignedTo', 'name email role department')
    .populate('createdBy', 'name email role department')
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${tasks.length} tasks`);

    res.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('❌ Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/user/:userId
// @desc    Get tasks for a specific user
// @access  Private
router.get('/user/:userId', auth, rateLimit, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📋 Fetching tasks for specific user:', userId);

    // Validate user ID
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Find tasks assigned to or created by this user
    const tasks = await Task.find({
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })
    .populate('assignedTo', 'name email role department')
    .populate('createdBy', 'name email role department')
    .populate('rejectedBy', 'name email role department') // ✅ ADD THIS
    .populate('acceptedBy', 'name email role department')  // ✅ ADD THIS
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${tasks.length} tasks for user ${userId}`);

    // ✅ CONSISTENT RESPONSE FORMAT
    res.json({
      success: true,
      tasks,
      count: tasks.length,
      message: `Successfully loaded ${tasks.length} tasks`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching user tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user tasks',
      error: error.message,
      tasks: [], // ✅ Always include empty tasks array on error
      count: 0
    });
  }
});

// @route   GET /api/tasks/analytics/overdue
// @desc    Get comprehensive overdue analytics for HOD dashboard
// @access  Private (HOD only)
router.get('/analytics/overdue', auth, async (req, res) => {
  try {
    // Check if user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.'
      });
    }

    await getOverdueAnalytics(req, res);
  } catch (error) {
    console.error('❌ Overdue analytics route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue analytics',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/analytics/historical-overdue
// @desc    Get comprehensive historical overdue analytics including previously overdue tasks
// @access  Private (HOD only)
router.get('/analytics/historical-overdue', auth, async (req, res) => {
  try {
    // Check if user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.'
      });
    }

    await getHistoricalOverdueAnalytics(req, res);
  } catch (error) {
    console.error('❌ Historical overdue analytics route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical overdue analytics',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/staff/:staffId/statistics
// @desc    Get detailed performance statistics for a staff member
// @access  Private (HOD or self)
router.get('/staff/:staffId/statistics', auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    console.log('📊 Fetching staff performance statistics for:', staffId);
    
    // Check authorization - either self or HOD
    if (req.user.userId !== staffId && req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these statistics'
      });
    }

    // Import performance calculation functions
    const { 
      calculateSubmissionRating, 
      calculatePerformanceScore,
      getPerformanceGrade 
    } = await import('../utils/performanceCalculator.js');

    // Get user with performance stats
    const user = await User.findById(staffId).select('name email performanceStats');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }

    // Get detailed task statistics for this staff member
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: mongoose.Types.ObjectId(staffId) } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] }
          },
          forApprovalTasks: {
            $sum: { $cond: [{ $eq: ["$status", "ForApproval"] }, 1, 0] }
          },
          rejectedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$dueDate", new Date()] },
                    { $nin: ["$status", ["completed", "ForApproval"]] }
                  ]
                },
                1,
                0
              ]
            }
          },
          // ✅ NEW PERFORMANCE METRICS
          tasksWithRatings: {
            $sum: { $cond: [{ $ne: ["$hodRating.score", null] }, 1, 0] }
          },
          averageHodRating: {
            $avg: { $cond: [{ $ne: ["$hodRating.score", null] }, "$hodRating.score", null] }
          },
          averageSubmissionRating: {
            $avg: { $cond: [{ $ne: ["$submissionRating", null] }, "$submissionRating", null] }
          },
          averagePerformanceScore: {
            $avg: { $cond: [{ $ne: ["$performanceScore", null] }, "$performanceScore", null] }
          },
          totalPerformanceScore: {
            $sum: { $cond: [{ $ne: ["$performanceScore", null] }, "$performanceScore", 0] }
          }
        }
      }
    ]);

    const stats = taskStats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      forApprovalTasks: 0,
      rejectedTasks: 0,
      overdueTasks: 0,
      tasksWithRatings: 0,
      averageHodRating: 0,
      averageSubmissionRating: 0,
      averagePerformanceScore: 0,
      totalPerformanceScore: 0
    };

    // Calculate completion rate
    stats.completionRate = stats.totalTasks > 0 
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
      : 0;

    // Get monthly performance data for charts
    const monthlyData = await Task.aggregate([
      { 
        $match: { 
          assignedTo: mongoose.Types.ObjectId(staffId),
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } // This year
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $ne: ["$status", "completed"] }, 1, 0] }
          },
          missed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$dueDate", new Date()] },
                    { $ne: ["$status", "completed"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageRating: {
            $avg: { $cond: [{ $ne: ["$hodRating.score", null] }, "$hodRating.score", null] }
          },
          averagePerformance: {
            $avg: { $cond: [{ $ne: ["$performanceScore", null] }, "$performanceScore", null] }
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                { case: { $eq: ["$_id.month", 12] }, then: "Dec" }
              ],
              default: "Unknown"
            }
          },
          Completed: "$completed",
          Pending: "$pending",
          Missed: "$missed",
          Rating: { $round: [{ $ifNull: ["$averageRating", 0] }, 1] },
          Performance: { $round: [{ $ifNull: ["$averagePerformance", 0] }, 1] }
        }
      }
    ]);

    // Get priority and category distribution
    const priorityDistribution = await Task.aggregate([
      { $match: { assignedTo: mongoose.Types.ObjectId(staffId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const categoryDistribution = await Task.aggregate([
      { $match: { assignedTo: mongoose.Types.ObjectId(staffId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Get recent completed tasks with ratings
    const recentRatedTasks = await Task.find({
      assignedTo: staffId,
      status: 'completed',
      'hodRating.score': { $exists: true }
    })
    .select('title hodRating performanceScore submissionRating completedAt')
    .sort({ completedAt: -1 })
    .limit(10);

    // Round averages to 2 decimal places
    if (stats.averageHodRating) {
      stats.averageHodRating = Math.round(stats.averageHodRating * 100) / 100;
    }
    if (stats.averageSubmissionRating) {
      stats.averageSubmissionRating = Math.round(stats.averageSubmissionRating * 100) / 100;
    }
    if (stats.averagePerformanceScore) {
      stats.averagePerformanceScore = Math.round(stats.averagePerformanceScore * 100) / 100;
    }

    // Add performance grade
    const performanceGrade = getPerformanceGrade(stats.averagePerformanceScore || 0);

    console.log('📊 Staff Performance Stats Generated:', {
      staffId,
      staffName: user.name,
      completionRate: stats.completionRate,
      averagePerformanceScore: stats.averagePerformanceScore,
      tasksWithRatings: stats.tasksWithRatings
    });

    res.json({
      success: true,
      statistics: {
        ...stats,
        performanceGrade
      },
      monthlyData,
      priorityDistribution: priorityDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryDistribution: categoryDistribution.reduce((acc, item) => {
        acc[item._id || 'general'] = item.count;
        return acc;
      }, {}),
      recentRatedTasks,
      userPerformanceStats: user.performanceStats || {}
    });

  } catch (error) {
    console.error('❌ Get staff performance stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching staff performance statistics',
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics for dashboard
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('📊 Fetching task statistics for user:', req.user.name);
    
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user.userId },
        { createdBy: req.user.userId }
      ]
    });

    const stats = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      overdue: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        return dueDate < now && task.status !== 'completed';
      }).length,
      byPriority: {
        high: tasks.filter(task => task.priority === 'High').length,
        medium: tasks.filter(task => task.priority === 'Medium').length,
        low: tasks.filter(task => task.priority === 'Low').length
      },
      byCategory: tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task statistics',
      error: error.message
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('📋 Creating new task:', req.body);

    const task = new Task({
      ...req.body,
      createdBy: req.user.userId
    });

    await task.save();

    // Populate references
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role department')
      .populate('createdBy', 'name email role department');

    console.log('✅ Task created successfully:', populatedTask.title);

    // ✅ SEND ASSIGNMENT NOTIFICATION IF ASSIGNED TO SOMEONE ELSE
    if (populatedTask.assignedTo && 
        populatedTask.assignedTo._id.toString() !== req.user.userId) {
      
      try {
        const success = await sendTaskAssignmentNotification(
          populatedTask, 
          populatedTask.assignedTo._id.toString(),
          populatedTask.createdBy
        );
        
        if (success) {
          console.log('📤 Assignment notification sent successfully');
        }
      } catch (notifError) {
        console.error('❌ Failed to send assignment notification:', notifError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });

  } catch (error) {
    console.error('❌ Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/users
// @desc    Get all users for task assignment
// @access  Private
router.get('/users', auth, async (req, res) => {
  try {
    console.log('👥 Fetching all users for task assignment');
    
    const users = await User.find({ 
      isActive: { $ne: false } // Include users where isActive is true or undefined
    })
    .select('_id name email role department designation')
    .sort({ name: 1 });

    console.log(`✅ Found ${users.length} active users`);

    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('🔄 Updating task:', req.params.id, req.body);

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role department')
      .populate('createdBy', 'name email role department');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Store original status for comparison
    const originalStatus = task.status;

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email role department')
    .populate('createdBy', 'name email role department')
    .populate('rejectedBy', 'name email role department')
    .populate('acceptedBy', 'name email role department');

    console.log('✅ Task updated successfully:', updatedTask.title);

    // ✅ SEND NOTIFICATIONS FOR STATUS CHANGES
    if (req.body.status && req.body.status !== originalStatus) {
      const updatedByUser = await User.findById(req.user.userId);
      
      // Notify assigned user if different from updater
      if (updatedTask.assignedTo && 
          updatedTask.assignedTo._id.toString() !== req.user.userId) {
        
        try {
          await sendTaskUpdateNotification(
            updatedTask,
            updatedTask.assignedTo._id.toString(),
            req.body.status,
            updatedByUser
          );
          console.log('📤 Update notification sent to assigned user');
        } catch (notifError) {
          console.error('❌ Failed to send update notification to assigned user:', notifError);
        }
      }
      
      // Notify creator if different from updater and assigned user
      if (updatedTask.createdBy && 
          updatedTask.createdBy._id.toString() !== req.user.userId &&
          updatedTask.createdBy._id.toString() !== updatedTask.assignedTo._id.toString()) {
        
        try {
          await sendTaskUpdateNotification(
            updatedTask,
            updatedTask.createdBy._id.toString(),
            req.body.status,
            updatedByUser
          );
          console.log('📤 Update notification sent to creator');
        } catch (notifError) {
          console.error('❌ Failed to send update notification to creator:', notifError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('❌ Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Deleting task:', req.params.id);

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions - only creator can delete
    if (task.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the task creator can delete this task'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    console.log('✅ Task deleted successfully');

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('📋 Fetching single task:', req.params.id);

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role department')
      .populate('createdBy', 'name email role department');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (task.createdBy._id.toString() !== req.user.userId.toString() && 
        task.assignedTo._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('❌ Get single task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
});

export default router;
const Task = require('../models/Task');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { 
  calculateSubmissionRating, 
  calculatePerformanceScore, 
  updateUserPerformanceStats 
} = require('../utils/performanceCalculator');

exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, category, assignedTo } = req.query;
    let filter = {};

    // Apply filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

exports.getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ assignedTo: userId })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching user tasks' });
  }
};
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority, dueDate, assignedTo, tags } = req.body;

    const task = new Task({
      title,
      description,
      category,
      priority,
      dueDate: new Date(dueDate),
      assignedTo,
      assignedBy: req.userId,
      tags
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      category, 
      priority, 
      status, 
      dueDate, 
      tags,
      // ✅ NEW FIELDS FOR TASK SUBMISSION AND APPROVAL
      completionDescription,
      files,
      rating,
      submittedAt
    } = req.body;
    
    const updateData = {
      title,
      description,
      category,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags,
      completionDescription,
      files,
      submittedAt: submittedAt ? new Date(submittedAt) : undefined
    };

    // Clean undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // ✅ HANDLE TASK SUBMISSION (Faculty submits for approval)
    if (status === 'ForApproval' && submittedAt) {
      updateData.submissionDate = new Date(submittedAt);
    }

    // ✅ HANDLE TASK APPROVAL WITH PERFORMANCE CALCULATION (HOD approves)
    if (status === 'completed' && rating) {
      console.log('🎯 Processing task approval with performance calculation...');
      
      // Get the current task to access submission and due dates
      const currentTask = await Task.findById(req.params.id);
      if (!currentTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Set completion and approval dates
      updateData.completedAt = new Date();
      updateData.approvalDate = new Date();
      
      // Store HOD rating
      updateData.hodRating = {
        score: Number(rating.score),
        comment: rating.comment || '',
        ratedBy: rating.ratedBy,
        ratedByName: rating.ratedByName,
        ratedAt: new Date(rating.ratedAt)
      };

      // Calculate submission rating based on timing
      const submissionDate = currentTask.submissionDate || currentTask.submittedAt || new Date();
      const dueDate = currentTask.dueDate;
      const originalDueDate = currentTask.originalDueDate;
      
      const submissionRating = calculateSubmissionRating(
        submissionDate, 
        dueDate, 
        originalDueDate
      );
      
      updateData.submissionRating = submissionRating;

      // Calculate overall performance score
      const performanceScore = calculatePerformanceScore(
        Number(rating.score),
        submissionRating,
        {
          penaltyFlag: currentTask.penaltyApplied || false,
          extensionUsed: currentTask.wasOverdue || false
        }
      );
      
      updateData.performanceScore = performanceScore;

      console.log('📊 Performance Calculation Results:', {
        taskId: currentTask._id,
        hodRating: rating.score,
        submissionRating,
        performanceScore,
        submissionDate,
        dueDate,
        extensionUsed: currentTask.wasOverdue
      });

      // ✅ UPDATE USER PERFORMANCE STATISTICS
      try {
        const assignedUser = await User.findById(currentTask.assignedTo);
        if (assignedUser) {
          console.log('👤 Updating user performance stats for:', assignedUser.name);
          
          updateUserPerformanceStats(
            assignedUser, 
            performanceScore, 
            Number(rating.score), 
            submissionRating
          );
          
          await assignedUser.save();
          console.log('✅ User performance stats updated successfully');
        }
      } catch (userError) {
        console.error('❌ Error updating user performance stats:', userError);
        // Continue with task update even if user stats fail
      }
    }

    // If marking as completed without rating (backward compatibility)
    if (status === 'completed' && !rating) {
      updateData.completedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('✅ Task updated successfully:', {
      taskId: task._id,
      status: task.status,
      performanceScore: task.performanceScore,
      hodRating: task.hodRating?.score,
      submissionRating: task.submissionRating
    });

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('❌ Update task error:', error);
    res.status(500).json({ 
      message: 'Server error while updating task',
      error: error.message 
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const { userId } = req.query;
    let matchFilter = {};
    
    if (userId) {
      matchFilter.assignedTo = new mongoose.Types.ObjectId(userId);
    }

    const stats = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] }
          },
          overdue: {
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
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      highPriority: 0,
      overdue: 0
    };

    res.json({ stats: result });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Server error while fetching task statistics' });
  }
};

// ✅ NEW: Get staff performance statistics with ratings and performance scores
exports.getStaffPerformanceStats = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    if (!mongoose.isValidObjectId(staffId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid staff ID format' 
      });
    }

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
      { $match: { assignedTo: new mongoose.Types.ObjectId(staffId) } },
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
          assignedTo: new mongoose.Types.ObjectId(staffId),
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
      { $match: { assignedTo: new mongoose.Types.ObjectId(staffId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const categoryDistribution = await Task.aggregate([
      { $match: { assignedTo: new mongoose.Types.ObjectId(staffId) } },
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

    console.log('📊 Staff Performance Stats Generated:', {
      staffId,
      staffName: user.name,
      completionRate: stats.completionRate,
      averagePerformanceScore: stats.averagePerformanceScore,
      tasksWithRatings: stats.tasksWithRatings
    });

    res.json({
      success: true,
      statistics: stats,
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
};
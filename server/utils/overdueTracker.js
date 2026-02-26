// Utility to track and permanently mark overdue tasks
import mongoose from 'mongoose';

// We'll import the models from the main server when needed
let TaskModel = null;

// Function to set the Task model (called from server)
export const setTaskModel = (model) => {
  TaskModel = model;
};

// Helper function to get Task model
const getTaskModel = () => {
  if (TaskModel) return TaskModel;
  
  // Try to get existing model if it's already registered
  try {
    return mongoose.model('Task');
  } catch (error) {
    throw new Error('Task model not available. Make sure server is properly initialized.');
  }
};

/**
 * Marks tasks as overdue permanently when they pass their due date
 * This function should be called periodically (daily) to ensure all overdue tasks are marked
 */
export const markOverdueTasks = async () => {
  try {
    const currentDate = new Date();
    
    console.log('🔍 Checking for newly overdue tasks...');
    
    // Find tasks that are overdue but not yet marked as wasOverdue
    const newlyOverdueTasks = await getTaskModel().find({
      dueDate: { $lt: currentDate },
      status: { $nin: ['completed', 'ForApproval', 'rejected'] },
      wasOverdue: { $ne: true } // Only tasks not yet marked as overdue
    });

    if (newlyOverdueTasks.length > 0) {
      console.log(`📊 Found ${newlyOverdueTasks.length} newly overdue tasks to mark`);
      
      // Update all newly overdue tasks to set wasOverdue = true permanently
      const updateResult = await getTaskModel().updateMany(
        {
          _id: { $in: newlyOverdueTasks.map(task => task._id) }
        },
        {
          $set: {
            wasOverdue: true,
            // Store the original due date if not already stored
            $setOnInsert: {
              originalDueDate: '$dueDate'
            }
          }
        }
      );

      console.log(`✅ Marked ${updateResult.modifiedCount} tasks as permanently overdue`);
      
      // Log details of marked tasks
      newlyOverdueTasks.forEach(task => {
        const daysOverdue = Math.ceil((currentDate - task.dueDate) / (1000 * 60 * 60 * 24));
        console.log(`  - Task: ${task.title} (${daysOverdue} days overdue)`);
      });
      
      return {
        success: true,
        markedCount: updateResult.modifiedCount,
        newlyOverdueTasks: newlyOverdueTasks.map(task => ({
          id: task._id,
          title: task.title,
          dueDate: task.dueDate,
          daysOverdue: Math.ceil((currentDate - task.dueDate) / (1000 * 60 * 60 * 24))
        }))
      };
    } else {
      console.log('✅ No newly overdue tasks found');
      return {
        success: true,
        markedCount: 0,
        newlyOverdueTasks: []
      };
    }
  } catch (error) {
    console.error('❌ Error marking overdue tasks:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Marks a task as reallocated permanently
 * This should be called whenever a task is reassigned to a different user
 */
export const markTaskAsReallocated = async (taskId, reason = 'Task reassigned') => {
  try {
    console.log(`🔄 Marking task ${taskId} as reallocated...`);
    
            const updateResult = await getTaskModel().updateOne(
      { _id: taskId },
      {
        $set: {
          reallocated: true,
          reallocationDate: new Date(),
          reallocationReason: reason
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ Task ${taskId} marked as permanently reallocated`);
      return { success: true };
    } else {
      console.log(`⚠️ Task ${taskId} was not updated (may already be marked or not found)`);
      return { success: false, message: 'Task not updated' };
    }
  } catch (error) {
    console.error(`❌ Error marking task ${taskId} as reallocated:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get analytics based on permanent tracking flags
 */
export const getTrackedAnalytics = async () => {
  try {
    console.log('📊 Getting tracked analytics...');
    const currentDate = new Date();
    
    // Get all tasks that were ever overdue (permanent flag)
    const everOverdueTasks = await getTaskModel().find({
      wasOverdue: true
    }).populate('assignedTo', 'name email fullName');

    // Get all tasks that were ever reallocated (permanent flag)
    const everReallocatedTasks = await getTaskModel().find({
      reallocated: true
    }).populate('assignedTo', 'name email fullName');

    console.log(`🔍 Found ${everOverdueTasks.length} ever overdue tasks`);
    console.log(`🔄 Found ${everReallocatedTasks.length} ever reallocated tasks`);

    // Calculate days overdue for each task
    const tasksWithDaysOverdue = everOverdueTasks.map(task => {
      const daysOverdue = task.dueDate ? 
        Math.ceil((currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
      return { ...task.toObject(), daysOverdue };
    });

    // 1. Overdue by Staff
    const staffMap = {};
    tasksWithDaysOverdue.forEach(task => {
      const staffName = task.assignedTo?.fullName || task.assignedTo?.name || 'Unknown Staff';
      const staffEmail = task.assignedTo?.email || 'unknown@email.com';
      
      if (!staffMap[staffName]) {
        staffMap[staffName] = {
          staffName,
          staffEmail,
          overdueCount: 0,
          totalDaysOverdue: 0
        };
      }
      staffMap[staffName].overdueCount++;
      staffMap[staffName].totalDaysOverdue += task.daysOverdue;
    });

    const overdueByStaff = Object.values(staffMap).map(staff => ({
      staffName: staff.staffName,
      staffEmail: staff.staffEmail,
      overdueCount: staff.overdueCount,
      count: staff.overdueCount, // For chart compatibility
      averageDaysOverdue: staff.overdueCount > 0 ? Math.round(staff.totalDaysOverdue / staff.overdueCount) : 0,
      maxDaysOverdue: Math.max(...tasksWithDaysOverdue
        .filter(t => (t.assignedTo?.fullName || t.assignedTo?.name) === staff.staffName)
        .map(t => t.daysOverdue))
    })).sort((a, b) => b.overdueCount - a.overdueCount);

    // 2. Overdue by Priority
    const priorityMap = {};
    everOverdueTasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorityMap[priority] = (priorityMap[priority] || 0) + 1;
    });

    const overdueByPriority = Object.entries(priorityMap).map(([priority, count]) => ({
      _id: priority,
      count
    }));

    // 3. Overdue Trend (Last 12 months) - Real data based on overdueMarkedAt dates
    const overdueTrend = [];
    const monthMap = {};
    
    // Group tasks by the month they were marked overdue
    everOverdueTasks.forEach(task => {
      const markedDate = task.overdueMarkedAt || task.createdAt || new Date();
      const monthKey = new Date(markedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          name: monthKey,
          overdueCount: 0,
          totalDaysOverdue: 0
        };
      }
      monthMap[monthKey].overdueCount++;
      
      const daysOverdue = task.dueDate ? 
        Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
      monthMap[monthKey].totalDaysOverdue += daysOverdue;
    });

    // Create trend data for last 12 months, filling in zeros for months with no data
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthData = monthMap[monthName] || { name: monthName, overdueCount: 0, totalDaysOverdue: 0 };
      overdueTrend.push({
        name: monthName,
        overdueCount: monthData.overdueCount,
        averageDaysOverdue: monthData.overdueCount > 0 ? 
          Math.round(monthData.totalDaysOverdue / monthData.overdueCount) : 0
      });
    }

    // 4. Most Overdue Staff (detailed)
    const mostOverdueStaff = overdueByStaff.map(staff => ({
      _id: staff.staffEmail,
      staffName: staff.staffName,
      staffEmail: staff.staffEmail,
      overdueCount: staff.overdueCount,
      averageDaysOverdue: staff.averageDaysOverdue,
      maxDaysOverdue: staff.maxDaysOverdue
    }));

    // 5. Overdue by Department - Real data from user departments if available
    const departmentMap = {};
    everOverdueTasks.forEach(task => {
      const department = task.assignedTo?.department || 'Unknown Department';
      departmentMap[department] = (departmentMap[department] || 0) + 1;
    });

    const overdueByDepartment = Object.entries(departmentMap).map(([dept, count]) => ({
      _id: dept,
      count
    }));

    // 6. Overdue by Category - Real data from task categories if available
    const categoryMap = {};
    everOverdueTasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const overdueByCategory = Object.entries(categoryMap).map(([category, count]) => ({
      _id: category,
      count
    }));

    // 7. Calculate summary statistics - All from real data
    const totalOverdue = everOverdueTasks.length;
    const totalReallocated = everReallocatedTasks.length;
    const avgOverdueDays = tasksWithDaysOverdue.length > 0 ? 
      Math.round(tasksWithDaysOverdue.reduce((sum, t) => sum + t.daysOverdue, 0) / tasksWithDaysOverdue.length * 10) / 10 : 0;
    const criticalOverdue = tasksWithDaysOverdue.filter(t => t.daysOverdue > 7).length;
    
    // Get total task count from database instead of assuming
    const totalTasks = await getTaskModel().countDocuments();
    const overduePercentage = totalTasks > 0 ? Math.round((totalOverdue / totalTasks) * 100) : 0;

    const analytics = {
      overdueByStaff,
      overdueByPriority,
      overdueTrend,
      mostOverdueStaff,
      overdueByDepartment,
      overdueByCategory,
      totalOverdue,
      totalReallocated,
      avgOverdueDays,
      criticalOverdue,
      overduePercentage
    };

    console.log('✅ Analytics calculated:', {
      totalOverdue,
      totalReallocated,
      avgOverdueDays,
      criticalOverdue,
      staffCount: overdueByStaff.length,
      priorityCount: overdueByPriority.length
    });

    return {
      success: true,
      analytics
    };
  } catch (error) {
    console.error('❌ Error getting tracked analytics:', error);
    return {
      success: false,
      error: error.message,
      analytics: {
        overdueByStaff: [],
        overdueByPriority: [],
        overdueTrend: [],
        mostOverdueStaff: [],
        overdueByDepartment: [],
        overdueByCategory: [],
        totalOverdue: 0,
        totalReallocated: 0,
        avgOverdueDays: 0,
        criticalOverdue: 0,
        overduePercentage: 0
      }
    };
  }
};
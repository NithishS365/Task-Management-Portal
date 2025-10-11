import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNotification } from '../context/NotificationContext';


export const TaskActions = ({ task, onUpdate, size = 'default', showLabels = true }) => {
  const { rejectTask, acceptTask, updateTask } = useTask();
    const { createNotification } = useNotification(); // ✅ ADD THIS
  const { user } = useAuth();
  
  // State management
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState('');

  // Utility functions
  const isAssignedUser = task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
  const isCreator = task.createdBy?._id === user?._id || task.createdBy === user?._id;
  const canModify = isAssignedUser || isCreator;
  const canAssignedUserModify = isAssignedUser;

  // Status checks
  const isTaskPending = task.status === 'pending';
  const isTaskInProgress = task.status === 'in-progress';
  const isTaskCompleted = task.status === 'completed';
  const isTaskRejected = task.status === 'rejected';
  const isTaskOverdue = task.status === 'overdue';

  // Styling based on size
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const buttonBaseClasses = `${getSizeClasses()} rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

  // ✅ ACCEPT TASK FUNCTION
const handleAccept = async () => {
    if (!canAssignedUserModify) {
      toast.error('You can only accept tasks assigned to you');
      return;
    }

    try {
      setLoading(true);
      setActionType('accept');
      
      console.log('✅ Accepting task:', task._id);
      
      const updatedTask = await acceptTask(task._id);
      
      if (updatedTask) {
        toast.success('🎉 Task accepted successfully!');
        
        // ✅ NOTIFY TASK CREATOR
        if (task.createdBy && task.createdBy !== user._id) {
          try {
            await createNotification({
              title: 'Task Accepted',
              message: `${user.name} accepted the task: "${task.title}"`,
              type: 'task_update',
              userId: task.createdBy,
              data: {
                taskId: task._id,
                taskTitle: task.title,
                action: 'accepted',
                acceptedBy: user.name
              }
            });
            console.log('📤 Acceptance notification sent to creator');
          } catch (notifError) {
            console.error('❌ Failed to send acceptance notification:', notifError);
          }
        }
        
        onUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('❌ Accept task error:', error);
      toast.error(`Failed to accept task: ${error.message}`);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  // ✅ ENHANCED REJECT FUNCTION WITH NOTIFICATIONS
  const handleReject = async () => {
    if (!canAssignedUserModify) {
      toast.error('You can only reject tasks assigned to you');
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      setActionType('reject');
      
      console.log('❌ Rejecting task:', task._id, 'Reason:', rejectionReason);
      
      const updatedTask = await rejectTask(task._id, rejectionReason);
      
      if (updatedTask) {
        toast.success('❌ Task rejected successfully!');
        
        // ✅ NOTIFY TASK CREATOR
        if (task.createdBy && task.createdBy !== user._id) {
          try {
            await createNotification({
              title: 'Task Rejected',
              message: `${user.name} rejected the task: "${task.title}". Reason: ${rejectionReason}`,
              type: 'task_update',
              userId: task.createdBy,
              data: {
                taskId: task._id,
                taskTitle: task.title,
                action: 'rejected',
                rejectedBy: user.name,
                rejectionReason: rejectionReason
              }
            });
            console.log('📤 Rejection notification sent to creator');
          } catch (notifError) {
            console.error('❌ Failed to send rejection notification:', notifError);
          }
        }
        
        setShowRejectModal(false);
        setRejectionReason('');
        onUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('❌ Reject task error:', error);
      toast.error(`Failed to reject task: ${error.message}`);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  // ✅ START TASK FUNCTION
  const handleStart = async () => {
    if (!canAssignedUserModify) {
      toast.error('You can only start tasks assigned to you');
      return;
    }

    try {
      setLoading(true);
      setActionType('start');
      
      console.log('🚀 Starting task:', task._id);
      
      const updatedTask = await updateTask(task._id, { 
        status: 'in-progress',
        startedAt: new Date().toISOString()
      });
      
      if (updatedTask) {
        toast.success('🚀 Task started successfully!');
        onUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('❌ Start task error:', error);
      toast.error(`Failed to start task: ${error.message}`);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  // ✅ COMPLETE TASK FUNCTION
  const handleComplete = async () => {
    if (!canAssignedUserModify) {
      toast.error('You can only complete tasks assigned to you');
      return;
    }

    try {
      setLoading(true);
      setActionType('complete');
      
      console.log('✅ Completing task:', task._id);
      
      const updatedTask = await updateTask(task._id, { 
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      if (updatedTask) {
        toast.success('🎉 Task completed successfully!');
        onUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('❌ Complete task error:', error);
      toast.error(`Failed to complete task: ${error.message}`);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  // ✅ PAUSE TASK FUNCTION
  const handlePause = async () => {
    if (!canAssignedUserModify) {
      toast.error('You can only pause tasks assigned to you');
      return;
    }

    try {
      setLoading(true);
      setActionType('pause');
      
      console.log('⏸️ Pausing task:', task._id);
      
      const updatedTask = await updateTask(task._id, { 
        status: 'pending',
        pausedAt: new Date().toISOString()
      });
      
      if (updatedTask) {
        toast.success('⏸️ Task paused successfully!');
        onUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('❌ Pause task error:', error);
      toast.error(`Failed to pause task: ${error.message}`);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  // ✅ REOPEN TASK FUNCTION
  const handleReopen = async () => {
    if (!canModify) {
      toast.error('You can only reopen tasks you created or are assigned to');
      return;
    }

    try {
      setLoading(true);
      setActionType('reopen');
      
      console.log('🔄 Reopening task:', task._id);
      
      const updatedTask = await updateTask(task._id, { 
        status: 'pending',
        reopenedAt: new Date().toISOString(),
        reopenedBy: user._id
      });
      
      if (updatedTask) {
        toast.success('🔄 Task reopened successfully!');
        onUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('❌ Reopen task error:', error);
      toast.error(`Failed to reopen task: ${error.message}`);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  // ✅ PRIORITY CHANGE FUNCTION
  const handlePriorityChange = async (newPriority) => {
    if (!canModify) {
      toast.error('You cannot change priority for this task');
      return;
    }

    try {
      setLoading(true);
      setActionType('priority');
      
      console.log('⚡ Changing task priority:', task._id, 'to', newPriority);
      
      const updatedTask = await updateTask(task._id, { 
        priority: newPriority,
        priorityChangedAt: new Date().toISOString(),
        priorityChangedBy: user._id
      });
      
      if (updatedTask) {
        toast.success(`⚡ Priority changed to ${newPriority}!`);
        onUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('❌ Priority change error:', error);
      toast.error(`Failed to change priority: ${error.message}`);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  // ✅ GET BUTTON STATE
  const isButtonLoading = (type) => loading && actionType === type;

  // ✅ PERMISSION CHECK COMPONENT
  if (!canModify) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-700 rounded">
        <span className="text-xs">📋 View Only</span>
        {showLabels && (
          <p className="text-xs mt-1">
            {isAssignedUser ? 'You are assigned to this task' : 'You created this task'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="task-actions space-y-3">
      {/* ✅ PRIMARY ACTION BUTTONS */}
      <div className="flex flex-wrap gap-2">
        {/* Accept Button */}
        {isTaskPending && canAssignedUserModify && (
          <button
            onClick={handleAccept}
            disabled={loading}
            className={`${buttonBaseClasses} bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md`}
          >
            {isButtonLoading('accept') ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                {showLabels && 'Accepting...'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                ✅ {showLabels && 'Accept'}
              </span>
            )}
          </button>
        )}

        {/* Reject Button */}
        {isTaskPending && canAssignedUserModify && (
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className={`${buttonBaseClasses} bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md`}
          >
            ❌ {showLabels && 'Reject'}
          </button>
        )}

        {/* Start Button */}
        {isTaskPending && canAssignedUserModify && (
          <button
            onClick={handleStart}
            disabled={loading}
            className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md`}
          >
            {isButtonLoading('start') ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                {showLabels && 'Starting...'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                🚀 {showLabels && 'Start'}
              </span>
            )}
          </button>
        )}

        {/* Complete Button */}
        {isTaskInProgress && canAssignedUserModify && (
          <button
            onClick={handleComplete}
            disabled={loading}
            className={`${buttonBaseClasses} bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md`}
          >
            {isButtonLoading('complete') ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                {showLabels && 'Completing...'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                ✅ {showLabels && 'Complete'}
              </span>
            )}
          </button>
        )}

        {/* Pause Button */}
        {isTaskInProgress && canAssignedUserModify && (
          <button
            onClick={handlePause}
            disabled={loading}
            className={`${buttonBaseClasses} bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm hover:shadow-md`}
          >
            {isButtonLoading('pause') ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                {showLabels && 'Pausing...'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                ⏸️ {showLabels && 'Pause'}
              </span>
            )}
          </button>
        )}

        {/* Reopen Button */}
        {(isTaskCompleted || isTaskRejected) && canModify && (
          <button
            onClick={handleReopen}
            disabled={loading}
            className={`${buttonBaseClasses} bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md`}
          >
            {isButtonLoading('reopen') ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                {showLabels && 'Reopening...'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                🔄 {showLabels && 'Reopen'}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ✅ PRIORITY SELECTOR */}
      {!isTaskCompleted && canModify && (
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600 dark:text-gray-300 font-medium">Priority:</label>
          <select
            value={task.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            disabled={loading}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="Low">🟢 Low</option>
            <option value="Medium">🟡 Medium</option>
            <option value="High">🔴 High</option>
          </select>
          {isButtonLoading('priority') && (
            <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* ✅ TASK STATUS DISPLAY */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded font-medium ${
            isTaskCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            isTaskInProgress ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            isTaskRejected ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            isTaskOverdue ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          
          <span className={`px-2 py-1 rounded font-medium ${
            task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {task.priority}
          </span>
        </div>

        {showLabels && (
          <div className="text-right">
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            {task.completedAt && (
              <p className="text-green-600">Completed: {new Date(task.completedAt).toLocaleDateString()}</p>
            )}
          </div>
        )}
      </div>

      {/* ✅ REJECTION REASON DISPLAY */}
      {isTaskRejected && task.rejectionReason && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            ❌ Rejection Reason:
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            {task.rejectionReason}
          </p>
          {task.rejectedAt && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Rejected on: {new Date(task.rejectedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* ✅ TASK HISTORY */}
      {showLabels && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
          {task.acceptedAt && (
            <p className="text-green-600">Accepted: {new Date(task.acceptedAt).toLocaleString()}</p>
          )}
          {task.startedAt && (
            <p className="text-blue-600">Started: {new Date(task.startedAt).toLocaleString()}</p>
          )}
          {task.pausedAt && (
            <p className="text-yellow-600">Paused: {new Date(task.pausedAt).toLocaleString()}</p>
          )}
          {task.reopenedAt && (
            <p className="text-purple-600">Reopened: {new Date(task.reopenedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      {/* ✅ REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              ❌ Reject Task: {task.title}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejecting this task..."
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be visible to the task creator and other stakeholders.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isButtonLoading('reject') ? (
                  <>
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    ❌ Reject Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskActions;
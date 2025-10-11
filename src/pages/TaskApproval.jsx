import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { toast } from 'react-toastify';

export const TaskApproval = () => {
  const { tasks, fetchTasks, updateTask, loading } = useTask();
  const { user } = useAuth();
  const { createNotification } = useNotification();
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [rejectedTasks, setRejectedTasks] = useState([]);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [activeTaskForRating, setActiveTaskForRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Load all tasks when component mounts (HOD can see all tasks)
  useEffect(() => {
    if (user && user.role === 'hod') {
      console.log('🔄 TaskApproval: Loading all tasks for HOD');
      fetchTasks(); // ✅ Fixed: fetchAllTasks → fetchTasks
    }
  }, [user, fetchTasks]);

  // Filter tasks that are submitted for approval
  const submittedTasks = tasks.filter(task => 
    task.status === 'ForApproval'
  );

  // Recently approved tasks from local state
  const recentlyApproved = approvedTasks.slice(-5); // Show last 5 approved

  // Open rating modal instead of immediate approve
  const handleApprove = (task) => {
    console.log('✅ TaskApproval: Opening rating modal for task:', task.title);
    setActiveTaskForRating(task);
    setRatingValue(5);
    setRatingComment('');
    setRatingModalOpen(true);
  };

  // Submit rating, update task status to completed and send notification
  const handleSubmitRating = async () => {
    if (!activeTaskForRating) return;
    const task = activeTaskForRating;
    try {
      // disable modal submit UI by keeping loading state from context if desired
      // Prepare rating payload
      const ratingPayload = {
        status: 'completed',
        rating: {
          score: Number(ratingValue) || 0,
          comment: ratingComment || '',
          ratedBy: user._id,
          ratedByName: user.name,
          ratedAt: new Date().toISOString()
        }
      };

      console.log('✅ Submitting rating and completing task:', task.title, ratingPayload.rating);

      // Update the task with rating and status
      await updateTask(task._id, ratingPayload);

      // Send notification to faculty that their task was approved with rating
      const facultyUserId = task.assignedTo?._id || task.assignedTo;
      if (createNotification && facultyUserId) {
        try {
          await createNotification({
            title: '✅ Task Approved & Rated',
            message: `Your task "${task.title}" was approved by ${user.name} and received a rating of ${ratingPayload.rating.score}/5.`,
            type: 'task_approved_rated',
            userId: facultyUserId,
            data: {
              taskId: task._id,
              taskTitle: task.title,
              status: 'completed',
              rating: ratingPayload.rating,
              approvedBy: user.name,
              approvedById: user._id,
              approvedAt: ratingPayload.rating.ratedAt
            }
          });
          console.log('🔔 Notification sent for rated approval');
        } catch (notifError) {
          console.error('❌ FAILED to send rated approval notification:', notifError);
        }
      }

      // Update local UI lists
      setApprovedTasks(prev => [...prev, { 
        ...task, 
        status: 'completed',
        rating: ratingPayload.rating,
        approvedAt: ratingPayload.rating.ratedAt
      }]);

      // Close modal
      setRatingModalOpen(false);
      setActiveTaskForRating(null);

      toast.success(`✅ Task "${task.title}" approved and rated (${ratingPayload.rating.score}/5)`);
    } catch (error) {
      console.error('❌ Error submitting rating for task approval:', error);
      toast.error('Failed to submit rating. Please try again.');
    }
  };

  const handleReject = async (task) => {
    try {
      console.log('❌ TaskApproval: Rejecting task:', task.title);
      
      // Update task status back to pending (sends it back to all tasks)
      await updateTask(task._id, { status: 'pending' });
      
      // Send notification to faculty that their task was rejected
      const facultyUserId = task.assignedTo?._id || task.assignedTo;
      
      if (createNotification && facultyUserId) {
        try {
          console.log(`📤 Sending rejection notification to faculty (${facultyUserId}) for task: ${task.title}`);
          console.log(`👤 Faculty info:`, {
            userId: facultyUserId,
            taskTitle: task.title,
            rejectedBy: user.name
          });
          
          await createNotification({
            title: '📝 Task Requires Revision',
            message: `Your task "${task.title}" has been sent back for revision by ${user.name}. Please review and resubmit when ready.`,
            type: 'task_rejected',
            userId: facultyUserId,
            data: {
              taskId: task._id,
              taskTitle: task.title,
              taskDescription: task.description,
              status: 'pending',
              rejectedBy: user.name,
              rejectedById: user._id,
              rejectedAt: new Date().toISOString(),
              priority: task.priority,
              category: task.category,
              dueDate: task.dueDate,
              reason: 'Requires revision and resubmission'
            }
          });
          
          console.log(`🔔 SUCCESS: Rejection notification sent to faculty (${facultyUserId}) for task "${task.title}"`);
          console.log(`📧 Notification details:`, {
            recipient: facultyUserId,
            taskTitle: task.title,
            rejectedBy: user.name,
            timestamp: new Date().toISOString()
          });
        } catch (notifError) {
          console.error('❌ FAILED to send rejection notification:', notifError);
          console.error('❌ Notification error details:', {
            taskId: task._id,
            facultyUserId,
            rejectedBy: user.name,
            error: notifError.message
          });
        }
      } else {
        console.warn('⚠️ Cannot send rejection notification:', {
          hasCreateNotification: !!createNotification,
          hasFacultyUserId: !!facultyUserId,
          facultyUserId,
          taskTitle: task.title
        });
      }
      
      // Add to local rejected tasks for tracking
      setRejectedTasks(prev => [...prev, { 
        ...task, 
        status: 'pending',
        rejectedAt: new Date().toISOString(),
        rejectedBy: user.name
      }]);
      
      console.log(`✅ Task "${task.title}" successfully rejected and sent back to pending status`);
      console.log(`📋 Task will now appear in faculty's task list for revision`);
      
      toast.success(`📝 Task "${task.title}" sent back for revision. Notification sent to faculty member.`);
      
    } catch (error) {
      console.error('❌ TaskApproval: Error rejecting task:', error);
      toast.error('Failed to reject task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-slate-900">
      <Header />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Task Approval Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Review and approve tasks submitted by faculty members
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {submittedTasks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {recentlyApproved.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Recently Approved</div>
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Loading tasks...</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Tasks Pending Approval - Takes 2 columns */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Tasks Awaiting Approval
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm ml-auto">
                    {submittedTasks.length}
                  </span>
                </h2>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {submittedTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks pending approval</h3>
                    <p className="text-gray-500 dark:text-gray-400">All submitted tasks have been reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {submittedTasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                      >
                        {/* Task Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {task.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {task.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Task ID: {task._id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Priority Badge */}
                          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                            {task.priority || 'Medium'} Priority
                          </div>
                        </div>

                        {/* Task Description */}
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Task Metadata */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned To</div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {task.assignedTo?.name || 'Unknown'}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {task.category || 'General'}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                              <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
                                Awaiting Review
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => handleApprove(task)}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {loading ? 'Approving...' : 'Approve & Complete'}
                          </button>
                          <button
                            onClick={() => handleReject(task)}
                            disabled={loading}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Send Back
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recently Approved Tasks - Takes 1 column */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-fit">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Recently Approved
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm ml-auto">
                    {recentlyApproved.length}
                  </span>
                </h2>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {recentlyApproved.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No approved tasks</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Approved tasks will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentlyApproved.map((task) => (
                      <div
                        key={task._id}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <span className="text-xs text-green-700 dark:text-green-400 font-bold uppercase tracking-wide">
                              APPROVED
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {task.approvedAt ? new Date(task.approvedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">
                          {task.title}
                        </h4>
                        
                        {/* Rating Display */}
                        {task.rating && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= task.rating.score 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                  fill={star <= task.rating.score ? 'currentColor' : 'none'}
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                              {task.rating.score}/5
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>ID: {task._id.slice(-8).toUpperCase()}</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Rating Comment Preview */}
                        {task.rating?.comment && (
                          <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              "{task.rating.comment.substring(0, 80)}{task.rating.comment.length > 80 ? '...' : ''}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modern Rating Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 transform animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="relative px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rate Task Performance</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {activeTaskForRating?.title && `"${activeTaskForRating.title}"`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setRatingModalOpen(false); setActiveTaskForRating(null); }}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-4 space-y-8">
              {/* Star Rating Section */}
              <div className="text-center">
                <label className="text-lg font-semibold text-gray-900 dark:text-white block mb-4">
                  How would you rate this task?
                </label>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      onMouseEnter={() => setRatingValue(star)}
                      className="group transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-full"
                    >
                      <svg 
                        className={`w-12 h-12 transition-all duration-200 ${
                          star <= ratingValue 
                            ? 'text-yellow-400 fill-current drop-shadow-lg' 
                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                        }`}
                        fill={star <= ratingValue ? 'currentColor' : 'none'}
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-yellow-500">{ratingValue}</span>
                  <span className="text-lg text-gray-500 dark:text-gray-400">/ 5</span>
                  <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                    {ratingValue === 5 ? 'Excellent' : 
                     ratingValue === 4 ? 'Very Good' : 
                     ratingValue === 3 ? 'Good' : 
                     ratingValue === 2 ? 'Fair' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Task Info Card */}
              {activeTaskForRating && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {activeTaskForRating.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                        {activeTaskForRating.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Submitted by: <span className="font-medium">{activeTaskForRating.assignedTo?.name || 'Unknown'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Due Date</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {new Date(activeTaskForRating.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comment Section */}
              <div>
                <label className="text-lg font-semibold text-gray-900 dark:text-white block mb-3">
                  Add your feedback (optional)
                </label>
                <div className="relative">
                  <textarea 
                    value={ratingComment} 
                    onChange={(e) => setRatingComment(e.target.value)} 
                    rows={4} 
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 resize-none"
                    placeholder="Share your thoughts on the task quality, completion time, or any suggestions for improvement..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {ratingComment.length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => { setRatingModalOpen(false); setActiveTaskForRating(null); }}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitRating}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Submit Rating & Complete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

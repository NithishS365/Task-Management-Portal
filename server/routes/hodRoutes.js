const express = require('express');
const router = express.Router();
const { 
  getOverdueAnalytics,
  getExtensionRequests,
  approveExtensionRequest,
  reassignTask,
  rejectExtensionRequest
} = require('../controllers/hodController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all HOD routes
router.use(authMiddleware);

/**
 * @route   GET /api/hod/analytics/overdue-tasks
 * @desc    Get overdue task analytics for HOD dashboard
 * @access  Private (HOD only)
 */
router.get('/analytics/overdue-tasks', getOverdueAnalytics);

/**
 * @route   GET /api/hod/requests/overdue
 * @desc    Get all extension requests for HOD review
 * @access  Private (HOD only)
 * @params  page, limit, status, sortBy, sortOrder
 */
router.get('/requests/overdue', getExtensionRequests);

/**
 * @route   PUT /api/hod/requests/overdue/:requestId/approve
 * @desc    Approve extension request and update task due date
 * @access  Private (HOD only)
 * @body    newDueDate, comments
 */
router.put('/requests/overdue/:requestId/approve', approveExtensionRequest);

/**
 * @route   PUT /api/hod/requests/overdue/:requestId/reassign
 * @desc    Reassign task to different staff member
 * @access  Private (HOD only)
 * @body    newStaffId, penaltyFlag, comments, newDueDate
 */
router.put('/requests/overdue/:requestId/reassign', reassignTask);

/**
 * @route   PUT /api/hod/requests/overdue/:requestId/reject
 * @desc    Reject extension request
 * @access  Private (HOD only)
 * @body    comments
 */
router.put('/requests/overdue/:requestId/reject', rejectExtensionRequest);

module.exports = router;
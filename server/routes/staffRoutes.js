const express = require('express');
const router = express.Router();
const { 
  getOverdueTasks, 
  submitExtensionRequest, 
  getExtensionRequests 
} = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all staff routes
router.use(authMiddleware);

/**
 * @route   GET /api/staff/tasks/overdue
 * @desc    Get overdue tasks for authenticated staff user
 * @access  Private (Staff only)
 * @params  page, limit, sortBy, sortOrder
 */
router.get('/tasks/overdue', getOverdueTasks);

/**
 * @route   POST /api/staff/requests/extensions
 * @desc    Submit extension request for overdue task
 * @access  Private (Staff only)
 * @body    taskId, reason, customReason, requestedDueDate, supportingFiles
 */
router.post('/requests/extensions', submitExtensionRequest);

/**
 * @route   GET /api/staff/requests/extensions
 * @desc    Get extension request history for authenticated staff
 * @access  Private (Staff only)
 * @params  page, limit, status, sortBy, sortOrder
 */
router.get('/requests/extensions', getExtensionRequests);

module.exports = router;
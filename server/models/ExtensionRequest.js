const mongoose = require('mongoose');

const extensionRequestSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'technical_issues',
      'resource_unavailable', 
      'scope_change',
      'dependency_delay',
      'personal_emergency',
      'workload_conflict',
      'other'
    ]
  },
  reasonLabel: {
    type: String,
    required: true
  },
  customReason: {
    type: String,
    default: ''
  },
  originalDueDate: {
    type: Date,
    required: true
  },
  requestedDueDate: {
    type: Date,
    required: true
  },
  approvedDueDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reassigned'],
    default: 'pending'
  },
  comments: {
    type: String,
    default: ''
  },
  hodComments: {
    type: String,
    default: ''
  },
  supportingFiles: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String
  }],
  // For reassignment cases
  reassignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  penaltyApplied: {
    type: Boolean,
    default: false
  },
  // Audit fields
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
extensionRequestSchema.index({ staffId: 1, status: 1 });
extensionRequestSchema.index({ hodId: 1, status: 1 });
extensionRequestSchema.index({ taskId: 1 });
extensionRequestSchema.index({ submittedAt: -1 });

// Virtual for populated task title
extensionRequestSchema.virtual('taskTitle', {
  ref: 'Task',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated staff name
extensionRequestSchema.virtual('staffName', {
  ref: 'User',
  localField: 'staffId', 
  foreignField: '_id',
  justOne: true
});

// Enable virtual fields in JSON
extensionRequestSchema.set('toJSON', { virtuals: true });
extensionRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ExtensionRequest', extensionRequestSchema);
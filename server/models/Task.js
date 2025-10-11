import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'rejected', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  // ✅ ADD REJECTION FIELDS
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: ''
  },
  // ✅ ADD ACCEPTANCE FIELDS
  acceptedAt: {
    type: Date,
    default: null
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // ✅ ADD EXTENSION APPROVAL FIELDS
  extensionApproved: {
    type: Boolean,
    default: false
  },
  extensionApprovedAt: {
    type: Date,
    default: null
  },
  extensionComments: {
    type: String,
    trim: true,
    default: ''
  },
  // ✅ ADD OVERDUE TRACKING FIELDS
  wasOverdue: {
    type: Boolean,
    default: false
  },
  originalDueDate: {
    type: Date,
    default: null
  },
  // ✅ ADD REASSIGNMENT TRACKING FIELDS
  reassigned: {
    type: Boolean,
    default: false
  },
  reassignedAt: {
    type: Date,
    default: null
  },
  reassignedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reassignmentReason: {
    type: String,
    trim: true,
    default: ''
  },
  penaltyApplied: {
    type: Boolean,
    default: false
  },
  // ✅ ADD PERFORMANCE SCORING FIELDS
  submissionDate: {
    type: Date,
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  hodRating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    ratedByName: {
      type: String,
      default: ''
    },
    ratedAt: {
      type: Date,
      default: null
    }
  },
  submissionRating: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  completionDescription: {
    type: String,
    trim: true,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: null
  },
  files: [{
    name: String,
    size: Number,
    type: String,
    lastModified: Number
  }],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model('Task', taskSchema);
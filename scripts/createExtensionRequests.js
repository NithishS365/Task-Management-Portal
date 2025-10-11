import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Extension Request Schema
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

const ExtensionRequest = mongoose.model('ExtensionRequest', extensionRequestSchema);

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['hod', 'faculty'], required: true },
  department: String,
  designation: String,
  phone: String,
  qualification: String,
  experience: String,
  bio: String,
  linkedinId: String,
  imageUrl: { type: String, default: 'https://via.placeholder.com/150' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'ForApproval'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: { type: Date, required: true },
  submittedAt: Date,
  completedAt: Date,
  comments: String,
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String
  }]
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);

const reasonLabels = {
  'technical_issues': 'Technical Difficulties',
  'resource_unavailable': 'Resources Unavailable',
  'scope_change': 'Scope Change Required',
  'dependency_delay': 'Dependency Delays',
  'personal_emergency': 'Personal Emergency',
  'workload_conflict': 'Workload Conflicts',
  'other': 'Other'
};

const createExtensionRequests = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://antonyluke001_db_user:ando14960@cluster0.4qj7kfi.mongodb.net/taskmanagement?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get users and tasks
    const hod = await User.findOne({ role: 'hod' });
    const faculty = await User.find({ role: 'faculty' });
    const overdueTasks = await Task.find({ dueDate: { $lt: new Date() } }).populate('assignedTo');
    
    if (!hod || faculty.length === 0 || overdueTasks.length === 0) {
      console.log('❌ Insufficient data. Please ensure users and overdue tasks exist.');
      return;
    }
    
    console.log('📊 Found data:', {
      hod: hod.name,
      faculty: faculty.length,
      overdueTasks: overdueTasks.length
    });
    
    // Clear existing extension requests
    await ExtensionRequest.deleteMany({});
    console.log('🗑️  Cleared existing extension requests');
    
    // Create extension requests for overdue tasks
    const extensionRequests = [];
    
    for (let i = 0; i < Math.min(overdueTasks.length, 3); i++) {
      const task = overdueTasks[i];
      const reasons = ['technical_issues', 'resource_unavailable', 'scope_change', 'dependency_delay'];
      const reason = reasons[i % reasons.length];
      
      // Calculate request date (a few days after the original due date)
      const requestedDate = new Date(task.dueDate);
      requestedDate.setDate(requestedDate.getDate() + 7); // Request 1 week extension
      
      const request = {
        taskId: task._id,
        staffId: task.assignedTo._id,
        hodId: hod._id,
        reason: reason,
        reasonLabel: reasonLabels[reason],
        customReason: reason === 'other' ? 'Additional custom reason details' : '',
        originalDueDate: task.dueDate,
        requestedDueDate: requestedDate,
        status: 'pending',
        comments: `Extension request for ${task.title} due to ${reasonLabels[reason].toLowerCase()}`,
        submittedAt: new Date()
      };
      
      extensionRequests.push(request);
    }
    
    // Insert extension requests
    const insertedRequests = await ExtensionRequest.insertMany(extensionRequests);
    
    console.log(`✅ Created ${insertedRequests.length} extension requests`);
    
    // Display summary
    console.log('\n📋 EXTENSION REQUESTS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const request of insertedRequests) {
      const task = overdueTasks.find(t => t._id.toString() === request.taskId.toString());
      const staff = faculty.find(f => f._id.toString() === request.staffId.toString());
      
      console.log(`${task.title.padEnd(35)} | ${staff.name.padEnd(25)} | ${request.reasonLabel.padEnd(20)} | ${request.status.toUpperCase()}`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🎯 Extension Requests Ready!');
    console.log('💡 You can now test the HOD Overdue page with real extension request data.');
    console.log('📝 Login as HOD and navigate to HodOverdue page to see and manage requests.');
    
  } catch (error) {
    console.error('❌ Error creating extension requests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createExtensionRequests();
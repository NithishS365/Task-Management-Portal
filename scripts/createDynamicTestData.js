import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
    enum: ['pending', 'in-progress', 'ForApproval', 'completed', 'rejected'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  category: { type: String, default: 'general' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  notes: { type: String },
  attachments: [{ type: String }]
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);

// Extension Request Schema
const ExtensionRequestSchema = new mongoose.Schema({
  taskId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  },
  taskTitle: { type: String, required: true },
  requestedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  requestedByName: { type: String, required: true },
  requestedByEmail: { type: String, required: true },
  originalDueDate: { type: Date, required: true },
  requestedDueDate: { type: Date, required: true },
  reason: { 
    type: String, 
    enum: ['personal_emergency', 'technical_issues', 'workload', 'scope_change', 'resource_unavailable', 'other'],
    required: true 
  },
  reasonLabel: { type: String, required: true },
  customReason: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewComments: { type: String, default: '' },
  approvedDueDate: { type: Date },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  attachments: [{ type: String }]
}, { timestamps: true });

const ExtensionRequest = mongoose.model('ExtensionRequest', ExtensionRequestSchema);

async function createDynamicTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the HOD user
    const hod = await User.findOne({ role: 'hod' });
    if (!hod) {
      console.log('❌ No HOD user found. Please run migrateData.js first.');
      return;
    }

    // Find faculty users
    const facultyUsers = await User.find({ role: 'faculty' }).limit(3);
    if (facultyUsers.length === 0) {
      console.log('❌ No faculty users found. Please run migrateData.js first.');
      return;
    }

    console.log(`🧑‍💼 Found HOD: ${hod.name}`);
    console.log(`👥 Found ${facultyUsers.length} faculty users`);

    // Create some overdue tasks
    const overdueDate1 = new Date();
    overdueDate1.setDate(overdueDate1.getDate() - 5); // 5 days overdue

    const overdueDate2 = new Date();
    overdueDate2.setDate(overdueDate2.getDate() - 3); // 3 days overdue

    const overdueDate3 = new Date();
    overdueDate3.setDate(overdueDate3.getDate() - 7); // 7 days overdue

    const tasksToCreate = [
      {
        title: 'Implement User Authentication System',
        description: 'Create a secure user authentication system with JWT tokens and role-based access control.',
        assignedBy: hod._id,
        assignedTo: facultyUsers[0]._id,
        status: 'in-progress',
        priority: 'high',
        category: 'development',
        dueDate: overdueDate1
      },
      {
        title: 'Database Schema Optimization',
        description: 'Optimize the existing database schema for better performance and scalability.',
        assignedBy: hod._id,
        assignedTo: facultyUsers[1]._id,
        status: 'pending',
        priority: 'medium',
        category: 'database',
        dueDate: overdueDate2
      },
      {
        title: 'API Documentation Update',
        description: 'Update the API documentation to reflect recent changes and improvements.',
        assignedBy: hod._id,
        assignedTo: facultyUsers[2]._id,
        status: 'in-progress',
        priority: 'low',
        category: 'documentation',
        dueDate: overdueDate3
      },
      {
        title: 'Frontend UI Enhancement',
        description: 'Enhance the user interface with modern design patterns and improved UX.',
        assignedBy: hod._id,
        assignedTo: facultyUsers[0]._id,
        status: 'pending',
        priority: 'medium',
        category: 'frontend',
        dueDate: overdueDate1
      }
    ];

    // Create tasks
    const createdTasks = [];
    for (const taskData of tasksToCreate) {
      const task = new Task(taskData);
      const savedTask = await task.save();
      createdTasks.push(savedTask);
      console.log(`📋 Created overdue task: ${savedTask.title}`);
    }

    // Create extension requests for some of the overdue tasks
    const extensionRequests = [
      {
        taskId: createdTasks[0]._id,
        taskTitle: createdTasks[0].title,
        requestedBy: facultyUsers[0]._id,
        requestedByName: facultyUsers[0].name,
        requestedByEmail: facultyUsers[0].email,
        originalDueDate: createdTasks[0].dueDate,
        requestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        reason: 'technical_issues',
        reasonLabel: 'Technical Difficulties',
        customReason: 'Encountered unexpected issues with third-party authentication providers',
        status: 'pending'
      },
      {
        taskId: createdTasks[1]._id,
        taskTitle: createdTasks[1].title,
        requestedBy: facultyUsers[1]._id,
        requestedByName: facultyUsers[1].name,
        requestedByEmail: facultyUsers[1].email,
        originalDueDate: createdTasks[1].dueDate,
        requestedDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        reason: 'scope_change',
        reasonLabel: 'Scope Change Required',
        customReason: 'Additional requirements discovered during analysis phase',
        status: 'pending'
      },
      {
        taskId: createdTasks[2]._id,
        taskTitle: createdTasks[2].title,
        requestedBy: facultyUsers[2]._id,
        requestedByName: facultyUsers[2].name,
        requestedByEmail: facultyUsers[2].email,
        originalDueDate: createdTasks[2].dueDate,
        requestedDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        reason: 'workload',
        reasonLabel: 'Workload Conflicts',
        customReason: 'Currently handling multiple high-priority tasks',
        status: 'approved', // Already approved
        reviewedBy: hod._id,
        reviewComments: 'Approved due to valid workload concerns',
        approvedDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date()
      }
    ];

    // Create extension requests
    for (const requestData of extensionRequests) {
      const request = new ExtensionRequest(requestData);
      const savedRequest = await request.save();
      console.log(`📝 Created extension request: ${savedRequest.taskTitle} (${savedRequest.status})`);
    }

    console.log('🎉 Dynamic test data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`• Created ${createdTasks.length} overdue tasks`);
    console.log(`• Created ${extensionRequests.length} extension requests`);
    console.log(`• Pending requests: ${extensionRequests.filter(r => r.status === 'pending').length}`);
    console.log(`• Approved requests: ${extensionRequests.filter(r => r.status === 'approved').length}`);
    
    console.log('\n🔧 Test the dynamic data:');
    console.log('1. Login as HOD: mmohammedmustafa@aidscollege.edu / TmpHOD@123');
    console.log('2. Navigate to HodOverdue page');
    console.log('3. See real analytics and extension requests!');

  } catch (error) {
    console.error('❌ Error creating dynamic test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📝 Disconnected from MongoDB');
  }
}

// Run the script
createDynamicTestData();
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  priority: String,
  dueDate: Date,
  category: String
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);

const ExtensionRequestSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  taskTitle: String,
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedByName: String,
  requestedByEmail: String,
  originalDueDate: Date,
  requestedDueDate: Date,
  reason: String,
  reasonLabel: String,
  customReason: String,
  status: String,
  submittedAt: Date
}, { timestamps: true });

const ExtensionRequest = mongoose.model('ExtensionRequest', ExtensionRequestSchema);

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const currentDate = new Date();
    
    // Check overdue tasks
    const overdueTasks = await Task.find({
      dueDate: { $lt: currentDate },
      status: { $nin: ['completed', 'submitted'] }
    }).populate('assignedTo', 'name email').populate('assignedBy', 'name email');
    
    console.log(`📊 Found ${overdueTasks.length} overdue tasks in database:`);
    overdueTasks.forEach(task => {
      console.log(`- ${task.title} (assigned to: ${task.assignedTo?.name}, due: ${task.dueDate.toDateString()})`);
    });
    
    // Check extension requests
    const extensionRequests = await ExtensionRequest.find({});
    console.log(`\n📝 Found ${extensionRequests.length} extension requests in database:`);
    extensionRequests.forEach(req => {
      console.log(`- ${req.taskTitle} (${req.status}) by ${req.requestedByName}`);
    });
    
    // Check all tasks
    const allTasks = await Task.find({}).populate('assignedTo', 'name').populate('assignedBy', 'name');
    console.log(`\n📋 Total tasks in database: ${allTasks.length}`);
    
    await mongoose.disconnect();
    console.log('\n📝 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabase();
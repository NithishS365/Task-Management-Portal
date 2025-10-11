import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

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

const createTestTasks = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://antonyluke001_db_user:ando14960@cluster0.4qj7kfi.mongodb.net/taskmanagement?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get users
    const hod = await User.findOne({ role: 'hod' });
    const faculty = await User.find({ role: 'faculty' }).limit(3);
    
    if (!hod || faculty.length === 0) {
      console.log('❌ No users found. Please run migration first.');
      return;
    }
    
    console.log('👥 Found users:', {
      hod: hod.name,
      faculty: faculty.map(f => f.name)
    });
    
    // Clear existing tasks
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing tasks');
    
    // Create overdue tasks (past due dates)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const overdueTasks = [
      {
        title: 'Implement User Authentication Module',
        description: 'Create a comprehensive user authentication system with login, logout, and session management features.',
        assignedBy: hod._id,
        assignedTo: faculty[0]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: yesterday,
        comments: 'This is a critical component for the system security.'
      },
      {
        title: 'Design Database Schema',
        description: 'Create and document the complete database schema for the task management system.',
        assignedBy: hod._id,
        assignedTo: faculty[1]._id,
        status: 'pending',
        priority: 'medium',
        dueDate: threeDaysAgo,
        comments: 'Include all necessary relationships and constraints.'
      },
      {
        title: 'Create API Documentation',
        description: 'Document all REST API endpoints with request/response examples and error codes.',
        assignedBy: hod._id,
        assignedTo: faculty[2]._id,
        status: 'in-progress',
        priority: 'medium',
        dueDate: oneWeekAgo,
        comments: 'Use OpenAPI specification format.'
      }
    ];
    
    // Create future tasks (not overdue)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const futureTasks = [
      {
        title: 'Implement Task Dashboard',
        description: 'Create a responsive dashboard showing task statistics and charts.',
        assignedBy: hod._id,
        assignedTo: faculty[0]._id,
        status: 'pending',
        priority: 'medium',
        dueDate: tomorrow,
        comments: 'Use Chart.js or similar library for visualizations.'
      },
      {
        title: 'Write Unit Tests',
        description: 'Create comprehensive unit tests for all API endpoints and core functionality.',
        assignedBy: hod._id,
        assignedTo: faculty[1]._id,
        status: 'pending',
        priority: 'high',
        dueDate: nextWeek,
        comments: 'Aim for at least 80% code coverage.'
      }
    ];
    
    // Insert all tasks
    const allTasks = [...overdueTasks, ...futureTasks];
    const insertedTasks = await Task.insertMany(allTasks);
    
    console.log(`✅ Created ${insertedTasks.length} test tasks`);
    console.log(`📊 Overdue tasks: ${overdueTasks.length}`);
    console.log(`📊 Future tasks: ${futureTasks.length}`);
    
    // Display task summary
    console.log('\n📋 TASK SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const task of insertedTasks) {
      const assignedToUser = await User.findById(task.assignedTo);
      const isOverdue = task.dueDate < now;
      const status = isOverdue ? '🔴 OVERDUE' : '🟢 ON TIME';
      
      console.log(`${task.title.padEnd(40)} | ${assignedToUser.name.padEnd(25)} | ${task.priority.padEnd(8)} | ${status}`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🎯 Test Data Ready!');
    console.log('💡 You can now test the extension request functionality with the overdue tasks.');
    console.log('📝 Login with faculty credentials and navigate to StaffOverdue page.');
    
  } catch (error) {
    console.error('❌ Error creating test tasks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTestTasks();
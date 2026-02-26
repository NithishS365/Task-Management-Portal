import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Task Management Server...');
console.log(`🌐 Port: ${PORT}`);
console.log(`📱 Frontend URL: http://localhost:5173`);

// ✅ USER SCHEMA (Match your migration script)
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
  imageUrl: { type: String, default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// ✅ TASK SCHEMA
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
  attachments: [{ type: String }],
  
  // ✅ NEW: Reallocation tracking fields
  wasOverdue: { type: Boolean, default: false },
  originalDueDate: { type: Date },
  extensionApproved: { type: Boolean, default: false },
  extensionApprovedAt: { type: Date },
  extensionComments: { type: String },
  reallocated: { type: Boolean, default: false },
  reallocationDate: { type: Date },
  reallocationReason: { type: String },
  
  // ✅ NEW: Reassignment tracking fields  
  reassigned: { type: Boolean, default: false },
  reassignedAt: { type: Date },
  reassignedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reassignmentReason: { type: String },
  penaltyApplied: { type: Boolean, default: false },
  
  lastModified: { type: Date, default: Date.now }
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);

// ✅ NOTIFICATION SCHEMA
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['task_submitted', 'task_approved', 'task_rejected', 'task_assigned', 'task_reallocated', 'task_reallocated_to_you', 'general'],
    default: 'general'
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date }
}, { timestamps: true });

const NotificationModel = mongoose.model('Notification', NotificationSchema);

// ✅ EXTENSION REQUEST SCHEMA
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
    enum: [
      'technical_issues',
      'resource_unavailable', 
      'scope_change',
      'dependency_delay',
      'personal_emergency',
      'workload_conflict',
      'other'
    ],
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
  attachments: [{ type: String }] // For supporting documents
}, { timestamps: true });

const ExtensionRequest = mongoose.model('ExtensionRequest', ExtensionRequestSchema);

// ✅ MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://taskrise-v1.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ REQUEST LOGGING
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ AUTHENTICATION MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // For now, extract user ID from token (simplified - in production use JWT)
    if (token.startsWith('jwt-token-placeholder-')) {
      const userEmail = token.replace('jwt-token-placeholder-', '');
      console.log('🔍 Auth: Extracting email from token:', userEmail);
      
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        console.log('❌ Auth: User not found for email:', userEmail);
        return res.status(401).json({
          success: false,
          message: 'Invalid token - user not found'
        });
      }
      
      console.log('✅ Auth: User authenticated:', user.email, user.role);
      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        _id: user._id
      };
      
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// ✅ DATABASE CONNECTION
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      console.log('🔗 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected');
      console.log(`📁 Database: ${mongoose.connection.name}`);
    } else {
      console.log('⚠️  No MongoDB URI found, running without database');
    }
  } catch (error) {
    console.log('⚠️  MongoDB connection failed, continuing without database:', error.message);
  }
};

// ✅ ROUTES
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management Portal API is running!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy!',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ✅ REAL DATABASE LOGIN (Using your migrated data)
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', req.body?.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    // ✅ FIND USER IN DATABASE BY EMAIL OR USERNAME (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // ✅ CHECK PASSWORD (Plain text comparison for now, since your migration doesn't hash)
    if (user.password !== password) {
      console.log('❌ Password invalid for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // ✅ UPDATE LAST LOGIN
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ Login successful for:', email);
    res.json({
      success: true,
      message: 'Login successful',
      token: 'jwt-token-placeholder-' + user.email,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        username: user.username,
        phone: user.phone,
        qualification: user.qualification,
        experience: user.experience,
        bio: user.bio,
        imageUrl: user.imageUrl
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ✅ GET ALL USERS (For debugging)
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// ✅ GET CREDENTIALS (For debugging)
app.get('/api/debug/credentials', async (req, res) => {
  try {
    const users = await User.find({}).select('email password name role department');
    res.json({
      success: true,
      message: 'Login credentials (for testing only)',
      credentials: users.map(user => ({
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        department: user.department
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching credentials'
    });
  }
});
// Add this endpoint after your existing debug endpoints (around line 200)

// ✅ QUICK DATABASE CHECK ENDPOINT
app.get('/api/debug/database', async (req, res) => {
  try {
    console.log('🔍 Running database verification...');
    
    const allUsers = await User.find({});
    const faculty = await User.find({ role: 'faculty' });
    const hods = await User.find({ role: 'hod' });
    
    console.log(`📊 Database stats: ${allUsers.length} total, ${faculty.length} faculty, ${hods.length} HODs`);
    
    if (allUsers.length === 0) {
      return res.json({
        success: false,
        message: 'No users found in database',
        action: 'Run migration: node scripts/migrateData.js',
        stats: { total: 0, faculty: 0, hods: 0 },
        users: []
      });
    }
    
    // Check for the specific failing user
    const testEmail = 'gshobana@aidscollege.edu';
    const testUser = await User.findOne({ email: testEmail });
    
    res.json({
      success: true,
      message: 'Database verification complete',
      stats: {
        total: allUsers.length,
        faculty: faculty.length,
        hods: hods.length
      },
      testUser: testUser ? {
        found: true,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role
      } : {
        found: false,
        searchedEmail: testEmail
      },
      users: allUsers.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }))
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: error.message
    });
  }
});
// ✅ OTHER ENDPOINTS
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Register endpoint working',
    data: req.body
  });
});

// ✅ GET CURRENT USER PROFILE
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    console.log('👤 Profile endpoint accessed for user:', req.user?.email);
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Map user fields to match Profile component expectations
    const profileData = {
      // Original user fields
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      qualification: user.qualification,
      experience: user.experience,
      bio: user.bio,
      linkedinId: user.linkedinId,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      
      // Map to Profile component expected fields
      t_name: user.name,
      img_url: user.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
      design: user.designation || 'Faculty',
      dep: user.department || 'General',
      phone: user.phone,
      email: user.email,
      username: user.username,
      linked_in_id: user.linkedinId,
      exp: user.experience,
      qual: user.qualification,
      bio: user.bio
    };

    console.log('📋 Profile data being sent for:', user.email);
    res.json(profileData);
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ CHANGE PASSWORD ENDPOINT
app.put('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    console.log('🔐 Change password request for user:', req.user?.email);
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: 'New password must be at least 3 characters long' 
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    console.log('🔍 Debug - User found:', user.email);
    console.log('🔍 Debug - User password:', user.password);
    console.log('🔍 Debug - Current password provided:', currentPassword);

    // ✅ CHECK PASSWORD (Plain text comparison to match login logic)
    if (user.password !== currentPassword) {
      console.log('❌ Debug - Password comparison failed');
      return res.status(400).json({ 
        success: false,
        error: 'Current password is incorrect' 
      });
    }

    console.log('✅ Debug - Password comparison successful');

    // Note: Storing new password as plain text to match existing system
    // In production, you should hash passwords with bcrypt
    await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
      lastLogin: new Date()
    });

    console.log('✅ Password changed successfully for user:', user.email);
    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

app.get('/api/notifications/me', (req, res) => {
  console.log('📬 Notifications endpoint accessed');
  res.json({
    success: true,
    message: 'Notifications endpoint working',
    notifications: [],
    unreadCount: 0
  });
});

app.get('/api/tasks/stats', (req, res) => {
  console.log('📊 Task stats endpoint accessed');
  res.json({
    success: true,
    stats: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0
    }
  });
});

app.get('/api/users/profile', (req, res) => {
  console.log('👤 User profile endpoint accessed');
  res.json({
    success: true,
    user: {
      _id: '67890',
      name: 'Mohammed Mustafa',
      email: 'mmohammedmustafa@aidscollege.edu',
      role: 'hod',
      department: 'Computer Science',
      designation: 'Head of Department'
    }
  });
});

app.get('/api/dashboard', (req, res) => {
  console.log('📊 Dashboard data endpoint accessed');
  res.json({
    success: true,
    data: {
      tasks: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
      },
      notifications: {
        unread: 0,
        total: 0
      },
      recentActivity: []
    }
  });
});

app.get('/api/tasks', async (req, res) => {
  try {
    console.log('📋 Fetching all tasks from database...');
    
    const tasks = await Task.find({})
      .populate('assignedBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${tasks.length} tasks`);
    
    res.json({ 
      success: true, 
      tasks: tasks,
      count: tasks.length,
      message: `Found ${tasks.length} tasks` 
    });
    
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
      tasks: [],
      count: 0
    });
  }
});

// ✅ CREATE TASK (POST /api/tasks)
app.post('/api/tasks', async (req, res) => {
  try {
    console.log('📋 Task creation request received:', req.body);
    
    const { title, description, assignedTo, category, priority, dueDate, assignedBy } = req.body;
    
    // ✅ VALIDATION
    if (!title || !description || !assignedTo || !assignedBy) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, assignedTo, and assignedBy are required'
      });
    }

    // ✅ VERIFY USERS EXIST
    const assignedByUser = await User.findById(assignedBy);
    const assignedToUser = await User.findById(assignedTo);
    
    if (!assignedByUser || !assignedToUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignedBy or assignedTo user ID'
      });
    }

    // ✅ CREATE TASK
    const newTask = new Task({
      title,
      description,
      assignedBy,
      assignedTo,
      category: category || 'general',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending'
    });

    const savedTask = await newTask.save();
    
    // ✅ POPULATE USER DETAILS
    const populatedTask = await Task.findById(savedTask._id)
      .populate('assignedBy', 'name email role department')
      .populate('assignedTo', 'name email role department');

    console.log('✅ Task created successfully:', savedTask._id);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });

  } catch (error) {
    console.error('❌ Task creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// ✅ UPDATE TASK (PUT /api/tasks/:id)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    console.log('📝 Task update request received:', req.params.id, req.body);
    
    const taskId = req.params.id;
    const updateData = req.body;
    
    // ✅ VERIFY TASK EXISTS
    const existingTask = await Task.findById(taskId);
    
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // ✅ UPDATE TASK
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run mongoose validators
      }
    ).populate('assignedBy', 'name email role department')
     .populate('assignedTo', 'name email role department');

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    console.log('✅ Task updated successfully:', updatedTask._id);
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('❌ Task update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
});

// ✅ DELETE TASK (DELETE /api/tasks/:id)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    console.log('🗑️ Task delete request received:', req.params.id);
    
    const taskId = req.params.id;
    
    // ✅ VERIFY TASK EXISTS AND DELETE
    const deletedTask = await Task.findByIdAndDelete(taskId);
    
    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    console.log('✅ Task deleted successfully:', taskId);
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      taskId: taskId
    });

  } catch (error) {
    console.error('❌ Task delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    console.log('👥 Fetching all users from MongoDB...');
    
    // Get all users from database
    const users = await User.find({}).select('-password');
    
    console.log(`📊 Found ${users.length} users in database`);
    
    // Format users for frontend compatibility
    const formattedUsers = users.map(user => ({
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.fullName || user.name, // Use fullName as primary, fallback to name
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      qualification: user.qualification,
      experience: user.experience,
      bio: user.bio,
      linkedinId: user.linkedinId,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      penaltyCount: user.penaltyCount || 0
    }));
    
    res.json({ 
      success: true, 
      users: formattedUsers,
      count: formattedUsers.length,
      message: `Found ${formattedUsers.length} users`
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
      users: [],
      count: 0
    });
  }
});
// ...existing code...

// ✅ ADD FACULTY ENDPOINT (after the users endpoint)
app.get('/api/users/faculty', authMiddleware, async (req, res) => {
  try {
    console.log('👩‍🏫 Fetching faculty users from MongoDB...');
    
    // Check if user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only HOD can view faculty list.'
      });
    }
    
    const faculty = await User.find({ role: 'faculty' }).select('-password');
    
    console.log(`📊 Found ${faculty.length} faculty members`);
    
    const formattedFaculty = faculty.map(user => ({
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.name || user.fullName, // Support both name and fullName
      name: user.name,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      qualification: user.qualification,
      experience: user.experience,
      bio: user.bio,
      linkedinId: user.linkedinId,
      profileImage: user.imageUrl,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
      employeeId: user.employeeId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedFaculty, // Changed from 'faculty' to 'data'
      count: formattedFaculty.length,
      message: `Found ${formattedFaculty.length} faculty members`
    });
    
  } catch (error) {
    console.error('❌ Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message,
      faculty: [],
      count: 0
    });
  }
});

// ✅ ADD HOD ENDPOINT
app.get('/api/users/hod', async (req, res) => {
  try {
    console.log('👨‍💼 Fetching HOD users from MongoDB...');
    
    const hods = await User.find({ role: 'hod' }).select('-password');
    
    const formattedHods = hods.map(user => ({
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      qualification: user.qualification,
      experience: user.experience,
      bio: user.bio,
      linkedinId: user.linkedinId,
      imageUrl: user.imageUrl,
      isActive: user.isActive
    }));
    
    res.json({
      success: true,
      hods: formattedHods,
      count: formattedHods.length,
      message: `Found ${formattedHods.length} HOD(s)`
    });
    
  } catch (error) {
    console.error('❌ Error fetching HODs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching HODs',
      error: error.message,
      hods: [],
      count: 0
    });
  }
});

// GET /api/users/:id - Get individual user by ID
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user exists
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format user data
    const formattedUser = {
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      fullName: user.name, // Add fullName for compatibility
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      qualification: user.qualification,
      experience: user.experience,
      bio: user.bio,
      linkedinId: user.linkedinId,
      linkedIn: user.linkedinId, // Add linkedIn for compatibility
      imageUrl: user.imageUrl,
      profileImage: user.imageUrl, // Add profileImage for compatibility
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      success: true,
      user: formattedUser,
      message: 'User found successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// POST /api/users - Create a new user (HOD or Admin only)
app.post('/api/users', authMiddleware, async (req, res) => {
  try {
    // Only HOD or admin may create staff/faculty
    if (!req.user || (req.user.role !== 'hod' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const {
      name,
      username,
      email,
      password,
      role = 'faculty',
      department = 'General',
      designation = 'Faculty',
      phoneNumber
    } = req.body;

    // Basic validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, username, email and password are required' });
    }

    // Prevent duplicate email/username
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User with given email or username already exists' });
    }

    const newUser = new User({
      name,
      username,
      email,
      password,
      role,
      department,
      designation,
      phoneNumber
    });

    await newUser.save();

    const safeUser = newUser.toJSON();
    res.status(201).json({ success: true, message: 'User created', user: safeUser });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
});

// DELETE /api/users/:id - Delete a user (HOD or Admin only)
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'hod' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting an admin or self accidentally
    if (String(userToDelete._id) === String(req.user.userId)) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted', userId: id });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
});

// ✅ NEW OVERDUE TASK AND EXTENSION REQUEST APIs

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/extensions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .pdf, .doc, .docx, .jpg, .jpeg, .png files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Staff APIs for overdue tasks and extension requests
app.get('/api/tasks/overdue', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;

    // Verify user is staff (faculty role)
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for faculty members only.'
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query for overdue tasks
    const currentDate = new Date();
    const query = {
      assignedTo: userId,
      dueDate: { $lt: currentDate },
      status: { $nin: ['completed', 'submitted'] }
    };

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const overdueTasks = await Task.find(query)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalCount = await Task.countDocuments(query);

    // Calculate overdue days and add reason
    const tasksWithOverdueInfo = overdueTasks.map(task => {
      const daysOverdue = Math.ceil((currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
      
      let overdueReason = 'Task exceeded its deadline';
      if (daysOverdue === 1) {
        overdueReason = 'Task is 1 day overdue';
      } else if (daysOverdue > 1) {
        overdueReason = `Task is ${daysOverdue} days overdue`;
      }

      return {
        ...task,
        daysOverdue,
        overdueReason
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        tasks: tasksWithOverdueInfo,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: `Found ${totalCount} overdue task${totalCount !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/tasks/staff/:staffId/statistics - Get comprehensive task statistics for a staff member
app.get('/api/tasks/staff/:staffId/statistics', authMiddleware, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    // Verify user is HOD or the staff member themselves
    if (req.user.role !== 'hod' && req.user.id !== staffId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own statistics or you need to be an HOD.'
      });
    }

    // Verify staff member exists
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Get all tasks for this staff member
    const allTasks = await Task.find({ assignedTo: staffId }).lean();
    
    // Calculate current date for overdue determination
    const currentDate = new Date();
    
    // Calculate statistics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = allTasks.filter(task => ['pending', 'in-progress'].includes(task.status)).length;
    const forApprovalTasks = allTasks.filter(task => task.status === 'ForApproval').length;
    const rejectedTasks = allTasks.filter(task => task.status === 'rejected').length;
    
    // Calculate overdue tasks (pending/in-progress and past due date)
    const overdueTasks = allTasks.filter(task => 
      ['pending', 'in-progress'].includes(task.status) && 
      task.dueDate && 
      new Date(task.dueDate) < currentDate
    ).length;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Generate monthly data for the current year
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    const monthlyData = months.slice(0, currentMonth + 1).map((month, index) => {
      const monthStart = new Date(currentYear, index, 1);
      const monthEnd = new Date(currentYear, index + 1, 0, 23, 59, 59);
      
      // Filter tasks for this month
      const monthTasks = allTasks.filter(task => {
        const taskDate = task.completedAt || task.createdAt;
        return taskDate && new Date(taskDate) >= monthStart && new Date(taskDate) <= monthEnd;
      });
      
      const monthCompleted = monthTasks.filter(task => task.status === 'completed').length;
      const monthPending = monthTasks.filter(task => ['pending', 'in-progress'].includes(task.status)).length;
      const monthOverdue = monthTasks.filter(task => 
        ['pending', 'in-progress'].includes(task.status) && 
        task.dueDate && 
        new Date(task.dueDate) < currentDate
      ).length;
      
      return {
        name: month,
        Completed: monthCompleted,
        Pending: monthPending,
        Missed: monthOverdue
      };
    });
    
    // Calculate task distribution by priority
    const priorityDistribution = {
      low: allTasks.filter(task => task.priority === 'low').length,
      medium: allTasks.filter(task => task.priority === 'medium').length,
      high: allTasks.filter(task => task.priority === 'high').length,
      urgent: allTasks.filter(task => task.priority === 'urgent').length
    };
    
    // Calculate task distribution by category
    const categoryDistribution = {};
    allTasks.forEach(task => {
      const category = task.category || 'general';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });
    
    // Calculate average completion time (for completed tasks)
    const completedTasksWithTime = allTasks.filter(task => 
      task.status === 'completed' && task.completedAt && task.createdAt
    );
    
    const avgCompletionTime = completedTasksWithTime.length > 0 ? 
      completedTasksWithTime.reduce((sum, task) => {
        const timeDiff = new Date(task.completedAt) - new Date(task.createdAt);
        return sum + timeDiff;
      }, 0) / completedTasksWithTime.length / (1000 * 60 * 60 * 24) : 0; // in days
    
    res.status(200).json({
      success: true,
      statistics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        forApprovalTasks,
        rejectedTasks,
        overdueTasks,
        completionRate,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10 // Round to 1 decimal
      },
      monthlyData,
      priorityDistribution,
      categoryDistribution,
      staffInfo: {
        _id: staff._id,
        name: staff.name,
        department: staff.department,
        designation: staff.designation
      }
    });

  } catch (error) {
    console.error('Error fetching staff statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/requests/extensions - Get user's extension requests
app.get('/api/requests/extensions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Verify user is staff (faculty role)
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for faculty members only.'
      });
    }

    // Find all extension requests by this user
    const extensionRequests = await ExtensionRequest.find({
      requestedBy: userId
    })
    .populate('taskId', 'title')
    .sort({ submittedAt: -1 }) // Most recent first
    .lean();

    // Format the requests for frontend consumption
    const formattedRequests = extensionRequests
      .filter(request => request.taskId && request.taskId._id) // Filter out requests with null taskId
      .map(request => ({
        _id: request._id,
        taskId: request.taskId._id,
        taskTitle: request.taskTitle,
        originalDueDate: request.originalDueDate,
        requestedDueDate: request.requestedDueDate,
        reason: request.reason,
        reasonLabel: request.reasonLabel,
        customReason: request.customReason,
        status: request.status,
        submittedAt: request.submittedAt,
        reviewedAt: request.reviewedAt,
        reviewComments: request.reviewComments,
        rejectionReason: request.rejectionReason,
        approvedDueDate: request.approvedDueDate,
        attachments: request.attachments
      }));

    res.status(200).json({
      success: true,
      requests: formattedRequests,
      message: `Found ${formattedRequests.length} extension request${formattedRequests.length !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Error fetching user extension requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching extension requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/requests/extensions - Submit extension request
app.post('/api/requests/extensions', authMiddleware, upload.array('supportingFiles', 5), async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId, reason, customReason, requestedDueDate } = req.body;

    // Verify user is staff (faculty role)
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for faculty members only.'
      });
    }

    // Validate required fields
    if (!taskId || !reason || !requestedDueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskId, reason, and requestedDueDate are required'
      });
    }

    // Validate requested due date is in the future
    const requestedDate = new Date(requestedDueDate);
    const currentDate = new Date();
    if (requestedDate <= currentDate) {
      return res.status(400).json({
        success: false,
        message: 'Requested due date must be in the future'
      });
    }

    // Validate custom reason if 'other' is selected
    if (reason === 'other' && (!customReason || !customReason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Custom reason is required when "other" is selected'
      });
    }

    // Fetch and verify task
    const task = await Task.findById(taskId).populate('assignedBy', 'name email role');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify task is assigned to requesting user
    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only request extensions for tasks assigned to you'
      });
    }

    // Verify task is overdue
    if (new Date(task.dueDate) >= currentDate) {
      return res.status(400).json({
        success: false,
        message: 'Extension requests can only be submitted for overdue tasks'
      });
    }

    // Verify task is not completed
    if (['completed', 'submitted'].includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request extension for completed or submitted tasks'
      });
    }

    // Map reason to label
    const reasonLabels = {
      'technical_issues': 'Technical Difficulties',
      'resource_unavailable': 'Resources Unavailable',
      'scope_change': 'Scope Change Required',
      'dependency_delay': 'Dependency Delays',
      'personal_emergency': 'Personal Emergency',
      'workload_conflict': 'Workload Conflicts',
      'other': 'Other'
    };

    // Handle file uploads if any
    let supportingFiles = [];
    if (req.files && req.files.length > 0) {
      supportingFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }

    // Create real extension request in database
    const extensionRequest = new ExtensionRequest({
      taskId: task._id,
      taskTitle: task.title,
      requestedBy: userId,
      requestedByName: req.user.name,
      requestedByEmail: req.user.email,
      originalDueDate: task.dueDate,
      requestedDueDate: requestedDate,
      reason,
      reasonLabel: reasonLabels[reason],
      customReason: customReason || '',
      attachments: supportingFiles.map(file => file.filename), // Store filenames
      status: 'pending',
      submittedAt: new Date()
    });

    // Save to database
    const savedRequest = await extensionRequest.save();

    console.log(`Extension request submitted - notify HOD ${task.assignedBy._id} about request ${savedRequest._id}`);

    res.status(201).json({
      success: true,
      data: savedRequest,
      message: 'Extension request submitted successfully. Your HOD will review and respond.'
    });

  } catch (error) {
    console.error('Error submitting extension request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting extension request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// HOD Analytics API
app.get('/api/analytics/overdue-tasks', authMiddleware, async (req, res) => {
  try {
    const hodId = req.user.id;

    // Debug: Log user data from request
    console.log('🔍 DEBUG: Analytics API request user data:', {
      userId: req.user.id,
      userRole: req.user.role,
      userEmail: req.user.email,
      userName: req.user.name
    });

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      console.log('❌ Access denied: User role is not HOD:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    console.log('✅ User verified as HOD, proceeding with analytics...');

    // Get comprehensive analytics data for all overdue tasks
    const currentDate = new Date();
    
    // Get all overdue tasks (not completed/approved/rejected and past due date)
    const overdueTasks = await Task.find({
      dueDate: { $lt: currentDate },
      status: { $nin: ['completed', 'ForApproval', 'rejected'] }
    })
    .populate('assignedTo', 'name email role department')
    .populate('assignedBy', 'name email role department')
    .sort({ dueDate: 1 });

    // Total overdue count
    const totalOverdue = overdueTasks.length;

    // Overdue tasks by staff with comprehensive data
    const overdueByStaff = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: currentDate },
          status: { $nin: ['completed', 'ForApproval', 'rejected'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: '$staff' },
      {
        $group: {
          _id: '$assignedTo',
          staffName: { $first: '$staff.name' },
          staffEmail: { $first: '$staff.email' },
          overdueCount: { $sum: 1 },
          tasks: {
            $push: {
              id: '$_id',
              title: '$title',
              dueDate: '$dueDate',
              priority: '$priority',
              category: '$category',
              daysOverdue: {
                $ceil: {
                  $divide: [
                    { $subtract: [currentDate, '$dueDate'] },
                    86400000
                  ]
                }
              }
            }
          }
        }
      },
      {
        $sort: { overdueCount: -1 }
      }
    ]);

    // Overdue tasks by priority
    const overdueByPriority = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: currentDate },
          status: { $nin: ['completed', 'ForApproval', 'rejected'] }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          averageDaysOverdue: {
            $avg: {
              $ceil: {
                $divide: [
                  { $subtract: [currentDate, '$dueDate'] },
                  86400000
                ]
              }
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Monthly overdue trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const overdueTrend = await Task.aggregate([
      {
        $match: {
          dueDate: { $gte: twelveMonthsAgo, $lt: currentDate },
          status: { $nin: ['completed', 'ForApproval', 'rejected'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$dueDate' },
            month: { $month: '$dueDate' }
          },
          overdueCount: { $sum: 1 },
          averageDaysOverdue: {
            $avg: {
              $ceil: {
                $divide: [
                  { $subtract: [currentDate, '$dueDate'] },
                  86400000
                ]
              }
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' }
              ],
              default: 'Unknown'
            }
          },
          overdueCount: 1,
          averageDaysOverdue: { $round: ['$averageDaysOverdue', 1] }
        }
      }
    ]);

    // Most overdue staff (staff with highest average days overdue)
    const mostOverdueStaff = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: currentDate },
          status: { $nin: ['completed', 'ForApproval', 'rejected'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: '$staff' },
      {
        $group: {
          _id: '$assignedTo',
          staffName: { $first: '$staff.name' },
          staffEmail: { $first: '$staff.email' },
          overdueCount: { $sum: 1 },
          averageDaysOverdue: {
            $avg: {
              $ceil: {
                $divide: [
                  { $subtract: [currentDate, '$dueDate'] },
                  86400000
                ]
              }
            }
          },
          maxDaysOverdue: {
            $max: {
              $ceil: {
                $divide: [
                  { $subtract: [currentDate, '$dueDate'] },
                  86400000
                ]
              }
            }
          }
        }
      },
      {
        $sort: { averageDaysOverdue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Department-wise overdue statistics
    const overdueByDepartment = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: currentDate },
          status: { $nin: ['completed', 'ForApproval', 'rejected'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: '$staff' },
      {
        $group: {
          _id: '$staff.department',
          count: { $sum: 1 },
          averageDaysOverdue: {
            $avg: {
              $ceil: {
                $divide: [
                  { $subtract: [currentDate, '$dueDate'] },
                  86400000
                ]
              }
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Overdue by category
    const overdueByCategory = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: currentDate },
          status: { $nin: ['completed', 'ForApproval', 'rejected'] }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageDaysOverdue: {
            $avg: {
              $ceil: {
                $divide: [
                  { $subtract: [currentDate, '$dueDate'] },
                  86400000
                ]
              }
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Critical overdue tasks (more than 7 days overdue)
    const criticalOverdue = overdueTasks.filter(task => {
      const daysOverdue = Math.ceil((currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
      return daysOverdue > 7;
    }).length;

    console.log('📊 Comprehensive Overdue Analytics Generated:', {
      totalOverdue,
      criticalOverdue,
      staffWithOverdue: overdueByStaff.length,
      trendDataPoints: overdueTrend.length
    });

    res.json({
      success: true,
      analytics: {
        totalOverdue,
        criticalOverdue,
        overdueByStaff,
        overdueByPriority,
        overdueByCategory,
        overdueByDepartment,
        overdueTrend,
        mostOverdueStaff,
        summary: {
          totalTasks: await Task.countDocuments(),
          overduePercentage: totalOverdue > 0 ? Math.round((totalOverdue / await Task.countDocuments()) * 100) : 0,
          averageDaysOverdue: overdueTasks.length > 0 ? 
            Math.round(overdueTasks.reduce((sum, task) => {
              const daysOverdue = Math.ceil((currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
              return sum + daysOverdue;
            }, 0) / overdueTasks.length) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ OVERDUE TRACKING ENDPOINTS
app.post('/api/tasks/mark-overdue', authMiddleware, async (req, res) => {
  try {
    // Only HOD can trigger this
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.'
      });
    }

    const { markOverdueTasks } = await import('./utils/overdueTracker.js');
    const result = await markOverdueTasks();
    
    res.json({
      success: true,
      message: 'Overdue task marking completed',
      data: result
    });
  } catch (error) {
    console.error('Error in mark-overdue endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking overdue tasks',
      error: error.message
    });
  }
});

app.get('/api/tasks/tracked-analytics', authMiddleware, async (req, res) => {
  try {
    // Only HOD can access this
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.'
      });
    }

    console.log('📊 Getting tracked analytics for HOD...');
    const { getTrackedAnalytics } = await import('./utils/overdueTracker.js');
    const result = await getTrackedAnalytics();
    
    console.log('📈 Analytics result success:', result.success);
    if (result.success) {
      console.log('📊 Analytics data keys:', Object.keys(result.analytics));
      console.log('📈 Total overdue tasks:', result.analytics.totalOverdue);
      console.log('📈 Staff with overdue tasks:', result.analytics.overdueByStaff?.length);
    } else {
      console.error('❌ Analytics error:', result.error);
    }
    
    if (result.success) {
      res.json({
        success: true,
        analytics: result.analytics
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get tracked analytics',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in tracked-analytics endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting tracked analytics',
      error: error.message
    });
  }
});

// HOD Extension Requests API
app.get('/api/requests/overdue', authMiddleware, async (req, res) => {
  try {
    const hodId = req.user.id;
    
    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Get all tasks assigned by this HOD to find relevant extension requests
    const hodTasks = await Task.find({ assignedBy: hodId }).select('_id');
    const hodTaskIds = hodTasks.map(task => task._id);

    // Get extension requests for tasks assigned by this HOD
    const extensionRequests = await ExtensionRequest.find({
      taskId: { $in: hodTaskIds }
    })
    .populate('taskId', 'title')
    .populate('requestedBy', 'name email')
    .sort({ submittedAt: -1 }) // Most recent first
    .lean();

    // Format the requests for frontend consumption
    const formattedRequests = extensionRequests.map(request => ({
      _id: request._id,
      taskId: request.taskId._id,
      taskTitle: request.taskTitle,
      staffName: request.requestedByName,
      staffEmail: request.requestedByEmail,
      originalDueDate: request.originalDueDate,
      requestedDueDate: request.requestedDueDate,
      reason: request.reason,
      reasonLabel: request.reasonLabel,
      customReason: request.customReason,
      status: request.status,
      createdAt: request.submittedAt,
      reviewedAt: request.reviewedAt,
      reviewComments: request.reviewComments,
      attachments: request.attachments
    }));

    res.status(200).json({
      success: true,
      data: {
        requests: formattedRequests,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: formattedRequests.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        }
      },
      message: `Found ${formattedRequests.length} extension request${formattedRequests.length !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Error fetching extension requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching extension requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/requests/overdue/:requestId/approve - Approve extension request
app.put('/api/requests/overdue/:requestId/approve', authMiddleware, async (req, res) => {
  try {
    console.log('🟢 HOD approving extension request:', req.params.requestId);
    
    const { requestId } = req.params;
    const { newDueDate, comments } = req.body;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Validate required fields
    if (!newDueDate) {
      return res.status(400).json({
        success: false,
        message: 'New due date is required'
      });
    }

    // Find the extension request with populated references
    const extensionRequest = await ExtensionRequest.findById(requestId)
      .populate('taskId')
      .populate('requestedBy', 'name email');
    
    if (!extensionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Extension request not found'
      });
    }

    if (extensionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Extension request is not pending'
      });
    }

    // Verify HOD has permission to approve this request
    const task = await Task.findById(extensionRequest.taskId);
    
    // Convert both to strings for comparison
    const taskAssignedBy = task.assignedBy.toString();
    const currentUserId = req.user.id.toString();
    
    console.log('🔍 Authorization check:', {
      taskAssignedBy,
      currentUserId,
      userRole: req.user.role,
      match: taskAssignedBy === currentUserId
    });
    
    // Allow HOD users to approve any request since they are department heads
    if (req.user.role !== 'hod' && taskAssignedBy !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve extension requests for tasks you assigned'
      });
    }
    
    console.log('✅ User authorized to approve extension request');

    // Update extension request
    extensionRequest.status = 'approved';
    extensionRequest.reviewedBy = req.user.id;
    extensionRequest.reviewComments = comments || '';
    extensionRequest.approvedDueDate = new Date(newDueDate);
    extensionRequest.reviewedAt = new Date();
    await extensionRequest.save();

    // 🔄 REALLOCATE THE TASK - Update task with new due date and reset status to pending
    // Mark as overdue-approved task
    
    // Save original due date if not already saved
    if (!task.originalDueDate) {
      task.originalDueDate = task.dueDate;
    }
    
    task.dueDate = new Date(newDueDate);
    task.status = 'pending'; // Reset to pending so faculty can accept and work on it again
    task.extensionApproved = true;
    task.extensionApprovedAt = new Date();
    task.extensionComments = comments;
    task.wasOverdue = true; // ✅ Mark that this task was previously overdue
    task.reallocated = true; // ✅ NEW: Explicitly mark as reallocated task
    task.reallocationDate = new Date(); // ✅ NEW: Track when reallocation happened
    task.reallocationReason = 'Extension approved by HOD'; // ✅ NEW: Track reallocation reason
    task.lastModified = new Date();
    await task.save();

    console.log(`✅ Task ${task._id} reallocated with new due date: ${newDueDate}`);
    console.log(`🔍 DEBUG: Task fields after approval:`, {
      taskId: task._id,
      wasOverdue: task.wasOverdue,
      extensionApproved: task.extensionApproved,
      reallocated: task.reallocated,
      reallocationDate: task.reallocationDate,
      status: task.status,
      originalDueDate: task.originalDueDate,
      newDueDate: task.dueDate
    });

    // Send notification to faculty member
    if (extensionRequest.requestedBy) {
      try {
        await NotificationModel.create({
          title: '🔄 Task Reallocated - Extension Approved',
          message: `Your overdue task "${extensionRequest.taskId.title}" has been reallocated with a new due date: ${new Date(newDueDate).toLocaleDateString()}. This task was previously overdue and has now been approved for extension by the HOD. The task is available in your task portal.`,
          type: 'task_reallocated',
          userId: extensionRequest.requestedBy._id,
          data: {
            taskId: extensionRequest.taskId._id,
            taskTitle: extensionRequest.taskId.title,
            originalDueDate: task.originalDueDate,
            newDueDate: newDueDate,
            comments: comments,
            approvedBy: req.user.name || req.user.fullName,
            approvedAt: new Date().toISOString(),
            wasOverdue: true,
            reallocated: true,
            extensionApproved: true
          },
          read: false,
          createdAt: new Date()
        });
        console.log(`🔔 Reallocation notification sent to faculty: ${extensionRequest.requestedBy.name || extensionRequest.requestedBy.fullName}`);
      } catch (notifError) {
        console.error('❌ Failed to send reallocation notification:', notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Extension request approved and task reallocated. New due date: ${new Date(newDueDate).toLocaleDateString()}`,
      data: {
        requestId,
        status: 'approved',
        newDueDate,
        comments,
        approvedAt: new Date(),
        taskReallocated: true
      }
    });

  } catch (error) {
    console.error('❌ Error approving extension request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving extension request',
      error: error.message
    });
  }
});

// PUT /api/requests/overdue/:requestId/reassign - Reassign task
app.put('/api/requests/overdue/:requestId/reassign', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 HOD reassigning task from extension request:', req.params.requestId);
    
    const { requestId } = req.params;
    const { newStaffId, newDueDate, penaltyFlag, comments } = req.body;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Validate required fields
    if (!newStaffId || !newDueDate) {
      return res.status(400).json({
        success: false,
        message: 'New staff ID and new due date are required'
      });
    }

    // Verify new staff exists and is faculty
    const newStaff = await User.findById(newStaffId);
    if (!newStaff) {
      return res.status(404).json({
        success: false,
        message: 'New staff member not found'
      });
    }

    if (newStaff.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Can only reassign to faculty members'
      });
    }

    // Find the extension request with populated references
    const extensionRequest = await ExtensionRequest.findById(requestId)
      .populate('taskId')
      .populate('requestedBy', 'name email');
    
    if (!extensionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Extension request not found'
      });
    }

    if (extensionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Extension request is not pending'
      });
    }

    // Find the original task and verify HOD permissions
    const task = await Task.findById(extensionRequest.taskId);
    
    // ✅ FIXED: HODs can reassign any task, others can only reassign tasks they assigned
    if (req.user.role !== 'hod' && task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only reassign tasks you assigned'
      });
    }

    // Get original staff for penalty tracking
    const originalStaff = await User.findById(task.assignedTo);

    // Apply penalty to original staff if flagged
    if (penaltyFlag && originalStaff) {
      originalStaff.penaltyCount = (originalStaff.penaltyCount || 0) + 1;
      await originalStaff.save();
      console.log(`⚠️ Penalty applied to ${originalStaff.fullName}. Total penalties: ${originalStaff.penaltyCount}`);
    }

    // Update extension request status
    extensionRequest.status = 'approved'; // Reassignment implies approval with new assignee
    extensionRequest.reviewedBy = req.user.id;
    extensionRequest.reviewComments = comments || `Task reassigned to ${newStaff.fullName}`;
    extensionRequest.reviewedAt = new Date();
    await extensionRequest.save();

    // 🔄 REALLOCATE THE TASK - Update task with new assignee, due date, and reset status
    
    // Save original due date if not already saved
    if (!task.originalDueDate) {
      task.originalDueDate = task.dueDate;
    }
    
    task.assignedTo = newStaffId;
    task.dueDate = new Date(newDueDate);
    task.status = 'pending'; // Reset to pending so new faculty can accept the task
    task.extensionApproved = true; // Mark as approved extension since it was reallocated
    task.extensionApprovedAt = new Date();
    task.extensionComments = comments;
    task.wasOverdue = true; // Mark that this task was previously overdue
    task.reallocated = true; // ✅ NEW: Explicitly mark as reallocated task
    task.reallocationDate = new Date(); // ✅ NEW: Track when reallocation happened
    task.reallocationReason = 'Task reassigned to new staff member'; // ✅ NEW: Track reallocation reason
    task.reassigned = true;
    task.reassignedAt = new Date();
    task.reassignedFrom = originalStaff ? originalStaff._id : null;
    task.reassignmentReason = comments;
    task.penaltyApplied = penaltyFlag;
    task.lastModified = new Date();
    
    // ✅ PERMANENTLY MARK AS REALLOCATED using tracking utility
    try {
      // Use dynamic import properly in async context
      const overdueTracker = await import('./utils/overdueTracker.js');
      await overdueTracker.markTaskAsReallocated(task._id.toString(), 'Task reassigned to new staff member');
      console.log(`🏷️ Permanently marked task ${task._id} as reallocated`);
    } catch (error) {
      console.error('⚠️ Error marking task as reallocated:', error);
    }
    
    await task.save();

    console.log(`✅ Task ${task._id} reassigned from ${originalStaff?.fullName} to ${newStaff.fullName}`);
    console.log(`🔍 DEBUG: Task fields after reallocation:`, {
      taskId: task._id,
      wasOverdue: task.wasOverdue,
      extensionApproved: task.extensionApproved,
      reallocated: task.reallocated,
      reallocationDate: task.reallocationDate,
      reassigned: task.reassigned,
      status: task.status,
      originalDueDate: task.originalDueDate,
      newDueDate: task.dueDate
    });

    // Send notification to NEW faculty member
    try {
      await NotificationModel.create({
        title: '� Overdue Task Reallocated to You',
        message: `An overdue task "${task.title}" has been reallocated to you by the HOD. This task was previously overdue and has been reassigned with a new due date: ${new Date(newDueDate).toLocaleDateString()}. Please check your task portal and accept the task.`,
        type: 'task_reallocated_to_you',
        userId: newStaffId,
        data: {
          taskId: task._id,
          taskTitle: task.title,
          originalDueDate: task.originalDueDate,
          newDueDate: newDueDate,
          reassignedBy: req.user.name || req.user.fullName,
          reassignedAt: new Date().toISOString(),
          originalAssignee: originalStaff?.name || originalStaff?.fullName,
          comments: comments,
          wasOverdue: true,
          reallocated: true,
          penaltyAppliedToOriginal: penaltyFlag
        },
        read: false,
        createdAt: new Date()
      });
      console.log(`🔔 Reallocation notification sent to new faculty: ${newStaff.name || newStaff.fullName}`);
    } catch (notifError) {
      console.error('❌ Failed to send reallocation notification:', notifError);
    }

    // Send notification to ORIGINAL faculty member
    if (originalStaff && extensionRequest.userId) {
      try {
        await NotificationModel.create({
          title: '⚠️ Your Overdue Task Has Been Reallocated',
          message: `Your overdue task "${task.title}" has been reallocated to ${newStaff.name || newStaff.fullName} by the HOD. ${penaltyFlag ? 'A penalty has been applied to your record due to the task being overdue.' : 'The task was reassigned due to being overdue.'} Reason: ${comments || 'Task reallocation due to overdue status.'}`,
          type: 'task_reallocated_from_you',
          userId: extensionRequest.userId._id,
          data: {
            taskId: task._id,
            taskTitle: task.title,
            reassignedTo: newStaff.name || newStaff.fullName,
            reassignedBy: req.user.name || req.user.fullName,
            reassignedAt: new Date().toISOString(),
            penaltyApplied: penaltyFlag,
            reason: comments,
            wasOverdue: true,
            reallocated: true
          },
          read: false,
          createdAt: new Date()
        });
        console.log(`🔔 Task removal notification sent to original faculty: ${originalStaff.fullName}`);
      } catch (notifError) {
        console.error('❌ Failed to send task removal notification:', notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Task reassigned to ${newStaff.fullName}. New due date: ${new Date(newDueDate).toLocaleDateString()}${penaltyFlag ? '. Penalty applied to original assignee.' : ''}`,
      data: {
        requestId,
        status: 'reassigned',
        newStaffId,
        newStaffName: newStaff.fullName,
        originalStaffName: originalStaff?.fullName,
        newDueDate,
        penaltyFlag,
        penaltyApplied: penaltyFlag,
        comments,
        reassignedAt: new Date(),
        taskReallocated: true
      }
    });

  } catch (error) {
    console.error('❌ Error reassigning task:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reassigning task',
      error: error.message
    });
  }
});

// PUT /api/requests/overdue/:requestId/reject - Reject extension request
app.put('/api/requests/overdue/:requestId/reject', authMiddleware, async (req, res) => {
  try {
    console.log('❌ HOD rejecting extension request:', req.params.requestId);
    
    const { requestId } = req.params;
    const { comments } = req.body;

    // Verify user is HOD
    if (req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for HOD users only.'
      });
    }

    // Validate required fields
    if (!comments || !comments.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Find the extension request with populated references
    const extensionRequest = await ExtensionRequest.findById(requestId)
      .populate('taskId')
      .populate('userId', 'fullName email');
    
    if (!extensionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Extension request not found'
      });
    }

    if (extensionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Extension request is not pending'
      });
    }

    // Verify HOD has permission to reject this request
    const task = await Task.findById(extensionRequest.taskId);
    if (task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject extension requests for tasks you assigned'
      });
    }

    // Get faculty member for penalty
    const faculty = await User.findById(task.assignedTo);

    // Update extension request
    extensionRequest.status = 'rejected';
    extensionRequest.reviewedBy = req.user.id;
    extensionRequest.reviewComments = comments;
    extensionRequest.rejectionReason = comments;
    extensionRequest.reviewedAt = new Date();
    await extensionRequest.save();

    // 🗑️ HANDLE TASK REMOVAL - Mark task as cancelled/rejected
    task.status = 'rejected'; // Mark as rejected so it doesn't appear in active tasks
    task.rejectedAt = new Date();
    task.rejectionReason = comments;
    task.rejectedBy = req.user.id;
    task.lastModified = new Date();
    
    // Apply penalty to faculty member for failed task
    if (faculty) {
      faculty.penaltyCount = (faculty.penaltyCount || 0) + 1;
      task.penaltyApplied = true;
      await faculty.save();
      console.log(`⚠️ Penalty applied to ${faculty.fullName} for rejected extension. Total penalties: ${faculty.penaltyCount}`);
    }
    
    await task.save();

    console.log(`❌ Task ${task._id} marked as rejected and removed from active tasks`);

    // Send notification to faculty member
    if (extensionRequest.userId) {
      try {
        await NotificationModel.create({
          title: '❌ Extension Request Rejected',
          message: `Your extension request for "${extensionRequest.taskId.title}" has been rejected. The task has been removed from your portal. Reason: ${comments}. A penalty has been applied to your record.`,
          type: 'extension_rejected',
          userId: extensionRequest.userId._id,
          data: {
            taskId: extensionRequest.taskId._id,
            taskTitle: extensionRequest.taskId.title,
            rejectionReason: comments,
            rejectedBy: req.user.fullName,
            rejectedAt: new Date().toISOString(),
            penaltyApplied: true
          },
          read: false,
          createdAt: new Date()
        });
        console.log(`🔔 Rejection notification sent to faculty: ${extensionRequest.userId.fullName}`);
      } catch (notifError) {
        console.error('❌ Failed to send rejection notification:', notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Extension request rejected and task removed from faculty portal. Penalty applied.',
      data: {
        requestId,
        status: 'rejected',
        comments,
        rejectedAt: new Date(),
        taskRemoved: true,
        penaltyApplied: true,
        facultyName: faculty?.fullName
      }
    });

  } catch (error) {
    console.error('❌ Error rejecting extension request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting extension request',
      error: error.message
    });
  }
});

// ✅ AI CHATBOT AND TASK DESCRIPTION GENERATION ROUTES

// Groq AI configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  chatbot: `You are a helpful assistant for a Task Management Portal system. Your role is to help users with:

1. Task allocation and management
2. Understanding system features  
3. Navigation guidance
4. Performance analytics
5. User management
6. Workflow assistance

IMPORTANT RULES:
- Only answer questions related to task management, productivity, and this specific portal system
- Do not answer questions about unrelated topics (politics, personal advice, general knowledge, etc.)
- If asked about something outside your scope, politely redirect to task management topics
- Be concise but helpful
- Use a professional but friendly tone
- Provide specific guidance when possible

The system has the following main features:
- Task allocation by HODs to faculty
- Real-time notifications
- Task status tracking (pending, in-progress, completed, overdue)
- Performance analytics and staff rankings
- File attachments for tasks
- Deadline management and extensions
- Dark/light mode themes
- Mobile responsive design

User roles: HOD (Head of Department) can allocate tasks, faculty receive and complete tasks.`,

  task_description: `You are an AI assistant that helps generate detailed, professional task descriptions for academic institutions. 

GUIDELINES:
- Create clear, actionable task descriptions
- Include specific objectives and deliverables
- Mention estimated timeframes when appropriate
- Use professional academic language
- Include relevant context for educational settings
- Make descriptions comprehensive but not overly lengthy
- Focus on measurable outcomes

Generate only the task description content, nothing else.`
};

// Helper function to make Groq API calls
const callGroqAPI = async (messages, systemPrompt) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Fast model for chat
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
};

// @route   POST /api/chatbot/query
// @desc    Handle chatbot queries
// @access  Private
app.post('/api/chatbot/query', async (req, res) => {
  try {
    console.log('🤖 Chatbot endpoint hit:', req.body);
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('🤖 Chatbot query from:', context?.userName || 'Unknown', '- Message:', message);

    // Check if the question seems unrelated to task management
    const unrelatedKeywords = [
      'weather', 'sports', 'politics', 'cooking', 'travel', 'dating', 'health', 'medical',
      'stock market', 'cryptocurrency', 'movies', 'music', 'games', 'fashion'
    ];
    
    const isUnrelated = unrelatedKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (isUnrelated) {
      return res.json({
        success: true,
        response: "I'm specifically designed to help with task management and portal-related questions. Please ask me about task allocation, system features, navigation, performance analytics, or any other aspect of our Task Management Portal. How can I assist you with your work tasks today?"
      });
    }

    const userContext = `User: ${context?.userName || 'Unknown'} (Role: ${context?.userRole || 'unknown'})`;
    
    // For testing, provide a simple response without calling Groq API
    const response = `Hello! I'm your Task Management Portal assistant. I can help you with:
    
    • Task allocation and management
    • Understanding system features
    • Navigation guidance
    • Performance analytics
    
    You asked: "${message}"
    
    Would you like specific guidance on any of these topics?`;

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again later.'
    });
  }
});

// @route   POST /api/ai/generate-task-description
// @desc    Generate task description using AI
// @access  Private
app.post('/api/ai/generate-task-description', authMiddleware, async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('🎯 AI task description generation for:', req.user.name, '- Prompt:', prompt);

    // For testing, provide a structured response based on the prompt
    const description = `Task Title: ${prompt}

Objective:
Complete a comprehensive ${prompt.toLowerCase()} with clear deliverables and measurable outcomes.

Description:
This task involves detailed planning, research, and execution related to ${prompt.toLowerCase()}. The assigned team member will be responsible for conducting thorough analysis, implementing best practices, and delivering high-quality results within the specified timeframe.

Key Deliverables:
• Research and analysis documentation
• Implementation plan and timeline
• Progress reports and status updates
• Final presentation and results summary

Success Criteria:
• All deliverables completed on time
• Quality standards met or exceeded
• Stakeholder requirements satisfied
• Documentation properly maintained

Timeline:
Please refer to the assigned due date for completion. Regular check-ins and progress updates are expected throughout the project duration.

Additional Notes:
This task requires attention to detail, professional communication, and adherence to institutional guidelines and standards.`;

    res.json({
      success: true,
      description: description
    });

  } catch (error) {
    console.error('❌ AI task description generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task description. Please try again.'
    });
  }
});

// ✅ 404 HANDLER
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// ✅ ERROR HANDLER
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ✅ START SERVER
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, async () => {
      console.log('\n🎉 ===== SERVER STARTED SUCCESSFULLY =====');
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`📱 Frontend running on: http://localhost:5173`);
      console.log(`🌐 API base URL: http://localhost:${PORT}/api`);
      console.log('\n💡 To migrate data and see credentials, run:');
      console.log('   node scripts/migrateData.js');
      console.log('\n💡 To see current credentials:');
      console.log(`   curl http://localhost:${PORT}/api/debug/credentials`);
      console.log('==========================================\n');
      
      // ✅ Start overdue task tracking
      console.log('🔍 Starting overdue task tracking...');
      try {
        // Initialize the tracking utility with Task model
        const { setTaskModel, markOverdueTasks } = await import('./utils/overdueTracker.js');
        setTaskModel(Task); // Pass the Task model to the utility
        
        // Mark overdue tasks immediately on startup
        await markOverdueTasks();
        
        // Set up periodic checking (every hour)
        setInterval(async () => {
          console.log('⏰ Periodic overdue task check...');
          await markOverdueTasks();
        }, 60 * 60 * 1000); // 1 hour
        
        console.log('✅ Overdue task tracking started');
      } catch (error) {
        console.error('❌ Failed to start overdue task tracking:', error);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ✅ GRACEFUL SHUTDOWN (disabled for development)
// process.on('SIGINT', () => {
//   console.log('\n👋 Shutting down server gracefully...');
//   mongoose.connection.close();
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   console.log('\n👋 Shutting down server gracefully...');
//   mongoose.connection.close();
//   process.exit(0);
// });

startServer();
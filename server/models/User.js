import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [3, 'Password must be at least 3 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'hod', 'faculty', 'student', 'staff'],
      message: '{VALUE} is not a valid role. Allowed roles are: admin, hod, faculty, student, staff'
    },
    default: 'faculty',
    required: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    default: 'General'
  },
  designation: {
    type: String,
    trim: true,
    default: 'Faculty'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profilePicture: {
    type: String
  },
  // ✅ ADD PERFORMANCE TRACKING FIELDS
  performanceStats: {
    totalTasksCompleted: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    averageHodRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    averageSubmissionRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    overallPerformanceScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  penalties: [{
    reason: String,
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  penaltyCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// ✅ INDEX FOR FASTER QUERIES
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// ✅ PASSWORD HASHING MIDDLEWARE
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    console.log(`🔐 Hashing password for user: ${this.email}`);
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`✅ Password hashed for: ${this.email}`);
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// ✅ VALIDATE ROLE BEFORE SAVE
userSchema.pre('save', function(next) {
  const allowedRoles = ['admin', 'hod', 'faculty', 'student', 'staff'];
  if (!allowedRoles.includes(this.role)) {
    const error = new Error(`Invalid role: ${this.role}. Allowed roles are: ${allowedRoles.join(', ')}`);
    return next(error);
  }
  next();
});

// ✅ COMPARE PASSWORD METHOD
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log(`🔐 Comparing password for user: ${this.email}`);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`🔐 Password match result for ${this.email}: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    throw error;
  }
};

// ✅ REMOVE PASSWORD FROM JSON OUTPUT
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// ✅ STATIC METHOD TO FIND BY EMAIL
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// ✅ STATIC METHOD TO GET ALLOWED ROLES
userSchema.statics.getAllowedRoles = function() {
  return ['admin', 'hod', 'faculty', 'student', 'staff'];
};

// ✅ INSTANCE METHOD TO CHECK ROLE
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// ✅ INSTANCE METHOD TO CHECK IF USER IS HOD
userSchema.methods.isHOD = function() {
  return this.role === 'hod';
};

// ✅ INSTANCE METHOD TO CHECK IF USER IS ADMIN
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

export default User;
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

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

const verifyData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://antonyluke001_db_user:ando14960@cluster0.4qj7kfi.mongodb.net/taskmanagement?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📁 Database: ${mongoose.connection.name}`);
    
    // Check all users
    const allUsers = await User.find({});
    console.log(`\n👥 Total users in database: ${allUsers.length}`);
    
    if (allUsers.length === 0) {
      console.log('❌ NO USERS FOUND! Please run migration first:');
      console.log('   cd C:\\Task-Management-Portal');
      console.log('   node scripts/migrateData.js');
      return;
    }
    
    // Check faculty
    const faculty = await User.find({ role: 'faculty' });
    console.log(`👩‍🏫 Faculty members: ${faculty.length}`);
    
    // Check HODs
    const hods = await User.find({ role: 'hod' });
    console.log(`👨‍💼 HODs: ${hods.length}`);
    
    console.log('\n📋 ===== USER DETAILS =====');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Name                           | Email                              | Role    | Department                | Password');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    allUsers.forEach(user => {
      const name = user.name.padEnd(30);
      const email = user.email.padEnd(34);
      const role = user.role.padEnd(7);
      const department = (user.department || 'N/A').padEnd(24);
      const password = user.password;
      
      console.log(`${name} | ${email} | ${role} | ${department} | ${password}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test the specific email that's failing
    const testEmail = 'gshobana@aidscollege.edu';
    const testUser = await User.findOne({ email: testEmail });
    
    console.log(`\n🔍 Testing specific email: ${testEmail}`);
    if (testUser) {
      console.log('✅ Found user:', {
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        department: testUser.department
      });
    } else {
      console.log('❌ User not found in database');
      
      // Check similar emails
      const similarUsers = await User.find({ 
        $or: [
          { email: { $regex: 'shobana', $options: 'i' } },
          { name: { $regex: 'shobana', $options: 'i' } }
        ]
      });
      
      if (similarUsers.length > 0) {
        console.log('🔍 Found similar users:');
        similarUsers.forEach(user => {
          console.log(`   - ${user.name} (${user.email})`);
        });
      }
    }
    
    console.log('\n🧪 API Endpoint Simulation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('This is what your /api/users endpoint should return:');
    console.log(JSON.stringify({
      success: true,
      users: allUsers.map(user => ({
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        designation: user.designation
      })),
      count: allUsers.length
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit();
  }
};

verifyData();
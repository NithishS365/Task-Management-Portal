const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://antonystephen2023:LyZ2qcPo8Mn8PBP0@cluster0.awehd.mongodb.net/taskmanagement?retryWrites=true&w=majority';

// User Schema (same as in server)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['hod', 'faculty'], required: true },
  department: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  profileImage: { type: String },
  penaltyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// New users to add
const newUsers = [
  {
    username: 'drarun',
    email: 'arun.kumar@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Dr. Arun Kumar',
    phone: '+91-9876543210',
    profileImage: '/images/staff/arun-kumar.jpg'
  },
  {
    username: 'msmeera',
    email: 'meera.srinivasan@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Ms. Meera Srinivasan',
    phone: '+91-9876543211',
    profileImage: '/images/staff/meera-srinivasan.jpg'
  },
  {
    username: 'drrajesh',
    email: 'rajesh.pandey@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Dr. Rajesh Pandey',
    phone: '+91-9876543212',
    profileImage: '/images/staff/rajesh-pandey.jpg'
  },
  {
    username: 'mspriya',
    email: 'priya.nair@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Ms. Priya Nair',
    phone: '+91-9876543213',
    profileImage: '/images/staff/priya-nair.jpg'
  },
  {
    username: 'drsankar',
    email: 'sankar.reddy@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Dr. Sankar Reddy',
    phone: '+91-9876543214',
    profileImage: '/images/staff/sankar-reddy.jpg'
  },
  {
    username: 'msneha',
    email: 'neha.sharma@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Ms. Neha Sharma',
    phone: '+91-9876543215',
    profileImage: '/images/staff/neha-sharma.jpg'
  },
  {
    username: 'drvijay',
    email: 'vijay.kumar@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Dr. Vijay Kumar',
    phone: '+91-9876543216',
    profileImage: '/images/staff/vijay-kumar.jpg'
  },
  {
    username: 'msraveena',
    email: 'raveena.thomas@aidscollege.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
    fullName: 'Ms. Raveena Thomas',
    phone: '+91-9876543217',
    profileImage: '/images/staff/raveena-thomas.jpg'
  }
];

async function addUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('👥 Adding new users...');
    
    for (const userData of newUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: userData.email },
            { username: userData.username }
          ]
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
        const newUser = new User({
          ...userData,
          password: hashedPassword
        });

        await newUser.save();
        console.log(`✅ Added user: ${userData.fullName} (${userData.email})`);
      } catch (error) {
        console.error(`❌ Failed to add user ${userData.email}:`, error.message);
      }
    }

    // Display all users
    console.log('\n📊 Current users in database:');
    const allUsers = await User.find({}, 'fullName email role department').sort({ role: -1, fullName: 1 });
    allUsers.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.fullName} (${user.email}) - ${user.department}`);
    });

    console.log(`\n🎉 Total users: ${allUsers.length}`);
    console.log('✅ User addition completed successfully!');

  } catch (error) {
    console.error('❌ Error adding users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addUsers();
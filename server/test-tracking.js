// Test script to verify the permanent tracking system is working
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

// Define Task Schema (simplified version for testing)
const taskSchema = new mongoose.Schema({
  title: String,
  status: String,
  priority: String,
  dueDate: Date,
  assignedTo: mongoose.Schema.Types.ObjectId,
  wasOverdue: Boolean,
  reallocated: Boolean,
  reallocationDate: Date
});

const Task = mongoose.model('Task', taskSchema);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement');
    console.log('✅ MongoDB Connected for testing');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test the tracking system
const testTrackingSystem = async () => {
  await connectDB();
  
  console.log('🧪 Testing Permanent Tracking System\n');
  
  try {
    // 1. Check permanently marked overdue tasks
    const permanentlyOverdue = await Task.find({ wasOverdue: true });
    console.log(`📊 Permanently overdue tasks: ${permanentlyOverdue.length}`);
    
    if (permanentlyOverdue.length > 0) {
      console.log('📋 Sample permanently overdue tasks:');
      permanentlyOverdue.slice(0, 5).forEach(task => {
        console.log(`  - ${task.title} (Status: ${task.status}, Due: ${task.dueDate?.toDateString()})`);
      });
    }
    
    // 2. Check permanently marked reallocated tasks
    const permanentlyReallocated = await Task.find({ reallocated: true });
    console.log(`\n🔄 Permanently reallocated tasks: ${permanentlyReallocated.length}`);
    
    if (permanentlyReallocated.length > 0) {
      console.log('📋 Sample permanently reallocated tasks:');
      permanentlyReallocated.slice(0, 3).forEach(task => {
        console.log(`  - ${task.title} (Reallocated: ${task.reallocationDate?.toDateString()})`);
      });
    }
    
    // 3. Check current overdue tasks (dynamic)
    const currentDate = new Date();
    const currentlyOverdue = await Task.find({
      dueDate: { $lt: currentDate },
      status: { $nin: ['completed', 'ForApproval', 'rejected'] }
    });
    console.log(`\n⏰ Currently overdue tasks: ${currentlyOverdue.length}`);
    
    // 4. Compare permanent vs dynamic counts
    console.log('\n📈 Tracking Analysis:');
    console.log(`  Permanently marked overdue: ${permanentlyOverdue.length}`);
    console.log(`  Currently overdue (dynamic): ${currentlyOverdue.length}`);
    console.log(`  Permanently marked reallocated: ${permanentlyReallocated.length}`);
    
    // 5. Test analytics data structure
    console.log('\n🔍 Testing Analytics Data Structure:');
    
    // Overdue by staff (permanent tracking)
    const overdueByStaff = await Task.aggregate([
      { $match: { wasOverdue: true } },
      { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'staff' } },
      { $unwind: '$staff' },
      { $group: { _id: '$staff.fullName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`  Staff with overdue tasks: ${overdueByStaff.length}`);
    overdueByStaff.slice(0, 3).forEach(staff => {
      console.log(`    ${staff._id}: ${staff.count} overdue tasks`);
    });
    
    // Overdue by priority (permanent tracking)
    const overdueByPriority = await Task.aggregate([
      { $match: { wasOverdue: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`\n  Priority distribution:`);
    overdueByPriority.forEach(priority => {
      console.log(`    ${priority._id}: ${priority.count} tasks`);
    });
    
    console.log('\n✅ Tracking system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing tracking system:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
testTrackingSystem();
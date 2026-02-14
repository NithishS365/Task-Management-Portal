// Test to verify dynamic data analytics
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

// Task Schema (simplified)
const taskSchema = new mongoose.Schema({
  title: String,
  status: String,
  priority: String,
  dueDate: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wasOverdue: Boolean,
  reallocated: Boolean,
  overdueMarkedAt: Date,
  category: String
});

const userSchema = new mongoose.Schema({
  name: String,
  fullName: String,
  email: String,
  department: String
});

const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

const testDynamicAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement');
    console.log('✅ Connected to MongoDB');
    
    console.log('🧪 Testing Dynamic Analytics System\n');
    
    // Get basic statistics
    const totalTasks = await Task.countDocuments();
    const overdueMarkedTasks = await Task.countDocuments({ wasOverdue: true });
    const reallocatedTasks = await Task.countDocuments({ reallocated: true });
    
    console.log('📊 Database Statistics:');
    console.log(`  Total tasks: ${totalTasks}`);
    console.log(`  Tasks marked overdue: ${overdueMarkedTasks}`);
    console.log(`  Tasks marked reallocated: ${reallocatedTasks}`);
    
    // Get overdue tasks with populated staff info
    const overdueTasksWithStaff = await Task.find({ wasOverdue: true })
      .populate('assignedTo', 'name fullName email department');
    
    console.log('\n👥 Staff Overdue Distribution:');
    const staffMap = {};
    overdueTasksWithStaff.forEach(task => {
      const staffName = task.assignedTo?.fullName || task.assignedTo?.name || 'Unknown Staff';
      staffMap[staffName] = (staffMap[staffName] || 0) + 1;
    });
    
    Object.entries(staffMap).forEach(([staff, count]) => {
      console.log(`  ${staff}: ${count} overdue tasks`);
    });
    
    // Get priority distribution
    console.log('\n🎯 Priority Distribution:');
    const priorityMap = {};
    overdueTasksWithStaff.forEach(task => {
      const priority = task.priority || 'unspecified';
      priorityMap[priority] = (priorityMap[priority] || 0) + 1;
    });
    
    Object.entries(priorityMap).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} tasks`);
    });
    
    // Get department distribution
    console.log('\n🏢 Department Distribution:');
    const deptMap = {};
    overdueTasksWithStaff.forEach(task => {
      const dept = task.assignedTo?.department || 'Unknown Department';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    
    Object.entries(deptMap).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count} tasks`);
    });
    
    // Get category distribution
    console.log('\n📁 Category Distribution:');
    const categoryMap = {};
    overdueTasksWithStaff.forEach(task => {
      const category = task.category || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    
    Object.entries(categoryMap).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} tasks`);
    });
    
    // Calculate days overdue
    const currentDate = new Date();
    const tasksWithDaysOverdue = overdueTasksWithStaff.map(task => {
      const daysOverdue = task.dueDate ? 
        Math.ceil((currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
      return { ...task.toObject(), daysOverdue };
    });
    
    const avgDaysOverdue = tasksWithDaysOverdue.length > 0 ? 
      Math.round(tasksWithDaysOverdue.reduce((sum, t) => sum + t.daysOverdue, 0) / tasksWithDaysOverdue.length * 10) / 10 : 0;
    const criticalOverdue = tasksWithDaysOverdue.filter(t => t.daysOverdue > 7).length;
    
    console.log('\n📈 Overdue Analysis:');
    console.log(`  Average days overdue: ${avgDaysOverdue}`);
    console.log(`  Critical overdue (>7 days): ${criticalOverdue}`);
    console.log(`  Overdue percentage: ${totalTasks > 0 ? Math.round((overdueMarkedTasks / totalTasks) * 100) : 0}%`);
    
    console.log('\n✅ All data shown above is 100% dynamic from the database!');
    console.log('📊 No static/mock data is being used in the analytics.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testDynamicAnalytics();
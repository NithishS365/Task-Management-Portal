import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement';

await mongoose.connect(mongoUri);
console.log('✅ Connected to MongoDB');

// Task Schema
const TaskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', TaskSchema);

// Check current tasks
const tasks = await Task.find({}).lean();
console.log(`\n📋 Found ${tasks.length} tasks in database:`);

tasks.forEach((task, index) => {
  console.log(`\n${index + 1}. ${task.title}`);
  console.log(`   ID: ${task._id}`);
  console.log(`   AssignedTo: ${task.assignedTo}`);
  console.log(`   Status: ${task.status}`);
  console.log(`   DueDate: ${task.dueDate}`);
  console.log(`   WasOverdue: ${task.wasOverdue || false}`);
  console.log(`   ExtensionApproved: ${task.extensionApproved || false}`);
  console.log(`   OriginalDueDate: ${task.originalDueDate || 'Not set'}`);
  console.log(`   Reallocated: ${task.reallocated || false}`);
  console.log(`   ReallocationDate: ${task.reallocationDate || 'Not set'}`);
  console.log(`   ReallocationReason: ${task.reallocationReason || 'Not set'}`);
  console.log(`   Reassigned: ${task.reassigned || false}`);
  console.log(`   ReassignedAt: ${task.reassignedAt || 'Not set'}`);
  
  // Check reallocation filter conditions
  const condition1 = task.reallocated;
  const condition2 = task.wasOverdue && task.extensionApproved;
  console.log(`   🎯 Reallocation Filters:`);
  console.log(`      - reallocated: ${condition1}`);
  console.log(`      - wasOverdue && extensionApproved: ${condition2}`);
  console.log(`      - Will appear in reallocated filter: ${condition1 || condition2}`);
});

// Extension Requests
const ExtensionRequestSchema = new mongoose.Schema({}, { strict: false });
const ExtensionRequest = mongoose.model('ExtensionRequest', ExtensionRequestSchema);

const requests = await ExtensionRequest.find({}).lean();
console.log(`\n📨 Found ${requests.length} extension requests:`);

requests.forEach((req, index) => {
  console.log(`\n${index + 1}. Task: ${req.taskTitle}`);
  console.log(`   Status: ${req.status}`);
  console.log(`   RequestedBy: ${req.requestedByName}`);
  console.log(`   TaskId: ${req.taskId}`);
});

mongoose.disconnect();
console.log('\n🔌 Disconnected from MongoDB');
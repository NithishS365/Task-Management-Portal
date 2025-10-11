import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const extensionRequestSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  requestedDueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComments: String,
  approvedDueDate: Date,
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const ExtensionRequest = mongoose.model('ExtensionRequest', extensionRequestSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  const requests = await ExtensionRequest.find().populate('taskId').populate('requestedBy', 'name email');
  
  console.log(`\n📨 Found ${requests.length} extension requests:\n`);
  requests.forEach((req, index) => {
    console.log(`${index + 1}. Task: ${req.taskId?.title || 'Unknown'}`);
    console.log(`   Status: ${req.status}`);
    console.log(`   Requested by: ${req.requestedBy?.name || 'Unknown'}`);
    console.log(`   Requested due date: ${req.requestedDueDate}`);
    console.log(`   Approved due date: ${req.approvedDueDate || 'None'}`);
    console.log(`   Review comments: ${req.reviewComments || 'None'}`);
    console.log(`   Reviewed at: ${req.reviewedAt || 'Not reviewed'}`);
    console.log(`   Task ID: ${req.taskId?._id}`);
    console.log();
  });
  
  console.log('🔌 Disconnected from MongoDB');
  mongoose.disconnect();
}).catch(console.error);
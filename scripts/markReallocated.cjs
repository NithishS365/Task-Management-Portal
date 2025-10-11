require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');

async function markTaskAsReallocated() {
    console.log('🔗 Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('taskmanagement');
        
        // Get the first overdue task
        const task = await db.collection('tasks').findOne({ 
            dueDate: { $lt: new Date() }
        });
        
        if (!task) {
            console.log('❌ No overdue tasks found');
            return;
        }
        
        console.log('📋 Found task:', task.title);
        console.log('📅 Original due date:', task.dueDate);
        
        // Mark it as reallocated
        const result = await db.collection('tasks').updateOne(
            { _id: task._id },
            {
                $set: {
                    wasOverdue: true,
                    extensionApproved: true,
                    originalDueDate: task.dueDate,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    status: 'pending',
                    extensionApprovedAt: new Date(),
                    extensionComments: 'Manually marked as reallocated for testing',
                    lastModified: new Date()
                }
            }
        );
        
        console.log('✅ Task updated:', result.modifiedCount, 'documents modified');
        
        // Check the updated task
        const updatedTask = await db.collection('tasks').findOne({ _id: task._id });
        
        console.log('\n🔍 Updated task fields:');
        console.log('  - wasOverdue:', updatedTask.wasOverdue);
        console.log('  - extensionApproved:', updatedTask.extensionApproved);
        console.log('  - status:', updatedTask.status);
        console.log('  - originalDueDate:', updatedTask.originalDueDate);
        console.log('  - newDueDate:', updatedTask.dueDate);
        
        // Verify reallocation filter
        const isReallocated = updatedTask.wasOverdue && updatedTask.extensionApproved;
        console.log('\n🎯 REALLOCATION TEST:');
        console.log('   Filter condition: task.wasOverdue && task.extensionApproved');
        console.log(`   Result: ${updatedTask.wasOverdue} && ${updatedTask.extensionApproved} = ${isReallocated}`);
        console.log(`   ✅ Task ${isReallocated ? 'WILL' : 'WILL NOT'} appear in reallocated column!`);
        
        // Create a notification for the user
        const notification = {
            title: '🔄 Task Reallocated - Testing',
            message: `Your overdue task "${updatedTask.title}" has been reallocated with a new due date. This is a test reallocation.`,
            type: 'task_reallocated',
            userId: updatedTask.assignedTo,
            data: {
                taskId: updatedTask._id,
                taskTitle: updatedTask.title,
                originalDueDate: updatedTask.originalDueDate,
                newDueDate: updatedTask.dueDate,
                wasOverdue: true,
                reallocated: true,
                extensionApproved: true
            },
            read: false,
            createdAt: new Date()
        };
        
        await db.collection('notifications').insertOne(notification);
        console.log('📬 Notification created for testing');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

markTaskAsReallocated();
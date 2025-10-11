require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');

async function testApproval() {
    console.log('🔗 Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('taskmanagement');
        
        // Get the first pending extension request
        const request = await db.collection('extensionrequests').findOne({ status: 'pending' });
        
        if (!request) {
            console.log('❌ No pending extension requests found');
            return;
        }
        
        console.log('📋 Found extension request:', request._id);
        
        // Make API call to approve the request
        const response = await fetch(`http://localhost:5000/api/requests/overdue/${request._id}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer jwt-token-placeholder-mmohammedmustafa@aidscollege.edu'
            },
            body: JSON.stringify({
                newDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                comments: 'Task reallocated with extension approval'
            })
        });
        
        const result = await response.json();
        console.log('📝 Approval response:', result);
        
        if (result.success) {
            // Check task after approval
            console.log('\n🔍 Checking task after approval...');
            const updatedTask = await db.collection('tasks').findOne({ _id: request.taskId });
            console.log('📋 Updated task fields:');
            console.log(`  - wasOverdue: ${updatedTask.wasOverdue}`);
            console.log(`  - extensionApproved: ${updatedTask.extensionApproved}`);
            console.log(`  - status: ${updatedTask.status}`);
            console.log(`  - originalDueDate: ${updatedTask.originalDueDate}`);
            console.log(`  - newDueDate: ${updatedTask.dueDate}`);
            
            // Check notifications
            const notifications = await db.collection('notifications').find({ userId: request.requestedBy }).toArray();
            console.log(`\n📬 Found ${notifications.length} notifications for user`);
            
            console.log('\n✅ TEST COMPLETE: Task should now appear in reallocated column!');
            console.log('🎯 Filter condition: task.wasOverdue && task.extensionApproved');
            console.log(`   Current values: ${updatedTask.wasOverdue} && ${updatedTask.extensionApproved} = ${updatedTask.wasOverdue && updatedTask.extensionApproved}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

testApproval();
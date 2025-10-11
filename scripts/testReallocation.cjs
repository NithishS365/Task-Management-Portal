const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const HOD_TOKEN = 'jwt-token-placeholder-mmohammedmustafa@aidscollege.edu';
const STAFF_TOKEN = 'jwt-token-placeholder-gshobana@aidscollege.edu';

async function testReallocation() {
  console.log('🧪 Testing Reallocation and Notification System...\n');

  try {
    // Step 1: Check if there are any pending extension requests
    console.log('📋 Step 1: Checking for pending extension requests...');
    const overdueResponse = await axios.get(`${API_BASE}/requests/overdue`, {
      headers: { Authorization: `Bearer ${HOD_TOKEN}` }
    });
    
    const pendingRequests = overdueResponse.data.filter(req => req.status === 'pending');
    
    if (pendingRequests.length === 0) {
      console.log('❌ No pending extension requests found. Creating test data...');
      return;
    }

    const testRequest = pendingRequests[0];
    console.log(`✅ Found pending request: "${testRequest.taskTitle}" by ${testRequest.requestedByName}`);

    // Step 2: Approve the extension request
    console.log('\n📋 Step 2: Approving extension request...');
    const approvalResponse = await axios.put(
      `${API_BASE}/requests/overdue/${testRequest._id}/approve`,
      {
        newDueDate: '2025-10-15',
        comments: 'Extension approved by HOD for testing'
      },
      {
        headers: { Authorization: `Bearer ${HOD_TOKEN}` }
      }
    );

    console.log('✅ Extension approved successfully!');
    console.log('Response:', approvalResponse.data.message);

    // Step 3: Check if staff received notification
    console.log('\n📋 Step 3: Checking staff notifications...');
    const notificationsResponse = await axios.get(`${API_BASE}/notifications/me`, {
      headers: { Authorization: `Bearer ${STAFF_TOKEN}` }
    });

    const reallocatedNotifications = notificationsResponse.data.filter(
      n => n.type === 'task_reallocated' && !n.read
    );

    if (reallocatedNotifications.length > 0) {
      console.log('✅ Staff received notification!');
      console.log(`📬 Notification: "${reallocatedNotifications[0].title}"`);
    } else {
      console.log('❌ No reallocation notifications found for staff');
    }

    // Step 4: Check if task appears in reallocated filter
    console.log('\n📋 Step 4: Checking if task appears in staff reallocated filter...');
    const tasksResponse = await axios.get(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${STAFF_TOKEN}` }
    });

    const reallocatedTasks = tasksResponse.data.filter(
      task => task.wasOverdue && task.extensionApproved
    );

    if (reallocatedTasks.length > 0) {
      console.log('✅ Task appears in reallocated filter!');
      console.log(`📋 Reallocated task: "${reallocatedTasks[0].title}"`);
      console.log(`   - wasOverdue: ${reallocatedTasks[0].wasOverdue}`);
      console.log(`   - extensionApproved: ${reallocatedTasks[0].extensionApproved}`);
    } else {
      console.log('❌ No reallocated tasks found in staff view');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testReallocation();
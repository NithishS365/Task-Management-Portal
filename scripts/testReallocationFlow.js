import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const HOD_TOKEN = 'jwt-token-placeholder-mmohammedmustafa@aidscollege.edu';

async function testReallocationFlow() {
  console.log('🧪 Testing Reallocation and Notification Flow...\n');

  try {
    // Step 1: Check existing extension requests
    console.log('📋 Step 1: Checking pending extension requests...');
    const requestsResponse = await axios.get(`${BASE_URL}/requests/overdue`, {
      headers: { Authorization: `Bearer ${HOD_TOKEN}` }
    });
    
    console.log(`✅ Found ${requestsResponse.data.length} extension requests`);
    
    if (requestsResponse.data.length === 0) {
      console.log('❌ No extension requests found. Please create some test data first.');
      return;
    }

    // Get the first pending request
    const pendingRequest = requestsResponse.data.find(req => req.status === 'pending');
    
    if (!pendingRequest) {
      console.log('❌ No pending extension requests found.');
      return;
    }

    console.log(`📝 Found pending request: ${pendingRequest.taskTitle} by ${pendingRequest.staffName}`);

    // Step 2: Test Extension Approval
    console.log('\n📋 Step 2: Testing extension approval...');
    
    const approvalData = {
      newDueDate: '2025-10-15',
      comments: 'Extension approved for testing reallocation functionality'
    };

    const approvalResponse = await axios.put(
      `${BASE_URL}/requests/overdue/${pendingRequest._id}/approve`,
      approvalData,
      {
        headers: { Authorization: `Bearer ${HOD_TOKEN}` }
      }
    );

    console.log('✅ Extension approved successfully!');
    console.log('📄 Response:', approvalResponse.data.message);

    // Step 3: Check if task was properly marked
    console.log('\n📋 Step 3: Verifying task was properly marked...');
    
    const tasksResponse = await axios.get(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${HOD_TOKEN}` }
    });

    const updatedTask = tasksResponse.data.find(task => task._id === pendingRequest.taskId);
    
    if (updatedTask) {
      console.log('✅ Task found after approval:');
      console.log(`  - wasOverdue: ${updatedTask.wasOverdue}`);
      console.log(`  - extensionApproved: ${updatedTask.extensionApproved}`);
      console.log(`  - status: ${updatedTask.status}`);
      console.log(`  - originalDueDate: ${updatedTask.originalDueDate}`);
      console.log(`  - newDueDate: ${updatedTask.dueDate}`);
      
      if (updatedTask.wasOverdue && updatedTask.extensionApproved) {
        console.log('✅ Task is properly marked for reallocation filter!');
      } else {
        console.log('❌ Task is NOT properly marked for reallocation filter!');
      }
    } else {
      console.log('❌ Could not find updated task');
    }

    // Step 4: Check notifications
    console.log('\n📋 Step 4: Checking notifications for staff...');
    
    // We need to get the staff member's user ID to check their notifications
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${HOD_TOKEN}` }
    });

    const staffMember = usersResponse.data.users.find(user => 
      user.email === pendingRequest.staffEmail
    );

    if (staffMember) {
      console.log(`📧 Checking notifications for staff: ${staffMember.name}`);
      
      // Check notifications for this staff member
      const staffToken = `jwt-token-placeholder-${staffMember.email}`;
      
      try {
        const notificationsResponse = await axios.get(`${BASE_URL}/notifications/me`, {
          headers: { Authorization: `Bearer ${staffToken}` }
        });

        console.log(`📬 Found ${notificationsResponse.data.length} notifications for staff`);
        
        const reallocationNotification = notificationsResponse.data.find(notif => 
          notif.type === 'task_reallocated'
        );

        if (reallocationNotification) {
          console.log('✅ Reallocation notification found!');
          console.log(`  - Title: ${reallocationNotification.title}`);
          console.log(`  - Message: ${reallocationNotification.message}`);
        } else {
          console.log('❌ No reallocation notification found for staff');
        }
      } catch (notifError) {
        console.log('❌ Error checking staff notifications:', notifError.message);
      }
    }

    console.log('\n🎯 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testReallocationFlow();
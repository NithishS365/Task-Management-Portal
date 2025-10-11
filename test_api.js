// Simple test script to verify the new API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// You'll need to replace these with actual values after logging in
const TEST_TOKEN = 'your_jwt_token_here';
const TEST_STAFF_ID = 'your_staff_id_here';

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Get individual user
  try {
    console.log('1️⃣ Testing GET /api/users/:id');
    const userResponse = await fetch(`${BASE_URL}/users/${TEST_STAFF_ID}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User endpoint working');
      console.log('User:', userData.user?.name || 'No name');
    } else {
      console.log('❌ User endpoint failed:', userResponse.status);
    }
  } catch (error) {
    console.log('❌ User endpoint error:', error.message);
  }

  console.log('');

  // Test 2: Get staff statistics
  try {
    console.log('2️⃣ Testing GET /api/tasks/staff/:staffId/statistics');
    const statsResponse = await fetch(`${BASE_URL}/tasks/staff/${TEST_STAFF_ID}/statistics`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Statistics endpoint working');
      console.log('Total tasks:', statsData.statistics?.totalTasks || 0);
      console.log('Completion rate:', statsData.statistics?.completionRate || 0, '%');
    } else {
      console.log('❌ Statistics endpoint failed:', statsResponse.status);
    }
  } catch (error) {
    console.log('❌ Statistics endpoint error:', error.message);
  }

  console.log('\n🔍 Instructions:');
  console.log('1. Log in to the application to get a JWT token');
  console.log('2. Replace TEST_TOKEN and TEST_STAFF_ID in this script');
  console.log('3. Run: node test_api.js');
}

testEndpoints();
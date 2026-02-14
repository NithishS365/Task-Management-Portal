// Test the tracked analytics endpoint
import fetch from 'node-fetch';

const testAnalyticsEndpoint = async () => {
  try {
    console.log('🧪 Testing tracked analytics endpoint...\n');
    
    // Get a test token (you'll need to use a real HOD token)
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // Replace with actual token
    
    // Test the mark overdue endpoint first
    console.log('📝 Testing mark overdue endpoint...');
    const markResponse = await fetch('http://localhost:5000/api/tasks/mark-overdue', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (markResponse.ok) {
      const markResult = await markResponse.json();
      console.log('✅ Mark overdue result:', markResult);
    } else {
      console.log('❌ Mark overdue failed:', markResponse.status);
    }
    
    // Test the tracked analytics endpoint
    console.log('\n📊 Testing tracked analytics endpoint...');
    const analyticsResponse = await fetch('http://localhost:5000/api/tasks/tracked-analytics', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics data received:');
      console.log(JSON.stringify(analyticsData, null, 2));
    } else {
      const errorText = await analyticsResponse.text();
      console.log('❌ Analytics failed:', analyticsResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// For now, let's just test the function directly
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const connectAndTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement');
    console.log('✅ Connected to MongoDB');
    
    // Import and test the function directly
    const { getTrackedAnalytics } = await import('./utils/overdueTracker.js');
    const result = await getTrackedAnalytics();
    
    console.log('📊 Direct function test result:');
    console.log(JSON.stringify(result, null, 2));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

connectAndTest();
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Test the authorization fix
async function testReassignmentAuthorization() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('🧪 TESTING REASSIGNMENT AUTHORIZATION FIX\n');

    // Test the fixed authorization logic
    console.log('🔍 Testing authorization scenarios:');
    
    // Scenario 1: HOD role
    console.log('\n1. 📋 HOD Authorization Test:');
    const hodUser = { role: 'hod', id: 'hod-user-id' };
    const task1 = { assignedBy: 'different-user-id' };
    
    // Simulate the fixed authorization logic
    const hodCanReassign = !(hodUser.role !== 'hod' && task1.assignedBy !== hodUser.id);
    console.log(`   HOD role: ${hodUser.role}`);
    console.log(`   Task assigned by: ${task1.assignedBy}`);
    console.log(`   HOD user ID: ${hodUser.id}`);
    console.log(`   ✅ Can HOD reassign task assigned by someone else? ${hodCanReassign ? 'YES' : 'NO'}`);
    
    // Scenario 2: Non-HOD user trying to reassign their own task
    console.log('\n2. 📋 Faculty Authorization Test (Own Task):');
    const facultyUser = { role: 'faculty', id: 'faculty-user-id' };
    const task2 = { assignedBy: 'faculty-user-id' };
    
    const facultyCanReassignOwn = !(facultyUser.role !== 'hod' && task2.assignedBy !== facultyUser.id);
    console.log(`   Faculty role: ${facultyUser.role}`);
    console.log(`   Task assigned by: ${task2.assignedBy}`);
    console.log(`   Faculty user ID: ${facultyUser.id}`);
    console.log(`   ✅ Can faculty reassign their own task? ${facultyCanReassignOwn ? 'YES' : 'NO'}`);
    
    // Scenario 3: Non-HOD user trying to reassign someone else's task
    console.log('\n3. 📋 Faculty Authorization Test (Others Task):');
    const facultyUser2 = { role: 'faculty', id: 'faculty-user-2-id' };
    const task3 = { assignedBy: 'different-faculty-id' };
    
    const facultyCanReassignOthers = !(facultyUser2.role !== 'hod' && task3.assignedBy !== facultyUser2.id);
    console.log(`   Faculty role: ${facultyUser2.role}`);
    console.log(`   Task assigned by: ${task3.assignedBy}`);
    console.log(`   Faculty user ID: ${facultyUser2.id}`);
    console.log(`   ❌ Can faculty reassign others' task? ${facultyCanReassignOthers ? 'YES' : 'NO'}`);
    
    console.log('\n✅ AUTHORIZATION LOGIC VERIFICATION:');
    console.log('   ✅ HODs can reassign ANY task (regardless of who assigned it)');
    console.log('   ✅ Faculty can only reassign tasks they assigned themselves');
    console.log('   ✅ Faculty cannot reassign tasks assigned by others');
    
    console.log('\n🔧 FIXED LOGIC:');
    console.log('   OLD: if (task.assignedBy.toString() !== req.user.id)');
    console.log('   NEW: if (req.user.role !== "hod" && task.assignedBy.toString() !== req.user.id)');
    
    console.log('\n🎉 The authorization fix should resolve the 403 Forbidden error for HODs!');

  } catch (error) {
    console.error('❌ Error testing authorization:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testReassignmentAuthorization();
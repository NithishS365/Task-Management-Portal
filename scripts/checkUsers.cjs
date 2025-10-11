require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkUsers() {
    console.log('🔗 Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('taskmanagement');
        
        // Check all users
        const users = await db.collection('users').find({}).toArray();
        console.log(`\n👥 Found ${users.length} users in database:`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name || user.fullName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   ID: ${user._id}`);
            console.log('');
        });
        
        // Check specifically for staff users
        const staffUsers = await db.collection('users').find({ role: 'faculty' }).toArray();
        console.log(`📋 Staff/Faculty users (${staffUsers.length}):`);
        staffUsers.forEach(user => {
            console.log(`  - ${user.name || user.fullName} (${user.email})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

checkUsers();
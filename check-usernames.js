import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsernames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const users = await mongoose.connection.db.collection('users').find({
            username: { $in: ['AIDS_HOD001', 'aids_hod001', 'gshobana', 'GSHOBANA'] }
        }).toArray();
        
        console.log('🔍 Found users:');
        users.forEach(user => {
            console.log(`  - Username: "${user.username}" | Email: "${user.email}" | Name: "${user.name}"`);
        });
        
        if (users.length === 0) {
            console.log('❌ No users found with those usernames');
            
            // Let's check what usernames actually exist
            const allUsers = await mongoose.connection.db.collection('users').find({}, {
                projection: { username: 1, email: 1, name: 1 }
            }).limit(5).toArray();
            
            console.log('\n📋 Sample usernames in database:');
            allUsers.forEach(user => {
                console.log(`  - Username: "${user.username}" | Email: "${user.email}"`);
            });
        }
        
        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkUsernames();
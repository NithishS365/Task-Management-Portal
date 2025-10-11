import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // ✅ CHECK IF MONGODB_URI EXISTS
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    console.log('📊 Connection string provided:', process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':$1***@'));

    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      bufferCommands: false,
      bufferMaxEntries: 0,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);

    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log(`📊 Database Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // ✅ CONNECTION EVENT HANDLERS
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB Atlas');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB Atlas');
    });

    return conn;

  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error('Error message:', error.message);
    
    // ✅ PROVIDE HELPFUL ERROR MESSAGES
    if (error.message.includes('MONGODB_URI')) {
      console.error('💡 Solution: Set your MONGODB_URI in the .env file');
    } else if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.error('💡 Solution: Check your MongoDB Atlas username and password');
      console.error('💡 Make sure the user has proper database permissions');
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      console.error('💡 Solution: Check your internet connection and MongoDB Atlas network access');
      console.error('💡 Add 0.0.0.0/0 to Network Access in MongoDB Atlas for testing');
    } else if (error.message.includes('serverSelection')) {
      console.error('💡 Solution: Check if your MongoDB Atlas cluster is running');
      console.error('💡 Verify the cluster URL in your connection string');
    }
    
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('1. Check MongoDB Atlas cluster status');
    console.error('2. Verify Network Access settings (add 0.0.0.0/0)');
    console.error('3. Confirm database user credentials');
    console.error('4. Test internet connection');
    
    process.exit(1);
  }
};

export default connectDB;
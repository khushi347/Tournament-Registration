const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tournament_db';
    
    // In Mongoose 6+, options like useNewUrlParser and useUnifiedTopology are enabled by default
    const conn = await mongoose.connect(mongoURI);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    }
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Close MongoDB connection gracefully
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Database] MongoDB connection closed gracefully.');
    }
  } catch (error) {
    console.error(`[Database] Error during MongoDB connection close: ${error.message}`);
  }
};

// Graceful shutdown listeners
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB
};

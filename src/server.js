// Load environment variables as early as possible
require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to Database and start server
const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Start Listening
    const server = app.listen(PORT, () => {
      console.log(`[Server] Tournament system backend is running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server shutdown issues or unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
      // Close server and exit
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('uncaughtException', (err) => {
      console.error(`[Server Error] Uncaught Exception: ${err.message}`);
      // Close server and exit
      process.exit(1);
    });

  } catch (error) {
    console.error(`[Server Boot Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

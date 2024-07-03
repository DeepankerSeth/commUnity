// Purpose: Establish a connection to MongoDB using Mongoose with best practices.

// Improvements:
// Added auto-reconnection and retry logic.
// Used environment variables for configuration.
// Added comments for clarity.

//connection to mongoDB
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using environment variables for configuration
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      autoReconnect: true, // Enable auto-reconnection
      reconnectTries: Number.MAX_VALUE, // Retry indefinitely
      reconnectInterval: 500, // Reconnect every 500ms
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

// Export the connectDB function
module.exports = connectDB;

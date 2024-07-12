// establish a connection to MongoDB using Mongoose with best practices.
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB: ', err.message);
    process.exit(1);
  }
};

export default connectDB;
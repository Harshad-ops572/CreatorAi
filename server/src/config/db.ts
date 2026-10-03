import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    if (env.MONGODB_URI && env.MONGODB_URI.trim() !== '') {
      console.log('Connecting to configured MongoDB (Atlas)...');
      await mongoose.connect(env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas successfully.');
    } else {
      console.log('No MONGODB_URI found in .env. Initializing in-memory Mongo server for zero-config dev...');
      // Dynamic import to avoid memory overhead if not needed
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to in-memory MongoDB instance successfully at:', uri);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

import mongoose from 'mongoose';

export function safeError(err) {
  return String(err?.message || err).replace(/\/\/([^/\s:@]+):([^@\s]+)@/g, '//$1:***@');
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    console.error('SESSION_SECRET must be at least 16 characters');
    process.exit(1);
  }
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
      appName: 'arman-holding-crm',
    });
  } catch (err) {
    console.error('MongoDB connection failed:', safeError(err));
    process.exit(1);
  }
  console.log('MongoDB connected, database:', mongoose.connection.name);
}

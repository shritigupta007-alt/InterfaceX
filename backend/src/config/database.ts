import mongoose from 'mongoose';

export async function connectDB(uri?: string): Promise<typeof mongoose> {
  const connectionString = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interfacex';

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} (${conn.connection.host})`);
    return conn;
  } catch (err: any) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    console.error(`[MongoDB] Tip: Ensure MongoDB is running locally (e.g., mongod or Docker: docker run -p 27017:27017 mongo) or set MONGODB_URI in backend/.env`);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('[MongoDB] Disconnected.');
}

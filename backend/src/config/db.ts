import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://info_db_user:mVZnTk06RiZIiZQe@cluster0.qvxniat.mongodb.net';
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'softdeals_sms',
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[Database] MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

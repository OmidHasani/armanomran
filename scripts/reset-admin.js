import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from '../server/db.js';
import { User } from '../server/models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const username = String(process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
if (password.length < 5) {
  console.error('ADMIN_PASSWORD must be at least 5 characters');
  process.exit(1);
}

await connectDb();
const passwordHash = await bcrypt.hash(password, 12);
await User.updateOne(
  { username },
  {
    $set: {
      passwordHash,
      name: process.env.ADMIN_NAME || 'مدیر سیستم',
      role: 'admin',
      active: true,
    },
    $setOnInsert: { username },
  },
  { upsert: true },
);
console.log('Admin password updated for', username);
await mongoose.disconnect();

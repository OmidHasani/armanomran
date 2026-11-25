import bcrypt from 'bcryptjs';
import { User } from './models.js';
import { ROLE_DEFAULTS } from './perms.js';
import { ensureLegalUnit } from './units.js';
import { migrateWorkCases } from './workcases.js';

let dummyHash = '';

export function getDummyHash() {
  return dummyHash;
}

const MIN_PASSWORD = 5;

export async function ensureAdmin() {
  dummyHash = await bcrypt.hash('not-a-real-user', 12);
  const username = String(process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || 'admin');
  if (!await User.exists({ username })) {
    if (password.length < MIN_PASSWORD) throw new Error('Initial admin password is too short');
    await User.create({username,passwordHash:await bcrypt.hash(password,12),name:process.env.ADMIN_NAME||'مدیر سیستم',role:'admin',perms:ROLE_DEFAULTS.admin,active:true});
  }
  await ensureLegalUnit();
  try {
    const migrated = await migrateWorkCases();
    if (migrated.migrated) console.log('WorkCase migration:', migrated.migrated, 'cases');
  } catch (err) {
    console.error('WorkCase migration failed:', err?.message || err);
  }
}

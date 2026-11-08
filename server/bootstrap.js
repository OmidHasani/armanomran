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
  const count = await User.countDocuments();

  if (count === 0) {
    if (password.length < MIN_PASSWORD) {
      console.error(`No users exist. Set ADMIN_PASSWORD (at least ${MIN_PASSWORD} characters) and start again.`);
      process.exit(1);
    }
    await User.create({
      username,
      passwordHash: await bcrypt.hash(password, 12),
      name: process.env.ADMIN_NAME || 'مدیر سیستم',
      role: 'admin',
      perms: ROLE_DEFAULTS.admin,
      unitIds: [],
      active: true,
    });
    console.log('Initial admin user created:', username);
  } else {
    await User.updateMany({ role: 'admin', $or: [{ perms: { $exists: false } }, { perms: { $size: 0 } }] }, { $set: { perms: ROLE_DEFAULTS.admin } });
    await User.updateMany(
      { role: 'legal', perms: { $nin: ['inbox'] } },
      { $addToSet: { perms: { $each: ['legal', 'inbox'] } } },
    );
    await User.updateMany(
      { role: 'staff', perms: { $nin: ['inbox'] } },
      { $addToSet: { perms: 'inbox' } },
    );

    // Ensure env admin exists; only refresh password when it no longer matches .env
    // (avoids rewriting hash on every restart while keeping admin/admin reliable).
    if (password.length >= MIN_PASSWORD) {
      const existing = await User.findOne({ username });
      if (!existing) {
        await User.create({
          username,
          passwordHash: await bcrypt.hash(password, 12),
          name: process.env.ADMIN_NAME || 'مدیر سیستم',
          role: 'admin',
          perms: ROLE_DEFAULTS.admin,
          unitIds: [],
          active: true,
        });
        console.log('Admin user ensured:', username);
      } else {
        const ok = existing.passwordHash ? await bcrypt.compare(password, existing.passwordHash) : false;
        if (!ok) existing.passwordHash = await bcrypt.hash(password, 12);
        existing.role = 'admin';
        existing.perms = ROLE_DEFAULTS.admin;
        existing.active = true;
        if (!existing.name) existing.name = process.env.ADMIN_NAME || 'مدیر سیستم';
        await existing.save();
      }
    }
  }

  await ensureLegalUnit();
  try {
    const migrated = await migrateWorkCases();
    if (migrated.migrated) console.log('WorkCase migration:', migrated.migrated, 'cases');
  } catch (err) {
    console.error('WorkCase migration failed:', err?.message || err);
  }
}

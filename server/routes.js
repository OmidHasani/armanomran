import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { getDummyHash } from './bootstrap.js';
import {
  addFollowUp,
  CASE_STATUS,
  FOLLOW_ACTIONS,
  FOLLOW_RESULTS,
  FOLLOW_SUBJECTS,
  getAdminSettings,
  getLegalCase,
  legalStats,
  listLegalCases,
  referManual,
  saveAdminSettings,
  syncLegalReferrals,
  updateLegalStatus,
} from './legal.js';
import { User } from './models.js';
import {
  hasPerm,
  normalizePerms,
  normalizeRole,
  normalizeUnitIds,
  PERM_DEFS,
  publicUser,
  ROLE_DEFAULTS,
  ROLES,
} from './perms.js';
import { loadState, saveState } from './persist.js';
import {
  applyUserUnitMembership,
  createUnit,
  deleteUnit,
  listUnits,
  syncUserUnits,
  updateUnit,
} from './units.js';
import { AppError } from './validate.js';
import {
  addWorkFollowUp,
  assignWorkCase,
  CASE_KINDS,
  createWorkCase,
  deleteWorkCase,
  getWorkCase,
  listWorkCases,
  purgeWorkCases,
  transferWorkCase,
  updateWorkStatus,
  workStats,
} from './workcases.js';

export const api = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: { message: 'تلاش‌های ورود بیش از حد است. ۱۵ دقیقه بعد دوباره امتحان کنید.' },
});

async function requireAuth(req, res, next) {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: 'وارد نشده‌اید' });
    const user = await User.findById(req.session.userId);
    if (!user || !user.active) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'وارد نشده‌اید' });
    }
    user.role = normalizeRole(user.role);
    user.perms = normalizePerms(user.role, user.perms);
    user.unitIds = normalizeUnitIds(user.unitIds);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requirePerm(key) {
  return (req, res, next) => {
    if (!hasPerm(req.user, key)) return res.status(403).json({ message: 'به این بخش دسترسی ندارید' });
    next();
  };
}

function canRefer(user) {
  return hasPerm(user, 'write') || hasPerm(user, 'admin') || hasPerm(user, 'legal') || hasPerm(user, 'inbox');
}

function canInbox(user) {
  return hasPerm(user, 'inbox') || hasPerm(user, 'legal') || hasPerm(user, 'admin')
    || normalizeUnitIds(user.unitIds).length > 0;
}

api.get('/health', (req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({ ok: up });
});

api.get('/meta/options', (req, res) => {
  res.json({
    roles: ROLES,
    perms: PERM_DEFS,
    roleDefaults: ROLE_DEFAULTS,
    caseStatus: CASE_STATUS,
    caseKinds: CASE_KINDS,
    followActions: FOLLOW_ACTIONS,
    followSubjects: FOLLOW_SUBJECTS,
    followResults: FOLLOW_RESULTS,
  });
});

api.post('/auth/login', loginLimit, wrap(async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = username ? await User.findOne({ username }) : null;
  const hash = user?.passwordHash || getDummyHash();
  const ok = hash ? await bcrypt.compare(password, hash) : false;
  if (!user || !user.active || !ok) {
    throw new AppError('نام کاربری یا رمز عبور نادرست است', 401);
  }
  await new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
  req.session.userId = String(user._id);
  await new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  res.json({ user: publicUser(user) });
}));

api.post('/auth/logout', (req, res) => {
  const cookie = req.session?.cookie;
  req.session.destroy(() => {
    res.clearCookie('arman.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: cookie?.secure || false,
    });
    res.json({ ok: true });
  });
});

api.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

api.post('/auth/password', requireAuth, wrap(async (req, res) => {
  const current = String(req.body?.current || '');
  const next = String(req.body?.next || '');
  if (next.length < 5 || next.length > 72) throw new AppError('رمز جدید باید بین ۵ تا ۷۲ کاراکتر باشد');
  const ok = await bcrypt.compare(current, req.user.passwordHash);
  if (!ok) throw new AppError('رمز فعلی نادرست است', 401);
  req.user.passwordHash = await bcrypt.hash(next, 12);
  await req.user.save();
  res.json({ ok: true });
}));

api.get('/state', requireAuth, wrap(async (req, res) => {
  if (!hasPerm(req.user, 'dash') && !hasPerm(req.user, 'write') && !hasPerm(req.user, 'legal')
    && !hasPerm(req.user, 'acct') && !hasPerm(req.user, 'admin') && !hasPerm(req.user, 'inbox')) {
    throw new AppError('به سامانه دسترسی ندارید', 403);
  }
  const state = await loadState();
  const settings = await getAdminSettings();
  state.data.cfg = { ...state.data.cfg, legalDays: settings.legalDays, autoLegal: settings.autoLegal };
  res.json(state);
}));

api.put('/state', requireAuth, wrap(async (req, res) => {
  if (!hasPerm(req.user, 'write') && !hasPerm(req.user, 'acct') && !hasPerm(req.user, 'admin')) {
    throw new AppError('اجازه ثبت و ویرایش ندارید', 403);
  }
  const version = Number(req.body?.version ?? 0);
  if (!Number.isInteger(version) || version < 0) throw new AppError('نسخه داده‌ها نامعتبر است');
  const saved = await saveState(req.user, version, req.body?.data);
  syncLegalReferrals(req.user.name || req.user.username).catch(() => {});
  res.json(saved);
}));

api.get('/admin/export', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  const state = await loadState();
  res.setHeader('Content-Disposition', 'attachment; filename="arman-crm-backup.json"');
  res.json({ exportedAt: new Date().toISOString(), ...state });
}));

api.get('/admin/settings', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  res.json(await getAdminSettings());
}));

api.put('/admin/settings', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  const saved = await saveAdminSettings(req.body || {});
  const synced = await syncLegalReferrals(req.user.name || 'مدیر');
  res.json({ ...saved, synced });
}));

api.post('/admin/legal-sync', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  res.json(await syncLegalReferrals(req.user.name || 'مدیر'));
}));

api.get('/units', requireAuth, wrap(async (req, res) => {
  if (!hasPerm(req.user, 'admin') && !canRefer(req.user) && !canInbox(req.user)) {
    throw new AppError('به واحدها دسترسی ندارید', 403);
  }
  const activeOnly = !hasPerm(req.user, 'admin') || req.query.active === '1';
  res.json(await listUnits({ activeOnly: !!activeOnly && !hasPerm(req.user, 'admin') }));
}));

api.get('/units/all', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  res.json(await listUnits({ activeOnly: false }));
}));

api.post('/units', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  res.status(201).json(await createUnit(req.body || {}));
}));

api.put('/units/:id', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  res.json(await updateUnit(req.params.id, req.body || {}));
}));

api.delete('/units/:id', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  res.json(await deleteUnit(req.params.id));
}));

api.get('/users', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  const users = await User.find().sort({ createdAt: 1 }).select('-passwordHash').lean();
  res.json(users.map((user) => ({
    ...publicUser(user),
    lastLoginAt: user.lastLoginAt || null,
  })));
}));

api.get('/users/directory', requireAuth, wrap(async (req, res) => {
  if (!canRefer(req.user) && !canInbox(req.user) && !hasPerm(req.user, 'admin')) {
    throw new AppError('دسترسی ندارید', 403);
  }
  const users = await User.find({ active: { $ne: false } }).sort({ name: 1 }).select('name username unitIds role').lean();
  res.json(users.map((u) => ({
    id: String(u._id),
    name: u.name,
    username: u.username,
    role: u.role,
    unitIds: normalizeUnitIds(u.unitIds),
  })));
}));

api.post('/users', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim();
  const password = String(req.body?.password || '');
  const role = normalizeRole(req.body?.role);
  const perms = normalizePerms(role, req.body?.perms);
  const unitIds = normalizeUnitIds(req.body?.unitIds);
  const active = req.body?.active !== false;
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new AppError('نام کاربری فقط حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط، بین ۳ تا ۳۲ نویسه');
  if (name.length < 2 || name.length > 80) throw new AppError('نام کاربر را وارد کنید');
  if (password.length < 5 || password.length > 72) throw new AppError('رمز کاربر باید بین ۵ تا ۷۲ کاراکتر باشد');
  try {
    const user = await User.create({
      username,
      name,
      role,
      perms,
      unitIds,
      active,
      passwordHash: await bcrypt.hash(password, 12),
    });
    await applyUserUnitMembership(user);
    const fresh = await User.findById(user._id);
    res.status(201).json(publicUser(fresh));
  } catch (err) {
    if (err?.code === 11000) throw new AppError('این نام کاربری وجود دارد', 409);
    throw err;
  }
}));

api.put('/users/:id', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('کاربر پیدا نشد', 404);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('کاربر پیدا نشد', 404);
  const name = String(req.body?.name || user.name).trim();
  if (name.length < 2 || name.length > 80) throw new AppError('نام کاربر را وارد کنید');
  const role = normalizeRole(req.body?.role ?? user.role);
  if (user.role === 'admin' && role !== 'admin') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) throw new AppError('نقش آخرین مدیر را نمی‌توان تغییر داد');
  }
  user.name = name;
  user.role = role;
  user.perms = normalizePerms(role, req.body?.perms);
  if (Array.isArray(req.body?.unitIds)) {
    user.unitIds = normalizeUnitIds(req.body.unitIds);
  }
  if (typeof req.body?.active === 'boolean') {
    if (String(user._id) === String(req.user._id) && !req.body.active) throw new AppError('نمی‌توانید خودتان را غیرفعال کنید');
    if (user.role === 'admin' && !req.body.active) {
      const admins = await User.countDocuments({ role: 'admin', active: true });
      if (admins <= 1) throw new AppError('آخرین مدیر فعال را نمی‌توان غیرفعال کرد');
    }
    user.active = req.body.active;
  }
  const password = String(req.body?.password || '');
  if (password) {
    if (password.length < 5 || password.length > 72) throw new AppError('رمز کاربر باید بین ۵ تا ۷۲ کاراکتر باشد');
    user.passwordHash = await bcrypt.hash(password, 12);
  }
  await user.save();
  await applyUserUnitMembership(user);
  const fresh = await User.findById(user._id);
  res.json(publicUser(fresh));
}));

api.delete('/users/:id', requireAuth, requirePerm('admin'), wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('کاربر پیدا نشد', 404);
  if (String(req.user._id) === req.params.id) throw new AppError('نمی‌توانید کاربر خودتان را حذف کنید');
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('کاربر پیدا نشد', 404);
  if (user.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) throw new AppError('آخرین مدیر را نمی‌توان حذف کرد');
  }
  await syncUserUnits(user._id, []);
  await user.deleteOne();
  res.json({ ok: true });
}));

api.get('/workcases', requireAuth, wrap(async (req, res) => {
  if (!canInbox(req.user)) throw new AppError('به صندوق ارجاعات دسترسی ندارید', 403);
  res.json({
    cases: await listWorkCases(req.user, {
      status: req.query.status,
      unitId: req.query.unitId,
      unitCode: req.query.unitCode,
      mine: req.query.mine,
    }),
    stats: await workStats(req.user, {
      unitId: req.query.unitId,
      unitCode: req.query.unitCode,
    }),
  });
}));

api.post('/workcases/purge', requireAuth, wrap(async (req, res) => {
  res.json(await purgeWorkCases(req.body || {}, req.user));
}));

api.delete('/workcases/:id', requireAuth, wrap(async (req, res) => {
  res.json(await deleteWorkCase(req.params.id, req.user));
}));

api.get('/workcases/:id', requireAuth, wrap(async (req, res) => {
  if (!canInbox(req.user)) throw new AppError('به صندوق ارجاعات دسترسی ندارید', 403);
  res.json(await getWorkCase(req.params.id, req.user));
}));

api.post('/workcases', requireAuth, wrap(async (req, res) => {
  if (!canRefer(req.user)) throw new AppError('اجازه ارجاع ندارید', 403);
  res.status(201).json(await createWorkCase(req.body || {}, req.user));
}));

api.patch('/workcases/:id/status', requireAuth, wrap(async (req, res) => {
  if (!canInbox(req.user)) throw new AppError('به صندوق ارجاعات دسترسی ندارید', 403);
  res.json(await updateWorkStatus(req.params.id, req.body?.status, req.user));
}));

api.post('/workcases/:id/followups', requireAuth, wrap(async (req, res) => {
  if (!canInbox(req.user)) throw new AppError('به صندوق ارجاعات دسترسی ندارید', 403);
  res.status(201).json(await addWorkFollowUp(req.params.id, req.body || {}, req.user));
}));

api.post('/workcases/:id/transfer', requireAuth, wrap(async (req, res) => {
  if (!canInbox(req.user) && !canRefer(req.user)) throw new AppError('اجازه انتقال ندارید', 403);
  res.json(await transferWorkCase(req.params.id, req.body || {}, req.user));
}));

api.post('/workcases/:id/assign', requireAuth, wrap(async (req, res) => {
  if (!canInbox(req.user)) throw new AppError('اجازه واگذاری ندارید', 403);
  res.json(await assignWorkCase(req.params.id, req.body || {}, req.user));
}));

api.delete('/legal/cases/:id', requireAuth, wrap(async (req, res) => {
  res.json(await deleteWorkCase(req.params.id, req.user));
}));

api.get('/legal/cases', requireAuth, requirePerm('legal'), wrap(async (req, res) => {
  res.json({
    cases: await listLegalCases({ status: req.query.status }, req.user),
    stats: await legalStats(req.user),
    settings: await getAdminSettings(),
  });
}));

api.get('/legal/cases/:id', requireAuth, requirePerm('legal'), wrap(async (req, res) => {
  res.json(await getLegalCase(req.params.id, req.user));
}));

api.post('/legal/refer', requireAuth, wrap(async (req, res) => {
  if (!canRefer(req.user)) throw new AppError('اجازه ارجاع ندارید', 403);
  res.status(201).json(await referManual(req.body || {}, req.user));
}));

api.patch('/legal/cases/:id/status', requireAuth, requirePerm('legal'), wrap(async (req, res) => {
  res.json(await updateLegalStatus(req.params.id, req.body?.status, req.user));
}));

api.post('/legal/cases/:id/followups', requireAuth, requirePerm('legal'), wrap(async (req, res) => {
  res.status(201).json(await addFollowUp(req.params.id, req.body || {}, req.user));
}));

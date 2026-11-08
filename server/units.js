import mongoose from 'mongoose';
import { LegalCase, OrgUnit, User } from './models.js';
import { normalizeUnitIds } from './perms.js';
import { AppError } from './validate.js';
import { uid } from './dates.js';

const CODE_RE = /^[a-z][a-z0-9_-]{1,31}$/;

export function serializeUnit(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    name: doc.name || '',
    code: doc.code || '',
    note: doc.note || '',
    active: doc.active !== false,
    memberIds: normalizeUnitIds(doc.memberIds),
    headId: doc.headId ? String(doc.headId) : '',
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}

export async function listUnits({ activeOnly = false } = {}) {
  const filter = activeOnly ? { active: true } : {};
  const rows = await OrgUnit.find(filter).sort({ name: 1 }).lean();
  return rows.map(serializeUnit);
}

export async function getUnitById(id) {
  const unit = await OrgUnit.findById(id).lean();
  if (!unit) throw new AppError('واحد سازمانی پیدا نشد', 404);
  return serializeUnit(unit);
}

export async function getUnitByCode(code) {
  const unit = await OrgUnit.findOne({ code: String(code || '').toLowerCase().trim() }).lean();
  return unit ? serializeUnit(unit) : null;
}

async function assertUserIdsExist(ids) {
  const list = normalizeUnitIds(ids);
  if (!list.length) return [];
  const found = await User.find({ _id: { $in: list.filter((id) => mongoose.isValidObjectId(id)) } }).select('_id').lean();
  const ok = new Set(found.map((u) => String(u._id)));
  const bad = list.filter((id) => !ok.has(id));
  if (bad.length) throw new AppError('یک یا چند عضو انتخاب‌شده در سامانه وجود ندارد');
  return list;
}

/** Sync membership using $addToSet / $pull — safer than full-array replace under concurrency. */
export async function syncMembership(unitId, memberIds) {
  const id = String(unitId);
  const members = new Set(normalizeUnitIds(memberIds));
  const users = await User.find().select('_id unitIds').lean();
  const ops = [];
  for (const user of users) {
    const uidStr = String(user._id);
    const has = normalizeUnitIds(user.unitIds).includes(id);
    const should = members.has(uidStr);
    if (should && !has) ops.push(User.updateOne({ _id: user._id }, { $addToSet: { unitIds: id } }));
    else if (!should && has) ops.push(User.updateOne({ _id: user._id }, { $pull: { unitIds: id } }));
  }
  if (ops.length) await Promise.all(ops);
}

export async function syncUserUnits(userId, unitIds) {
  const id = String(userId);
  const wanted = new Set(normalizeUnitIds(unitIds));
  const units = await OrgUnit.find().select('_id memberIds').lean();
  const ops = [];
  for (const unit of units) {
    const unitId = String(unit._id);
    const has = normalizeUnitIds(unit.memberIds).includes(id);
    const should = wanted.has(unitId);
    if (should && !has) {
      ops.push(OrgUnit.updateOne(
        { _id: unit._id },
        { $addToSet: { memberIds: id }, $set: { updatedAt: new Date() } },
      ));
    } else if (!should && has) {
      ops.push(OrgUnit.updateOne(
        { _id: unit._id },
        { $pull: { memberIds: id }, $set: { updatedAt: new Date() } },
      ));
    }
  }
  if (ops.length) await Promise.all(ops);
}

/** Keep legal unit membership aligned with role=legal + active users. */
export async function ensureLegalUnit() {
  const now = new Date();
  let unit = await OrgUnit.findOne({ code: 'legal' });
  if (!unit) {
    unit = await OrgUnit.create({
      _id: uid(),
      name: 'واحد حقوقی',
      code: 'legal',
      note: 'ارجاع معوقات و پرونده‌های حقوقی',
      active: true,
      memberIds: [],
      headId: '',
      createdAt: now,
      updatedAt: now,
    });
  }
  const legalId = String(unit._id);
  const legalUsers = await User.find({ role: 'legal', active: { $ne: false } }).select('_id').lean();
  const legalMemberIds = legalUsers.map((u) => String(u._id));

  // Add current legal users
  await User.updateMany(
    { _id: { $in: legalMemberIds } },
    { $addToSet: { unitIds: legalId } },
  );

  // Remove inactive / demoted from legal unit (keep other units)
  const stale = normalizeUnitIds(unit.memberIds).filter((id) => !legalMemberIds.includes(id));
  if (stale.length) {
    await User.updateMany(
      { _id: { $in: stale }, role: { $ne: 'legal' } },
      { $pull: { unitIds: legalId } },
    );
    // Also remove inactive legal-role users from membership display
    await User.updateMany(
      { _id: { $in: stale }, active: false },
      { $pull: { unitIds: legalId } },
    );
  }

  unit.memberIds = legalMemberIds;
  // Preserve non-role members who were explicitly added? Plan says legal role users auto-join.
  // Merge any admin-assigned extras that still have unitIds including legal:
  const extras = await User.find({
    unitIds: legalId,
    _id: { $nin: legalMemberIds },
    active: { $ne: false },
  }).select('_id').lean();
  const merged = [...new Set([...legalMemberIds, ...extras.map((u) => String(u._id))])];
  unit.memberIds = merged;
  unit.updatedAt = now;
  await unit.save();
  return serializeUnit(unit.toObject ? unit.toObject() : unit);
}

/** After user save: force legal membership when role is legal; sync dual-write. */
export async function applyUserUnitMembership(user) {
  let unitIds = normalizeUnitIds(user.unitIds);
  if (user.role === 'legal' && user.active !== false) {
    let legal = await getUnitByCode('legal');
    if (!legal) legal = await ensureLegalUnit();
    if (!unitIds.includes(legal.id)) unitIds.push(legal.id);
  }
  if (user.active === false) unitIds = [];
  user.unitIds = unitIds;
  await User.updateOne({ _id: user._id }, { $set: { unitIds } });
  await syncUserUnits(user._id, unitIds);
  return unitIds;
}

export async function createUnit(body) {
  const name = String(body?.name || '').trim();
  const code = String(body?.code || '').trim().toLowerCase();
  const note = String(body?.note || '').trim();
  const active = body?.active !== false && body?.active !== 'false';
  const memberIds = await assertUserIdsExist(body?.memberIds);
  const headId = body?.headId ? String(body.headId) : '';
  if (name.length < 2 || name.length > 80) throw new AppError('نام واحد را وارد کنید');
  if (!CODE_RE.test(code)) throw new AppError('کد واحد فقط حروف انگلیسی کوچک، عدد، خط تیره و زیرخط (۲ تا ۳۲ نویسه)');
  if (headId) {
    await assertUserIdsExist([headId]);
    if (!memberIds.includes(headId)) memberIds.push(headId);
  }
  const now = new Date();
  try {
    const unit = await OrgUnit.create({
      _id: uid(),
      name,
      code,
      note: note.slice(0, 1000),
      active,
      memberIds,
      headId,
      createdAt: now,
      updatedAt: now,
    });
    await syncMembership(unit._id, memberIds);
    return serializeUnit(unit.toObject());
  } catch (err) {
    if (err?.code === 11000) throw new AppError('کد واحد تکراری است', 409);
    throw err;
  }
}

export async function updateUnit(id, body) {
  const unit = await OrgUnit.findById(id);
  if (!unit) throw new AppError('واحد سازمانی پیدا نشد', 404);
  if (body?.name != null) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 80) throw new AppError('نام واحد را وارد کنید');
    unit.name = name;
  }
  if (body?.code != null && String(body.code).trim().toLowerCase() !== unit.code) {
    if (unit.code === 'legal') throw new AppError('کد واحد حقوقی قابل تغییر نیست');
    const code = String(body.code).trim().toLowerCase();
    if (!CODE_RE.test(code)) throw new AppError('کد واحد فقط حروف انگلیسی کوچک، عدد، خط تیره و زیرخط (۲ تا ۳۲ نویسه)');
    unit.code = code;
  }
  if (body?.note != null) unit.note = String(body.note).trim().slice(0, 1000);
  if (typeof body?.active === 'boolean') {
    if (unit.code === 'legal' && !body.active) throw new AppError('واحد حقوقی را نمی‌توان غیرفعال کرد');
    unit.active = body.active;
  }
  if (Array.isArray(body?.memberIds)) {
    unit.memberIds = await assertUserIdsExist(body.memberIds);
  }
  if (body?.headId !== undefined) {
    unit.headId = body.headId ? String(body.headId) : '';
    if (unit.headId) {
      await assertUserIdsExist([unit.headId]);
      if (!unit.memberIds.includes(unit.headId)) unit.memberIds.push(unit.headId);
    }
  }
  unit.updatedAt = new Date();
  try {
    await unit.save();
  } catch (err) {
    if (err?.code === 11000) throw new AppError('کد واحد تکراری است', 409);
    throw err;
  }
  await syncMembership(unit._id, unit.memberIds);
  // Keep names on open workcases in sync when unit renamed
  if (body?.name != null) {
    await LegalCase.updateMany(
      { currentUnitId: String(unit._id) },
      { $set: { currentUnitName: unit.name, updatedAt: new Date() } },
    );
  }
  return serializeUnit(unit.toObject());
}

export async function deleteUnit(id) {
  const unit = await OrgUnit.findById(id);
  if (!unit) throw new AppError('واحد سازمانی پیدا نشد', 404);
  if (unit.code === 'legal') throw new AppError('واحد حقوقی قابل حذف نیست');
  const open = await LegalCase.countDocuments({
    currentUnitId: String(unit._id),
    status: { $ne: 'done' },
  });
  if (open > 0) {
    throw new AppError(`این واحد ${open} ارجاع باز دارد؛ اول منتقل یا مختومه کنید`);
  }
  // Remap done cases label so history stays readable
  await LegalCase.updateMany(
    { currentUnitId: String(unit._id) },
    { $set: { currentUnitName: `${unit.name} (حذف‌شده)`, updatedAt: new Date() } },
  );
  await syncMembership(unit._id, []);
  await unit.deleteOne();
  return { ok: true };
}

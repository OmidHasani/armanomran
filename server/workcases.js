import { Check, Contract, Customer, Ledger, LegalCase, Meta, Project, Reservation, User } from './models.js';
import { hasPerm, normalizeUnitIds } from './perms.js';
import { ensureLegalUnit, getUnitByCode, getUnitById, listUnits } from './units.js';
import { AppError } from './validate.js';
import { nowTime, todayJ, uid } from './dates.js';

export const FOLLOW_ACTIONS = [
  { k: 'call', l: 'تماس تلفنی' },
  { k: 'sms', l: 'پیامک / پیام‌رسان' },
  { k: 'letter', l: 'اظهارنامه / نامه' },
  { k: 'visit', l: 'مراجعه حضوری' },
  { k: 'meeting', l: 'جلسه توافق' },
  { k: 'court', l: 'اقدام قضایی' },
  { k: 'other', l: 'سایر' },
];

export const FOLLOW_SUBJECTS = [
  { k: 'payment', l: 'وصول مبلغ' },
  { k: 'promise', l: 'وعده پرداخت' },
  { k: 'docs', l: 'مدارک و احراز' },
  { k: 'notice', l: 'اخطار حقوقی' },
  { k: 'settlement', l: 'تسویه / توافق' },
  { k: 'unit', l: 'وضعیت واحد / پروژه' },
  { k: 'other', l: 'سایر موارد' },
];

export const FOLLOW_RESULTS = [
  { k: 'no_answer', l: 'عدم پاسخ' },
  { k: 'promised', l: 'وعده پرداخت' },
  { k: 'partial', l: 'پرداخت جزئی' },
  { k: 'paid', l: 'تسویه شد' },
  { k: 'escalated', l: 'ارجاع بالاتر' },
  { k: 'refused', l: 'امتناع' },
  { k: 'other', l: 'سایر' },
];

export const CASE_STATUS = [
  { k: 'new', l: 'ارجاع‌شده' },
  { k: 'working', l: 'در حال پیگیری' },
  { k: 'waiting', l: 'در انتظار' },
  { k: 'done', l: 'مختومه' },
];

export const CASE_KINDS = [
  { k: 'installment', l: 'قسط معوق' },
  { k: 'reservation', l: 'رزرو' },
  { k: 'contract', l: 'قرارداد' },
  { k: 'payment', l: 'پرداخت' },
  { k: 'report', l: 'گزارش' },
  { k: 'text', l: 'متن آزاد' },
  { k: 'manual', l: 'دستی' },
];

function actorName(user) {
  return user?.name || user?.username || 'سامانه';
}

function actorId(user) {
  return user?._id ? String(user._id) : '';
}

export function customerSnap(customer = {}) {
  return {
    id: customer._id || customer.id || '',
    name: customer.name || '—',
    nid: customer.nid || '',
    phone: customer.phone || '',
    addr: customer.addr || '',
    father: customer.father || '',
  };
}

export function projectSnap(project = {}) {
  return { id: project._id || project.id || '', name: project.name || '—', addr: project.addr || '' };
}

export function unitSnap(unit = {}) {
  return {
    id: unit.id || '',
    no: unit.no || '—',
    floor: unit.floor || '',
    kind: unit.kind || '',
    area: unit.area || 0,
    total: unit.total || 0,
  };
}

export function makeTimelineEvent(type, user, extra = {}) {
  return {
    id: uid(),
    type,
    d: todayJ(),
    h: nowTime(),
    by: actorName(user),
    byId: actorId(user),
    actions: [],
    subjects: [],
    result: '',
    note: '',
    next: '',
    fromUnitId: '',
    fromUnitName: '',
    toUnitId: '',
    toUnitName: '',
    fromUserId: '',
    toUserId: '',
    toUserName: '',
    status: '',
    createdAt: new Date(),
    ...extra,
  };
}

function followsFromTimeline(timeline = []) {
  return timeline
    .filter((e) => e.type === 'follow')
    .map((e) => ({
      id: e.id,
      d: e.d,
      h: e.h,
      by: e.by,
      byId: e.byId,
      actions: e.actions || [],
      subjects: e.subjects || [],
      result: e.result || '',
      note: e.note || '',
      next: e.next || '',
      createdAt: e.createdAt,
    }));
}

export function serializeCase(doc) {
  const {
    _id, createdAt, updatedAt, closedAt, referredAt, follows = [], timeline = [], ...rest
  } = doc;
  const tl = Array.isArray(timeline) && timeline.length
    ? [...timeline].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    : [];
  const legacyFollows = Array.isArray(follows) && follows.length ? follows : followsFromTimeline(tl);
  return {
    id: String(_id),
    ...rest,
    follows: [...legacyFollows].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))),
    timeline: tl,
    referredAt: referredAt || null,
    createdAt: createdAt || null,
    updatedAt: updatedAt || null,
    closedAt: closedAt || null,
  };
}

let cachedLegalUnitId = '';

export async function legalUnitId() {
  if (cachedLegalUnitId) return cachedLegalUnitId;
  const unit = await ensureLegalUnit();
  cachedLegalUnitId = unit.id;
  return cachedLegalUnitId;
}

export function canAccessCase(user, item, legalId = '') {
  if (!user || !item) return false;
  if (user.role === 'admin' || hasPerm(user, 'admin')) return true;
  const uidStr = String(user._id);
  if (item.assignedTo && String(item.assignedTo) === uidStr) return true;
  if (item.referredById && String(item.referredById) === uidStr) return true;
  const units = new Set(normalizeUnitIds(user.unitIds));
  if (item.currentUnitId && units.has(String(item.currentUnitId))) return true;
  if (hasPerm(user, 'legal') && legalId && String(item.currentUnitId) === String(legalId)) return true;
  if (hasPerm(user, 'inbox') && item.currentUnitId && units.has(String(item.currentUnitId))) return true;
  return false;
}

export function canAccessCaseDoc(user, doc) {
  return canAccessCase(user, doc);
}

async function accessFilter(user) {
  if (user.role === 'admin' || hasPerm(user, 'admin')) return {};
  const uidStr = String(user._id);
  const units = normalizeUnitIds(user.unitIds);
  const or = [
    { assignedTo: uidStr },
    { referredById: uidStr },
  ];
  if (units.length) or.push({ currentUnitId: { $in: units } });
  if (hasPerm(user, 'legal')) {
    const lid = await legalUnitId();
    or.push({ currentUnitId: lid });
  }
  if (!or.length) return { _id: '__none__' };
  return { $or: or };
}

export async function migrateWorkCases() {
  const legal = await ensureLegalUnit();
  const rows = await LegalCase.find({
    $or: [
      { currentUnitId: { $in: [null, ''] } },
      { currentUnitId: { $exists: false } },
      { timeline: { $exists: false } },
      { timeline: { $size: 0 } },
      { kind: 'manual' },
    ],
  });
  let n = 0;
  for (const item of rows) {
    let changed = false;
    if (!item.currentUnitId) {
      item.currentUnitId = legal.id;
      item.currentUnitName = legal.name;
      changed = true;
    }
    if (!Array.isArray(item.timeline) || !item.timeline.length) {
      const tl = [];
      tl.push(makeTimelineEvent('create', { name: item.referredBy || 'سامانه', _id: item.referredById || '' }, {
        note: 'ایجاد پرونده',
        toUnitId: item.currentUnitId || legal.id,
        toUnitName: item.currentUnitName || legal.name,
        createdAt: item.referredAt || item.createdAt || new Date(),
        d: todayJ(),
      }));
      for (const f of item.follows || []) {
        tl.push({
          id: f.id || uid(),
          type: 'follow',
          d: f.d || todayJ(),
          h: f.h || nowTime(),
          by: f.by || '',
          byId: f.byId || '',
          actions: f.actions || [],
          subjects: f.subjects || [],
          result: f.result || '',
          note: f.note || '',
          next: f.next || '',
          fromUnitId: '',
          fromUnitName: '',
          toUnitId: '',
          toUnitName: '',
          fromUserId: '',
          toUserId: '',
          toUserName: '',
          status: '',
          createdAt: f.createdAt || new Date(),
        });
      }
      item.timeline = tl;
      changed = true;
    }
    if (item.kind === 'manual') {
      item.kind = 'text';
      changed = true;
    }
    if (!item.title) {
      if (item.kind === 'installment') item.title = `قسط معوق ${item.contract?.no || ''}`.trim();
      else if (item.kind === 'reservation') item.title = `رزرو ${item.reservation?.no || ''}`.trim();
      else item.title = item.title || 'ارجاع';
      changed = true;
    }
    if (changed) {
      item.updatedAt = new Date();
      await item.save();
      n += 1;
    }
  }
  return { migrated: n, legalUnitId: legal.id };
}

async function resolveUnit(unitId, unitCode) {
  if (unitId) return getUnitById(unitId);
  if (unitCode) {
    const u = await getUnitByCode(unitCode);
    if (!u) throw new AppError('واحد سازمانی پیدا نشد', 404);
    if (!u.active) throw new AppError('این واحد غیرفعال است');
    return u;
  }
  return ensureLegalUnit();
}

async function resolveAssignee(unit, assignedTo) {
  if (!assignedTo) return { assignedTo: '', assignedName: '' };
  const id = String(assignedTo);
  if (!unit.memberIds.includes(id) && unit.code !== 'legal') {
    // still allow if user is member - check DB
  }
  const user = await User.findById(id).lean();
  if (!user || user.active === false) throw new AppError('کاربر مقصد پیدا نشد', 404);
  if (!normalizeUnitIds(user.unitIds).includes(unit.id) && !unit.memberIds.includes(id)) {
    throw new AppError('این کاربر عضو واحد مقصد نیست');
  }
  return { assignedTo: id, assignedName: user.name || user.username };
}

function paidSum(contract) {
  return (contract.inst || []).filter((i) => i.paid).reduce((s, i) => s + (i.amt || 0), 0);
}

export async function listWorkCases(user, query = {}) {
  const filter = { ...(await accessFilter(user)) };
  if (query.status && CASE_STATUS.some((s) => s.k === query.status)) filter.status = query.status;
  if (query.unitId) {
    if (user.role !== 'admin' && !hasPerm(user, 'admin')) {
      const units = new Set(normalizeUnitIds(user.unitIds));
      const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
      if (!units.has(String(query.unitId)) && String(query.unitId) !== String(lid)) {
        throw new AppError('به این واحد دسترسی ندارید', 403);
      }
    }
    filter.currentUnitId = String(query.unitId);
  }
  if (query.unitCode) {
    const unit = await getUnitByCode(query.unitCode);
    if (unit) filter.currentUnitId = unit.id;
  }
  if (query.mine === '1' || query.mine === 'true') {
    filter.assignedTo = String(user._id);
  }
  const cases = await LegalCase.find(filter).sort({ priority: -1, overdueDays: -1, referredAt: -1 }).lean();
  return cases.map(serializeCase);
}

export async function getWorkCase(id, user) {
  const item = await LegalCase.findById(id).lean();
  if (!item) throw new AppError('ارجاع پیدا نشد', 404);
  const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
  if (!canAccessCase(user, item, lid)) throw new AppError('به این ارجاع دسترسی ندارید', 403);
  return serializeCase(item);
}

export async function workStats(user, query = {}) {
  const filter = { ...(await accessFilter(user)) };
  if (query.unitId) filter.currentUnitId = String(query.unitId);
  if (query.unitCode) {
    const unit = await getUnitByCode(query.unitCode);
    if (unit) filter.currentUnitId = unit.id;
  }
  const rows = await LegalCase.aggregate([
    { $match: filter },
    { $group: { _id: '$status', n: { $sum: 1 }, amt: { $sum: '$chart.overdueAmt' } } },
  ]);
  const by = Object.fromEntries(CASE_STATUS.map((s) => [s.k, { count: 0, amount: 0 }]));
  for (const row of rows) {
    if (by[row._id]) by[row._id] = { count: row.n, amount: row.amt || 0 };
  }
  return by;
}

export async function createWorkCase(body, user) {
  const kindRaw = String(body?.kind || 'text');
  const kind = kindRaw === 'manual' ? 'text' : kindRaw;
  if (!['installment', 'reservation', 'contract', 'payment', 'report', 'text'].includes(kind)) {
    throw new AppError('نوع ارجاع نامعتبر است');
  }
  const unit = await resolveUnit(body?.unitId, body?.unitCode);
  if (!unit.active) throw new AppError('این واحد غیرفعال است');
  const assignee = await resolveAssignee(unit, body?.assignedTo);
  const title = String(body?.title || '').trim().slice(0, 200);
  const bodyText = String(body?.body || body?.note || '').trim().slice(0, 8000);
  const priority = body?.priority === 'high' ? 'high' : 'normal';
  const now = new Date();
  const id = uid();

  let sourceKey = '';
  const clientKey = String(body?.sourceKey || '').trim();
  let customer = body?.customer || undefined;
  let project = body?.project || undefined;
  let propertyUnit = body?.unit || undefined;
  let contract = body?.contract || undefined;
  let installment = body?.installment || undefined;
  let reservation = body?.reservation || undefined;
  let payment = body?.payment || undefined;
  let chart = body?.chart || undefined;
  let overdueDays = Number(body?.overdueDays) || 0;
  let thresholdDays = Number(body?.thresholdDays) || 0;
  let finalTitle = title;
  let finalKind = kind === 'manual' ? 'text' : kind;

  async function returnExisting(exists) {
    const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
    if (!canAccessCase(user, exists, lid) && user.role !== 'admin' && !hasPerm(user, 'admin')) {
      throw new AppError('این مورد قبلاً ارجاع شده است', 409);
    }
    return serializeCase(exists);
  }

  if (kind === 'installment' || (body?.contractId && body?.instId)) {
    const contractId = String(body.contractId || body?.contract?.id || '');
    const instId = String(body.instId || body?.installment?.id || '');
    if (!contractId || !instId) throw new AppError('قسط برای ارجاع مشخص نیست');
    const c = await Contract.findById(contractId).lean();
    if (!c) throw new AppError('قرارداد پیدا نشد', 404);
    const inst = (c.inst || []).find((i) => i.id === instId);
    if (!inst) throw new AppError('قسط پیدا نشد', 404);
    if (inst.paid) throw new AppError('این قسط پرداخت شده و قابل ارجاع نیست');
    sourceKey = `inst:${c._id}:${inst.id}`;
    const exists = await LegalCase.findOne({ sourceKey }).lean();
    if (exists) return returnExisting(exists);
    const cust = await Customer.findById(c.cust).lean();
    const proj = await Project.findById(c.proj).lean();
    const u = (proj?.units || []).find((x) => x.id === c.unit) || {};
    const paid = paidSum(c);
    customer = customerSnap(cust);
    project = projectSnap(proj);
    propertyUnit = unitSnap(u);
    contract = {
      id: String(c._id), no: c.no, type: c.type, date: c.date, total: c.total, paid,
      remaining: Math.max(0, c.total - paid),
    };
    installment = {
      id: inst.id, title: inst.title || '', amt: inst.amt || 0, date: inst.date, ref: inst.ref || '', paid: false,
    };
    chart = {
      due: inst.amt || 0, paid, remaining: Math.max(0, c.total - paid), contractTotal: c.total, overdueAmt: inst.amt || 0,
    };
    finalKind = 'installment';
    finalTitle = finalTitle || `قسط معوق ${c.no} – ${inst.title || ''}`.trim();
  } else if (kind === 'reservation' || body?.reservationId) {
    const reservationId = String(body.reservationId || body?.reservation?.id || '');
    if (!reservationId) throw new AppError('رزرو برای ارجاع مشخص نیست');
    const r = await Reservation.findById(reservationId).lean();
    if (!r) throw new AppError('رزرو پیدا نشد', 404);
    sourceKey = `res:${r._id}`;
    const exists = await LegalCase.findOne({ sourceKey }).lean();
    if (exists) return returnExisting(exists);
    const cust = await Customer.findById(r.cust).lean();
    const proj = await Project.findById(r.proj).lean();
    const u = (proj?.units || []).find((x) => x.id === r.unit) || {};
    const paid = (r.pays || []).reduce((s, p) => s + (p.amt || 0), 0);
    const rem = Math.max(0, (r.need || 0) - paid);
    customer = customerSnap(cust);
    project = projectSnap(proj);
    propertyUnit = unitSnap(u);
    reservation = {
      id: String(r._id), no: r.no, need: r.need || 0, paid, deadline: r.deadline, st: r.st,
    };
    chart = { due: rem, paid, remaining: rem, contractTotal: r.need || 0, overdueAmt: rem };
    finalKind = 'reservation';
    finalTitle = finalTitle || `رزرو ${r.no}`;
  } else if (kind === 'contract' || body?.contractId) {
    const contractId = String(body.contractId || body?.contract?.id || '');
    if (!contractId) throw new AppError('قرارداد برای ارجاع مشخص نیست');
    const c = await Contract.findById(contractId).lean();
    if (!c) throw new AppError('قرارداد پیدا نشد', 404);
    sourceKey = `contract:${c._id}`;
    const openContract = await LegalCase.findOne({ sourceKey, status: { $ne: 'done' } }).lean();
    if (openContract) return returnExisting(openContract);
    const closedContract = await LegalCase.findOne({ sourceKey }).lean();
    if (closedContract) sourceKey = `contract:${c._id}:${id}`;
    const cust = await Customer.findById(c.cust).lean();
    const proj = await Project.findById(c.proj).lean();
    const u = (proj?.units || []).find((x) => x.id === c.unit) || {};
    const paid = paidSum(c);
    customer = customerSnap(cust);
    project = projectSnap(proj);
    propertyUnit = unitSnap(u);
    contract = {
      id: String(c._id), no: c.no, type: c.type, date: c.date, total: c.total, paid,
      remaining: Math.max(0, c.total - paid),
    };
    chart = {
      due: Math.max(0, c.total - paid), paid, remaining: Math.max(0, c.total - paid),
      contractTotal: c.total, overdueAmt: Math.max(0, c.total - paid),
    };
    finalKind = 'contract';
    finalTitle = finalTitle || `قرارداد ${c.no}`;
  } else if (kind === 'payment' || body?.ledgerId || body?.checkId) {
    const ledgerId = String(body.ledgerId || '');
    const checkId = String(body.checkId || '');
    if (ledgerId) {
      const led = await Ledger.findById(ledgerId).lean();
      if (!led) throw new AppError('سند حسابداری پیدا نشد', 404);
      sourceKey = `ledger:${led._id}`;
      const exists = await LegalCase.findOne({ sourceKey, status: { $ne: 'done' } }).lean();
      if (exists) return returnExisting(exists);
      const any = await LegalCase.findOne({ sourceKey }).lean();
      if (any) sourceKey = `ledger:${led._id}:${id}`;
      payment = {
        id: String(led._id), amt: led.amt || 0, date: led.date || '', ref: led.ref || '',
        acct: '', payer: '',
      };
      chart = { due: led.amt || 0, paid: 0, remaining: led.amt || 0, contractTotal: led.amt || 0, overdueAmt: led.amt || 0 };
      finalTitle = finalTitle || `سند حساب ${led.desc || led._id}`;
    } else if (checkId) {
      const ch = await Check.findById(checkId).lean();
      if (!ch) throw new AppError('چک پیدا نشد', 404);
      sourceKey = `check:${ch._id}`;
      const exists = await LegalCase.findOne({ sourceKey, status: { $ne: 'done' } }).lean();
      if (exists) return returnExisting(exists);
      const any = await LegalCase.findOne({ sourceKey }).lean();
      if (any) sourceKey = `check:${ch._id}:${id}`;
      payment = {
        id: String(ch._id), amt: ch.amt || 0, date: ch.dueDate || ch.regDate || '', ref: ch.sayad || ch.serial || '',
        acct: ch.bank || '', payer: ch.holder || '',
      };
      chart = { due: ch.amt || 0, paid: 0, remaining: ch.amt || 0, contractTotal: ch.amt || 0, overdueAmt: ch.amt || 0 };
      finalTitle = finalTitle || `چک ${ch.sayad || ch.serial || ch._id}`;
    } else {
      throw new AppError('پرداخت برای ارجاع مشخص نیست');
    }
    finalKind = 'payment';
  } else {
    finalKind = kind === 'report' ? 'report' : 'text';
    if (!finalTitle && !bodyText) throw new AppError('عنوان یا متن ارجاع را وارد کنید');
    finalTitle = finalTitle || (finalKind === 'report' ? 'ارجاع گزارش' : 'ارجاع متنی');
    // Client key only allowed for free-text idempotency; otherwise unique per case
    sourceKey = (clientKey && /^text:/.test(clientKey)) ? clientKey : `text:${id}`;
  }

  if (!sourceKey) sourceKey = `${finalKind}:${id}`;
  const exists = await LegalCase.findOne({ sourceKey }).lean();
  if (exists) return returnExisting(exists);

  if (!thresholdDays) {
    const meta = await Meta.findById('crm').lean();
    thresholdDays = Math.max(1, Number(meta?.legalDays) || 7);
  }

  const createEv = makeTimelineEvent('create', user, {
    note: bodyText || 'ایجاد ارجاع',
    toUnitId: unit.id,
    toUnitName: unit.name,
    toUserId: assignee.assignedTo,
    toUserName: assignee.assignedName,
  });

  let doc;
  try {
    doc = await LegalCase.create({
      _id: id,
      sourceKey,
      kind: finalKind,
      title: finalTitle,
      body: bodyText,
      status: 'new',
      priority,
      referredAt: now,
      referredBy: actorName(user),
      referredById: actorId(user),
      currentUnitId: unit.id,
      currentUnitName: unit.name,
      thresholdDays,
      overdueDays,
      customer,
      project,
      unit: propertyUnit,
      contract,
      installment,
      reservation,
      payment,
      ledgerId: body?.ledgerId ? String(body.ledgerId) : '',
      checkId: body?.checkId ? String(body.checkId) : '',
      chart,
      assignedTo: assignee.assignedTo,
      assignedName: assignee.assignedName,
      follows: [],
      timeline: [createEv],
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    if (err?.code === 11000) {
      const again = await LegalCase.findOne({ sourceKey }).lean();
      if (again) return returnExisting(again);
    }
    throw err;
  }
  return serializeCase(doc.toObject());
}

export async function updateWorkStatus(id, status, user) {
  if (!CASE_STATUS.some((s) => s.k === status)) throw new AppError('وضعیت نامعتبر است');
  const item = await LegalCase.findById(id);
  if (!item) throw new AppError('ارجاع پیدا نشد', 404);
  const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
  if (!canAccessCase(user, item, lid)) throw new AppError('به این ارجاع دسترسی ندارید', 403);
  const prev = item.status;
  item.status = status;
  item.updatedAt = new Date();
  if (status === 'done') item.closedAt = new Date();
  if (status === 'working' && !item.assignedTo) {
    item.assignedTo = actorId(user);
    item.assignedName = actorName(user);
  }
  item.timeline = item.timeline || [];
  item.timeline.push(makeTimelineEvent('status', user, {
    note: `تغییر وضعیت از ${prev} به ${status}`,
    status,
  }));
  await item.save();
  return serializeCase(item.toObject());
}

export async function addWorkFollowUp(id, body, user) {
  const item = await LegalCase.findById(id);
  if (!item) throw new AppError('ارجاع پیدا نشد', 404);
  const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
  if (!canAccessCase(user, item, lid)) throw new AppError('به این ارجاع دسترسی ندارید', 403);
  const actions = Array.isArray(body?.actions) ? body.actions.filter((a) => FOLLOW_ACTIONS.some((x) => x.k === a)) : [];
  const subjects = Array.isArray(body?.subjects) ? body.subjects.filter((a) => FOLLOW_SUBJECTS.some((x) => x.k === a)) : [];
  const result = FOLLOW_RESULTS.some((x) => x.k === body?.result) ? body.result : 'other';
  const note = String(body?.note || '').trim();
  if (!actions.length && !subjects.length && !note) throw new AppError('حداقل یک اقدام، موضوع یا توضیح ثبت کنید');
  if (note.length > 4000) throw new AppError('توضیح پیگیری خیلی طولانی است');
  const next = String(body?.next || '').trim();
  const follow = makeTimelineEvent('follow', user, {
    actions, subjects, result, note, next,
  });
  item.timeline = item.timeline || [];
  item.timeline.push(follow);
  item.follows = item.follows || [];
  item.follows.push({
    id: follow.id,
    d: follow.d,
    h: follow.h,
    by: follow.by,
    byId: follow.byId,
    actions,
    subjects,
    result,
    note,
    next,
    createdAt: follow.createdAt,
  });
  if (result === 'paid') item.status = 'done';
  else if (result === 'promised' || next) item.status = 'waiting';
  else if (item.status === 'new') item.status = 'working';
  if (!item.assignedTo) {
    item.assignedTo = actorId(user);
    item.assignedName = actorName(user);
  }
  item.updatedAt = new Date();
  if (item.status === 'done') item.closedAt = new Date();
  await item.save();
  return serializeCase(item.toObject());
}

export async function transferWorkCase(id, body, user) {
  const item = await LegalCase.findById(id);
  if (!item) throw new AppError('ارجاع پیدا نشد', 404);
  const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
  if (!canAccessCase(user, item, lid)) throw new AppError('به این ارجاع دسترسی ندارید', 403);
  const unit = await resolveUnit(body?.unitId, body?.unitCode);
  if (!unit.active) throw new AppError('این واحد غیرفعال است');
  if (String(unit.id) === String(item.currentUnitId) && !body?.assignedTo) {
    throw new AppError('واحد مقصد با واحد فعلی یکی است');
  }
  const assignee = await resolveAssignee(unit, body?.assignedTo);
  const note = String(body?.note || body?.body || '').trim().slice(0, 4000);
  const fromUnitId = item.currentUnitId || '';
  const fromUnitName = item.currentUnitName || '';
  item.timeline = item.timeline || [];
  item.timeline.push(makeTimelineEvent('transfer', user, {
    note: note || `انتقال به ${unit.name}`,
    fromUnitId,
    fromUnitName,
    toUnitId: unit.id,
    toUnitName: unit.name,
    toUserId: assignee.assignedTo,
    toUserName: assignee.assignedName,
  }));
  item.currentUnitId = unit.id;
  item.currentUnitName = unit.name;
  if (assignee.assignedTo) {
    item.assignedTo = assignee.assignedTo;
    item.assignedName = assignee.assignedName;
  } else {
    item.assignedTo = '';
    item.assignedName = '';
  }
  if (item.status === 'done') item.status = 'working';
  else if (item.status === 'new') item.status = 'working';
  item.updatedAt = new Date();
  await item.save();
  return serializeCase(item.toObject());
}

export async function assignWorkCase(id, body, user) {
  const item = await LegalCase.findById(id);
  if (!item) throw new AppError('ارجاع پیدا نشد', 404);
  const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
  if (!canAccessCase(user, item, lid)) throw new AppError('به این ارجاع دسترسی ندارید', 403);
  const unit = item.currentUnitId
    ? await getUnitById(item.currentUnitId)
    : await ensureLegalUnit();
  const assignee = await resolveAssignee(unit, body?.assignedTo);
  if (!assignee.assignedTo) throw new AppError('مسئول را انتخاب کنید');
  item.timeline = item.timeline || [];
  item.timeline.push(makeTimelineEvent('assign', user, {
    note: String(body?.note || '').trim().slice(0, 2000) || `واگذاری به ${assignee.assignedName}`,
    toUserId: assignee.assignedTo,
    toUserName: assignee.assignedName,
    toUnitId: unit.id,
    toUnitName: unit.name,
  }));
  item.assignedTo = assignee.assignedTo;
  item.assignedName = assignee.assignedName;
  if (item.status === 'new') item.status = 'working';
  item.updatedAt = new Date();
  await item.save();
  return serializeCase(item.toObject());
}

export async function unitsForRefer() {
  return listUnits({ activeOnly: true });
}

export async function deleteWorkCase(id, user) {
  const item = await LegalCase.findById(id);
  if (!item) throw new AppError('ارجاع پیدا نشد', 404);
  const lid = hasPerm(user, 'legal') ? await legalUnitId() : '';
  const allowed = user.role === 'admin' || hasPerm(user, 'admin') || hasPerm(user, 'write')
    || canAccessCase(user, item, lid);
  if (!allowed) throw new AppError('اجازه حذف این ارجاع را ندارید', 403);
  await item.deleteOne();
  return { ok: true, id: String(id) };
}

/** Cascade purge when CRM entities are removed. */
export async function purgeWorkCases(refs = {}, user) {
  if (!(user.role === 'admin' || hasPerm(user, 'admin') || hasPerm(user, 'write'))) {
    throw new AppError('اجازه حذف ارجاع‌های وابسته را ندارید', 403);
  }
  const or = [];
  const cust = (refs.customerIds || []).map(String).filter(Boolean);
  const contracts = (refs.contractIds || []).map(String).filter(Boolean);
  const reservations = (refs.reservationIds || []).map(String).filter(Boolean);
  const projects = (refs.projectIds || []).map(String).filter(Boolean);
  const ids = (refs.ids || []).map(String).filter(Boolean);
  if (cust.length) or.push({ 'customer.id': { $in: cust } });
  if (contracts.length) or.push({ 'contract.id': { $in: contracts } });
  if (reservations.length) or.push({ 'reservation.id': { $in: reservations } });
  if (projects.length) or.push({ 'project.id': { $in: projects } });
  if (ids.length) or.push({ _id: { $in: ids } });
  if (!or.length) return { deleted: 0 };
  const res = await LegalCase.deleteMany({ $or: or });
  return { deleted: res.deletedCount || 0 };
}

import { Contract, Customer, LegalCase, Meta, Project, Reservation } from './models.js';
import { AppError } from './validate.js';
import { diffDays, uid } from './dates.js';
import { ensureLegalUnit } from './units.js';
import {
  addWorkFollowUp,
  CASE_STATUS,
  createWorkCase,
  customerSnap,
  FOLLOW_ACTIONS,
  FOLLOW_RESULTS,
  FOLLOW_SUBJECTS,
  getWorkCase,
  listWorkCases,
  makeTimelineEvent,
  projectSnap,
  serializeCase,
  unitSnap,
  updateWorkStatus,
  workStats,
} from './workcases.js';

export {
  CASE_STATUS,
  FOLLOW_ACTIONS,
  FOLLOW_RESULTS,
  FOLLOW_SUBJECTS,
};

async function settings() {
  const meta = await Meta.findById('crm').lean();
  return {
    legalDays: Math.max(1, Number(meta?.legalDays) || 7),
    autoLegal: meta?.autoLegal !== false,
    fine: meta?.fine ?? 30000000,
    days: meta?.days ?? 20,
  };
}

function paidSum(contract) {
  return (contract.inst || []).filter((i) => i.paid).reduce((s, i) => s + (i.amt || 0), 0);
}

export async function getAdminSettings() {
  return settings();
}

export async function saveAdminSettings(body) {
  const legalDays = Math.max(1, Math.min(3650, parseInt(String(body?.legalDays ?? 7), 10) || 7));
  const autoLegal = body?.autoLegal !== false && body?.autoLegal !== 'false' && body?.autoLegal !== 0;
  const fine = Math.max(0, Number(body?.fine) || 30000000);
  const days = Math.max(1, Math.min(3650, parseInt(String(body?.days ?? 20), 10) || 20));
  const now = new Date();
  await Meta.updateOne(
    { _id: 'crm' },
    {
      $set: { legalDays, autoLegal, fine, days, updatedAt: now },
      $setOnInsert: { createdAt: now, version: 0 },
    },
    { upsert: true },
  );
  return { legalDays, autoLegal, fine, days };
}

export async function syncLegalReferrals(by = 'سامانه') {
  const cfg = await settings();
  if (!cfg.autoLegal) return { created: 0, legalDays: cfg.legalDays };
  const legalUnit = await ensureLegalUnit();
  const [contracts, customers, projects, reservations] = await Promise.all([
    Contract.find().lean(),
    Customer.find().lean(),
    Project.find().lean(),
    Reservation.find().lean(),
  ]);
  const custMap = new Map(customers.map((c) => [String(c._id), c]));
  const projMap = new Map(projects.map((p) => [String(p._id), p]));
  const existing = new Set((await LegalCase.find({}, { sourceKey: 1 }).lean()).map((c) => c.sourceKey));
  const docs = [];
  const now = new Date();
  const systemUser = { name: by, _id: '' };

  for (const contract of contracts) {
    const customer = custMap.get(String(contract.cust));
    const project = projMap.get(String(contract.proj));
    const unit = (project?.units || []).find((u) => u.id === contract.unit) || {};
    const paid = paidSum(contract);
    for (const inst of contract.inst || []) {
      if (inst.paid) continue;
      const d = diffDays(inst.date);
      if (d > -cfg.legalDays) continue;
      const sourceKey = `inst:${contract._id}:${inst.id}`;
      if (existing.has(sourceKey)) continue;
      const title = `قسط معوق ${contract.no} – ${inst.title || ''}`.trim();
      docs.push({
        _id: uid(),
        sourceKey,
        kind: 'installment',
        title,
        body: '',
        status: 'new',
        priority: -d >= cfg.legalDays * 2 ? 'high' : 'normal',
        referredAt: now,
        referredBy: by,
        referredById: '',
        currentUnitId: legalUnit.id,
        currentUnitName: legalUnit.name,
        thresholdDays: cfg.legalDays,
        overdueDays: -d,
        customer: customerSnap(customer),
        project: projectSnap(project),
        unit: unitSnap(unit),
        contract: {
          id: String(contract._id),
          no: contract.no,
          type: contract.type,
          date: contract.date,
          total: contract.total,
          paid,
          remaining: Math.max(0, contract.total - paid),
        },
        installment: {
          id: inst.id,
          title: inst.title || '',
          amt: inst.amt || 0,
          date: inst.date,
          ref: inst.ref || '',
          paid: false,
        },
        chart: {
          due: inst.amt || 0,
          paid,
          remaining: Math.max(0, contract.total - paid),
          contractTotal: contract.total,
          overdueAmt: inst.amt || 0,
        },
        follows: [],
        timeline: [makeTimelineEvent('create', systemUser, {
          note: 'ارجاع خودکار معوقه',
          toUnitId: legalUnit.id,
          toUnitName: legalUnit.name,
          createdAt: now,
        })],
        createdAt: now,
        updatedAt: now,
      });
      existing.add(sourceKey);
    }
  }

  for (const reservation of reservations) {
    if (reservation.st !== 'active') continue;
    const rem = Math.max(0, (reservation.need || 0) - (reservation.pays || []).reduce((s, p) => s + (p.amt || 0), 0));
    if (rem <= 0) continue;
    const d = diffDays(reservation.deadline);
    if (d > -cfg.legalDays) continue;
    const sourceKey = `res:${reservation._id}`;
    if (existing.has(sourceKey)) continue;
    const customer = custMap.get(String(reservation.cust));
    const project = projMap.get(String(reservation.proj));
    const unit = (project?.units || []).find((u) => u.id === reservation.unit) || {};
    const paid = (reservation.pays || []).reduce((s, p) => s + (p.amt || 0), 0);
    docs.push({
      _id: uid(),
      sourceKey,
      kind: 'reservation',
      title: `رزرو معوق ${reservation.no}`,
      body: '',
      status: 'new',
      priority: -d >= cfg.legalDays * 2 ? 'high' : 'normal',
      referredAt: now,
      referredBy: by,
      referredById: '',
      currentUnitId: legalUnit.id,
      currentUnitName: legalUnit.name,
      thresholdDays: cfg.legalDays,
      overdueDays: -d,
      customer: customerSnap(customer),
      project: projectSnap(project),
      unit: unitSnap(unit),
      reservation: {
        id: String(reservation._id),
        no: reservation.no,
        need: reservation.need || 0,
        paid,
        deadline: reservation.deadline,
        st: reservation.st,
      },
      chart: {
        due: rem,
        paid,
        remaining: rem,
        contractTotal: reservation.need || 0,
        overdueAmt: rem,
      },
      follows: [],
      timeline: [makeTimelineEvent('create', systemUser, {
        note: 'ارجاع خودکار رزرو معوق',
        toUnitId: legalUnit.id,
        toUnitName: legalUnit.name,
        createdAt: now,
      })],
      createdAt: now,
      updatedAt: now,
    });
    existing.add(sourceKey);
  }

  if (docs.length) {
    try {
      await LegalCase.insertMany(docs, { ordered: false });
    } catch (err) {
      if (err?.code !== 11000) throw err;
    }
  }
  return { created: docs.length, legalDays: cfg.legalDays };
}

export async function listLegalCases(query = {}, user = null) {
  await syncLegalReferrals('سامانه');
  if (user) {
    return listWorkCases(user, { ...query, unitCode: 'legal' });
  }
  const legalUnit = await ensureLegalUnit();
  const filter = { currentUnitId: legalUnit.id };
  if (query.status && CASE_STATUS.some((s) => s.k === query.status)) filter.status = query.status;
  const cases = await LegalCase.find(filter).sort({ priority: -1, overdueDays: -1, referredAt: -1 }).lean();
  return cases.map(serializeCase);
}

export async function getLegalCase(id, user = null) {
  if (user) return getWorkCase(id, user);
  const item = await LegalCase.findById(id).lean();
  if (!item) throw new AppError('پرونده حقوقی پیدا نشد', 404);
  return serializeCase(item);
}

export async function referManual(body, user) {
  return createWorkCase({
    kind: 'installment',
    contractId: body?.contractId,
    instId: body?.instId,
    unitCode: 'legal',
    priority: 'high',
    title: body?.title,
    body: body?.body || body?.note,
  }, user);
}

export async function updateLegalStatus(id, status, user) {
  return updateWorkStatus(id, status, user);
}

export async function addFollowUp(id, body, user) {
  return addWorkFollowUp(id, body, user);
}

export async function legalStats(user = null) {
  await syncLegalReferrals('سامانه');
  if (user) return workStats(user, { unitCode: 'legal' });
  const legalUnit = await ensureLegalUnit();
  return workStats({ role: 'admin', _id: 'system', unitIds: [] }, { unitId: legalUnit.id });
}

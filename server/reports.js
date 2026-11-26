import { randomBytes } from 'node:crypto';
import { Activity } from './activity.js';
import { OrgUnit, Report } from './models.js';
import { hasPerm, normalizeUnitIds } from './perms.js';
import { AppError } from './validate.js';

const TITLE_MAX = 180;
const BODY_MAX = 20000;

export function readReportInput(body) {
  const title = String(body?.title ?? '').replace(/[ \t\f\v]+/g, ' ').trim();
  const text = String(body?.body ?? '').replace(/\r\n/g, '\n').trim();
  if (title.length < 2 || title.length > TITLE_MAX) {
    throw new AppError('عنوان گزارش را بین ۲ تا ۱۸۰ نویسه وارد کنید');
  }
  if (!text.length || text.length > BODY_MAX) {
    throw new AppError('متن گزارش را وارد کنید (حداکثر ۲۰ هزار نویسه)');
  }
  return { title, body: text };
}

export function sameAuthor(user, report) {
  return !!user && !!report && String(user._id) === String(report.authorId);
}

export function revisionOf(previous, next, at) {
  return {
    at,
    previousTitle: previous.title,
    previousBody: previous.body,
    nextTitle: next.title,
    nextBody: next.body,
  };
}

function changed(previous, next) {
  return previous.title !== next.title || previous.body !== next.body;
}

function view(report, user, withBody = true) {
  const body = report.body || '';
  return {
    id: String(report._id),
    title: report.title,
    ...(withBody ? { body } : {}),
    excerpt: body.length > 180 ? body.slice(0, 180) + '…' : body,
    authorId: report.authorId,
    authorName: report.authorName || '',
    authorUser: report.authorUser || '',
    unitNames: report.unitNames || [],
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    mine: sameAuthor(user, report),
  };
}

function like(value) {
  const raw = String(value || '').trim().slice(0, 80);
  if (!raw) return null;
  return new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

export async function logReportEvent(user, report, action, snapshot) {
  const at = snapshot.at instanceof Date ? snapshot.at : new Date();
  await Activity.create({
    kind: 'report',
    actor: user.name,
    user: user.username,
    action,
    target: String(report.title || '').slice(0, 220),
    details: [action, report.unitNames?.length ? 'واحد ' + report.unitNames.join('، ') : ''].filter(Boolean).join(' · ').slice(0, 1000),
    snapshot: {
      reportId: String(report._id),
      authorName: report.authorName || '',
      authorUser: report.authorUser || '',
      unitNames: report.unitNames || [],
      title: snapshot.title ?? report.title,
      body: snapshot.body ?? report.body,
      previousTitle: snapshot.previousTitle ?? '',
      previousBody: snapshot.previousBody ?? '',
      file: snapshot.file || '',
      at,
    },
    at,
  });
}

export async function noteReportFile(user, parent, action, filename) {
  const report = await Report.findById(parent).lean();
  if (!report || !sameAuthor(user, report)) return;
  await logReportEvent(user, report, action, {
    title: report.title,
    body: report.body,
    previousTitle: report.title,
    previousBody: report.body,
    file: String(filename || '').slice(0, 180),
    at: new Date(),
  });
}

async function unitsOf(user) {
  const ids = normalizeUnitIds(user.unitIds);
  if (!ids.length) return [];
  const rows = await OrgUnit.find({ _id: { $in: ids } }).select('name').lean();
  const names = new Map(rows.map((unit) => [String(unit._id), unit.name]));
  return ids.map((id) => names.get(id)).filter(Boolean);
}

export function mountReports(api, auth, wrap) {
  const guard = wrap(async (req, res, next) => {
    if (!hasPerm(req.user, 'brief')) throw new AppError('اجازه گزارش‌نویسی ندارید', 403);
    next();
  });

  api.get('/reports', auth, guard, wrap(async (req, res) => {
    const pattern = like(req.query.q);
    const filter = pattern ? { $or: [
      { title: pattern },
      { body: pattern },
      { authorName: pattern },
      { authorUser: pattern },
      { unitNames: pattern },
    ] } : {};
    const rows = await Report.find(filter).sort({ updatedAt: -1 }).limit(300).lean();
    res.json(rows.map((row) => view(row, req.user, false)));
  }));

  api.get('/reports/:id', auth, guard, wrap(async (req, res) => {
    const row = await Report.findById(req.params.id).lean();
    if (!row) throw new AppError('گزارش پیدا نشد', 404);
    res.json(view(row, req.user));
  }));

  api.post('/reports', auth, guard, wrap(async (req, res) => {
    const input = readReportInput(req.body);
    const at = new Date();
    const doc = await Report.create({
      _id: randomBytes(8).toString('hex'),
      ...input,
      authorId: String(req.user._id),
      authorName: req.user.name || '',
      authorUser: req.user.username || '',
      unitIds: normalizeUnitIds(req.user.unitIds),
      unitNames: await unitsOf(req.user),
      createdAt: at,
      updatedAt: at,
      revisions: [],
    });
    await logReportEvent(req.user, doc, 'ثبت گزارش', {
      title: doc.title,
      body: doc.body,
      previousTitle: '',
      previousBody: '',
      at,
    });
    res.status(201).json(view(doc, req.user));
  }));

  api.put('/reports/:id', auth, guard, wrap(async (req, res) => {
    const row = await Report.findById(req.params.id);
    if (!row) throw new AppError('گزارش پیدا نشد', 404);
    if (!sameAuthor(req.user, row)) throw new AppError('فقط نویسنده می‌تواند این گزارش را ویرایش کند', 403);
    const input = readReportInput(req.body);
    const at = new Date();
    if (changed(row, input)) {
      const revision = revisionOf(row, input, at);
      row.revisions.push(revision);
      if (row.revisions.length > 80) row.revisions = row.revisions.slice(-80);
      row.title = input.title;
      row.body = input.body;
      row.updatedAt = at;
      await row.save();
      await logReportEvent(req.user, row, 'ویرایش گزارش', {
        previousTitle: revision.previousTitle,
        previousBody: revision.previousBody,
        title: input.title,
        body: input.body,
        at,
      });
    }
    res.json(view(row, req.user));
  }));
}

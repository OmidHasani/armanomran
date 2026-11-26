import { randomBytes } from 'node:crypto';
import { Activity } from './activity.js';
import { OrgUnit, Report, User } from './models.js';
import { hasPerm, normalizeUnitIds } from './perms.js';
import { AppError } from './validate.js';

const TITLE_MAX = 180;
const BODY_MAX = 20000;
const UNIT_CAP = 200;
const USER_CAP = 500;

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

export function userHasBrief(user, unitPerms) {
  if (!user || user.active === false) return false;
  if (user.role === 'admin') return true;
  if (Array.isArray(user.perms) && user.perms.includes('brief')) return true;
  return normalizeUnitIds(user.unitIds).some((id) => (unitPerms.get(id) || []).includes('brief'));
}

export function canReadReport(user, report) {
  if (!user || !report) return false;
  if (sameAuthor(user, report)) return true;
  if (report.visibility === 'private') return false;
  if (report.audienceScope !== 'units') return true;
  const mine = new Set(normalizeUnitIds(user.unitIds));
  const me = String(user._id);
  return (report.audienceUnits || []).some((unit) => {
    if (!mine.has(String(unit.id))) return false;
    if (unit.everyone === true) return true;
    if (unit.everyone === false) return (unit.userIds || []).map(String).includes(me);
    return false;
  });
}

export function visibleFilter(user) {
  const id = String(user._id);
  const units = normalizeUnitIds(user.unitIds);
  const sharedWithUnit = units.length ? [{
    audienceScope: 'units',
    audienceUnits: {
      $elemMatch: {
        id: { $in: units },
        $or: [
          { everyone: true },
          { everyone: false, userIds: id },
        ],
      },
    },
  }] : [];
  return {
    $or: [
      { authorId: id },
      {
        $and: [
          { $or: [{ visibility: 'public' }, { visibility: { $exists: false } }, { visibility: null }] },
          {
            $or: [
              { audienceScope: 'all' },
              { audienceScope: { $exists: false } },
              { audienceScope: null },
              ...sharedWithUnit,
            ],
          },
        ],
      },
    ],
  };
}

export function shareLabel(report, unitName = () => '', userName = () => '') {
  if (report?.visibility === 'private') return 'خصوصی';
  if (report?.audienceScope !== 'units') return 'عمومی · همه';
  const parts = (report.audienceUnits || []).map((unit) => {
    const name = unitName(String(unit.id)) || 'واحد';
    if (unit.everyone !== false) return name;
    const people = (unit.userIds || []).map((id) => userName(String(id))).filter(Boolean);
    if (!people.length) return name;
    if (people.length <= 2) return name + ' (' + people.join('، ') + ')';
    return name + ' (' + people.length + ' نفر)';
  });
  return 'عمومی · ' + (parts.join(' · ') || 'واحدهای انتخاب‌شده');
}

export function presetOf(value) {
  const mode = value?.mode === 'private' ? 'private' : 'public';
  const scope = value?.scope === 'units' ? 'units' : 'all';
  const units = [];
  const seen = new Set();
  for (const row of Array.isArray(value?.units) ? value.units : []) {
    const id = String(row?.id || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const userIds = normalizeUnitIds(row?.userIds);
    units.push({
      id,
      everyone: userIds.length ? false : row?.everyone !== false,
      userIds,
    });
  }
  return { mode, scope, units };
}

export function presetAgainst(stored, directory) {
  const preset = presetOf(stored);
  const known = new Map((directory || []).map((unit) => [unit.id, new Set(unit.users.map((person) => person.id))]));
  preset.units = preset.units.flatMap((unit) => {
    const members = known.get(unit.id);
    if (!members) return [];
    if (unit.everyone !== false) return [{ id: unit.id, everyone: true, userIds: [] }];
    const userIds = unit.userIds.filter((id) => members.has(id));
    if (!userIds.length) return [];
    return [{ id: unit.id, everyone: false, userIds }];
  });
  return preset;
}

function cleanUnits(raw, directory, strict) {
  if (!Array.isArray(raw)) {
    if (strict) throw new AppError('حداقل یک واحد را برای انتشار انتخاب کنید');
    return [];
  }
  if (raw.length > UNIT_CAP) throw new AppError('تعداد واحدهای انتخاب‌شده بیش از حد است');
  const known = new Map((directory || []).map((unit) => [unit.id, unit]));
  const clean = [];
  const seen = new Set();
  for (const row of raw) {
    const id = String(row?.id || '').trim();
    if (!id || seen.has(id)) continue;
    const unit = known.get(id);
    if (!unit) {
      if (strict) throw new AppError('یکی از واحدهای انتخاب‌شده در دسترس نیست یا کاربر دارای گزارش‌نویسی ندارد');
      continue;
    }
    seen.add(id);
    const wanted = normalizeUnitIds(row?.userIds);
    if (wanted.length > USER_CAP) throw new AppError('تعداد کاربران انتخاب‌شده بیش از حد است');
    if (!wanted.length) {
      if (!unit.users.length) {
        if (strict) throw new AppError('در واحد ' + unit.name + ' کسی دسترسی گزارش‌نویسی ندارد');
        continue;
      }
      clean.push({ id, everyone: true, userIds: [] });
      continue;
    }
    const members = new Set(unit.users.map((person) => person.id));
    const userIds = [];
    for (const userId of wanted) {
      if (!members.has(userId)) {
        if (strict) throw new AppError('کاربر انتخاب‌شده عضو این واحد نیست یا گزارش‌نویسی ندارد');
        continue;
      }
      userIds.push(userId);
    }
    if (!userIds.length) {
      if (strict) throw new AppError('برای واحد ' + unit.name + ' حداقل یک نفر را انتخاب کنید');
      continue;
    }
    clean.push({ id, everyone: false, userIds });
  }
  if (strict && !clean.length) throw new AppError('حداقل یک واحد را برای انتشار انتخاب کنید');
  return clean;
}

export function readAudience(body, directory) {
  const visibility = body?.visibility === 'private' ? 'private' : body?.visibility === 'public' ? 'public' : null;
  if (!visibility) throw new AppError('نوع انتشار را انتخاب کنید');
  const scope = body?.audienceScope === 'units' ? 'units' : 'all';
  const strict = visibility === 'public' && scope === 'units';
  const units = cleanUnits(body?.audienceUnits, directory, strict);
  return {
    visibility,
    audienceScope: strict ? 'units' : 'all',
    audienceUnits: (strict ? units : []).map((unit) => ({
      id: unit.id,
      everyone: unit.everyone,
      userIds: unit.everyone ? [] : unit.userIds,
    })),
    preset: { mode: visibility, scope, units },
  };
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

function audienceKey(doc) {
  const visibility = doc?.visibility === 'private' ? 'private' : 'public';
  const scope = visibility === 'public' && doc?.audienceScope === 'units' ? 'units' : 'all';
  const units = scope === 'units' ? (doc.audienceUnits || []).map((unit) => {
    const ids = unit.everyone === false ? (unit.userIds || []).map(String).sort() : [];
    return String(unit.id) + '=' + (unit.everyone === false ? ids.join(',') : '*');
  }).sort() : [];
  return visibility + '|' + scope + '|' + units.join(';');
}

function view(report, user, names, withBody = true) {
  const body = report.body || '';
  const mine = sameAuthor(user, report);
  const visibility = report.visibility === 'private' ? 'private' : 'public';
  const audienceScope = visibility === 'public' && report.audienceScope === 'units' ? 'units' : 'all';
  const shaped = { ...report, visibility, audienceScope };
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
    mine,
    visibility,
    audienceScope,
    shareLabel: shareLabel(shaped, names.unitName, names.userName),
    ...(mine ? {
      audienceUnits: (report.audienceUnits || []).map((unit) => ({
        id: String(unit.id),
        everyone: unit.everyone === true || (unit.everyone !== false && !(unit.userIds || []).length),
        userIds: (unit.userIds || []).map(String),
      })),
    } : {}),
  };
}

function like(value) {
  const raw = String(value || '').trim().slice(0, 80);
  if (!raw) return null;
  return new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

function authorIdOf(value) {
  const id = String(value || '').trim();
  if (!id) return '';
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new AppError('نویسنده نامعتبر است');
  return id;
}

export async function logReportEvent(user, report, action, snapshot) {
  const at = snapshot.at instanceof Date ? snapshot.at : new Date();
  await Activity.create({
    kind: 'report',
    actor: user.name,
    user: user.username,
    action,
    target: String(report.title || '').slice(0, 220),
    details: [action, snapshot.share || '', report.unitNames?.length ? 'واحد نویسنده ' + report.unitNames.join('، ') : ''].filter(Boolean).join(' · ').slice(0, 1000),
    snapshot: {
      reportId: String(report._id),
      authorName: report.authorName || '',
      authorUser: report.authorUser || '',
      unitNames: report.unitNames || [],
      title: snapshot.title ?? report.title,
      body: snapshot.body ?? report.body,
      previousTitle: snapshot.previousTitle ?? '',
      previousBody: snapshot.previousBody ?? '',
      share: snapshot.share || '',
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

async function publishDirectory() {
  const [units, users] = await Promise.all([
    OrgUnit.find({ active: { $ne: false } }).select('name perms').lean(),
    User.find({ active: { $ne: false } }).select('name username role perms unitIds').lean(),
  ]);
  const perms = new Map(units.map((unit) => [String(unit._id), unit.perms || []]));
  const writers = users.filter((user) => userHasBrief(user, perms));
  return units.map((unit) => ({
    id: String(unit._id),
    name: unit.name,
    users: writers
      .filter((user) => normalizeUnitIds(user.unitIds).includes(String(unit._id)))
      .map((user) => ({ id: String(user._id), name: user.name || user.username || 'کاربر', username: user.username || '' }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fa')),
  })).filter((unit) => unit.users.length).sort((a, b) => a.name.localeCompare(b.name, 'fa'));
}

function namesFrom(directory) {
  const unitName = new Map(directory.map((unit) => [unit.id, unit.name]));
  const userName = new Map();
  for (const unit of directory) {
    for (const person of unit.users) userName.set(person.id, person.name);
  }
  return {
    unitName: (id) => unitName.get(String(id)) || '',
    userName: (id) => userName.get(String(id)) || '',
  };
}

async function shareNames(rows) {
  const unitIds = [...new Set(rows.flatMap((row) => (row.audienceUnits || []).map((unit) => String(unit.id))))];
  const userIds = [...new Set(rows.flatMap((row) => (row.audienceUnits || []).flatMap((unit) => (unit.userIds || []).map(String))))]
    .filter((id) => /^[a-f0-9]{24}$/i.test(id));
  const [units, users] = await Promise.all([
    unitIds.length ? OrgUnit.find({ _id: { $in: unitIds } }).select('name').lean() : [],
    userIds.length ? User.find({ _id: { $in: userIds } }).select('name username').lean() : [],
  ]);
  const unitName = new Map(units.map((unit) => [String(unit._id), unit.name]));
  const userName = new Map(users.map((user) => [String(user._id), user.name || user.username || '']));
  return {
    unitName: (id) => unitName.get(String(id)) || '',
    userName: (id) => userName.get(String(id)) || '',
  };
}

function applyAudience(row, access) {
  row.visibility = access.visibility;
  row.audienceScope = access.audienceScope;
  row.audienceUnits = access.audienceUnits;
}

export function mountReports(api, auth, wrap) {
  const guard = wrap(async (req, res, next) => {
    if (!hasPerm(req.user, 'brief')) throw new AppError('اجازه گزارش‌نویسی ندارید', 403);
    next();
  });

  api.get('/reports/publish-options', auth, guard, wrap(async (req, res) => {
    const units = await publishDirectory();
    res.json({ preset: presetAgainst(req.user.reportPublish, units), units });
  }));

  api.get('/reports', auth, guard, wrap(async (req, res) => {
    const pattern = like(req.query.q);
    const author = authorIdOf(req.query.author);
    const filter = { $and: [visibleFilter(req.user)] };
    if (pattern) {
      filter.$and.push({ $or: [
        { title: pattern },
        { body: pattern },
        { authorName: pattern },
        { authorUser: pattern },
        { unitNames: pattern },
      ] });
    }
    if (author) filter.$and.push({ authorId: author });
    const [rows, authors] = await Promise.all([
      Report.find(filter).sort({ updatedAt: -1 }).limit(300).lean(),
      Report.aggregate([
        { $match: visibleFilter(req.user) },
        { $sort: { updatedAt: -1 } },
        { $group: { _id: '$authorId', name: { $first: '$authorName' }, username: { $first: '$authorUser' } } },
        { $sort: { name: 1 } },
      ]),
    ]);
    const names = await shareNames(rows);
    res.json({
      rows: rows.map((row) => view(row, req.user, names, false)),
      authors: authors.map((row) => ({
        id: String(row._id || ''),
        name: row.name || row.username || 'کاربر',
        username: row.username || '',
      })).filter((row) => row.id),
    });
  }));

  api.get('/reports/:id', auth, guard, wrap(async (req, res) => {
    const row = await Report.findById(req.params.id).lean();
    if (!row || !canReadReport(req.user, row)) throw new AppError('گزارش پیدا نشد', 404);
    const names = await shareNames([row]);
    res.json(view(row, req.user, names));
  }));

  api.post('/reports', auth, guard, wrap(async (req, res) => {
    const input = readReportInput(req.body);
    const directory = await publishDirectory();
    const access = readAudience(req.body, directory);
    const at = new Date();
    const doc = await Report.create({
      _id: randomBytes(8).toString('hex'),
      ...input,
      authorId: String(req.user._id),
      authorName: req.user.name || '',
      authorUser: req.user.username || '',
      unitIds: normalizeUnitIds(req.user.unitIds),
      unitNames: await unitsOf(req.user),
      visibility: access.visibility,
      audienceScope: access.audienceScope,
      audienceUnits: access.audienceUnits,
      createdAt: at,
      updatedAt: at,
      revisions: [],
    });
    await User.updateOne({ _id: req.user._id }, { $set: { reportPublish: access.preset } });
    const names = namesFrom(directory);
    await logReportEvent(req.user, doc, 'ثبت گزارش', {
      title: doc.title,
      body: doc.body,
      previousTitle: '',
      previousBody: '',
      share: shareLabel(doc, names.unitName, names.userName),
      at,
    });
    res.status(201).json(view(doc, req.user, names));
  }));

  api.put('/reports/:id', auth, guard, wrap(async (req, res) => {
    const row = await Report.findById(req.params.id);
    if (!row) throw new AppError('گزارش پیدا نشد', 404);
    if (!sameAuthor(req.user, row)) throw new AppError('فقط نویسنده می‌تواند این گزارش را ویرایش کند', 403);
    const input = readReportInput(req.body);
    const directory = await publishDirectory();
    const access = readAudience(req.body, directory);
    const at = new Date();
    const textChanged = changed(row, input);
    const audienceChanged = audienceKey(row) !== audienceKey(access);
    if (textChanged) {
      const revision = revisionOf(row, input, at);
      row.revisions.push(revision);
      if (row.revisions.length > 80) row.revisions = row.revisions.slice(-80);
      row.title = input.title;
      row.body = input.body;
    }
    if (textChanged || audienceChanged) {
      applyAudience(row, access);
      row.updatedAt = at;
      await row.save();
      const names = namesFrom(directory);
      await logReportEvent(req.user, row, textChanged ? 'ویرایش گزارش' : 'تغییر انتشار', {
        previousTitle: textChanged ? row.revisions[row.revisions.length - 1].previousTitle : row.title,
        previousBody: textChanged ? row.revisions[row.revisions.length - 1].previousBody : row.body,
        title: row.title,
        body: row.body,
        share: shareLabel(row, names.unitName, names.userName),
        at,
      });
    }
    const names = await shareNames([row]);
    res.json(view(row, req.user, names));
  }));
}

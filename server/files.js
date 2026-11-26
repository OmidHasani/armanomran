import { raw } from 'express';
import mongoose from 'mongoose';
import { Contract, Customer, LegalCase, Report } from './models.js';
import { noteReportFile } from './reports.js';
import { hasPerm, normalizeUnitIds } from './perms.js';
import { canAccessCase, legalUnitId } from './workcases.js';
import { AppError } from './validate.js';

const files = new mongoose.Schema({
  kind: String,
  parent: String,
  title: String,
  category: String,
  type: String,
  bytes: Buffer,
  size: Number,
  by: String,
  date: Date,
}, { versionKey: false });
files.index({ kind: 1, parent: 1 });
export const DossierFile = mongoose.model('DossierFile', files);

function canMutateFiles(user, kind) {
  if (hasPerm(user, 'admin') || hasPerm(user, 'write')) return true;
  if (kind === 'workcase') {
    return hasPerm(user, 'inbox') || hasPerm(user, 'legal') || normalizeUnitIds(user.unitIds).length > 0;
  }
  if (kind === 'contract') return hasPerm(user, 'cont_edit');
  if (kind === 'customer') return hasPerm(user, 'cust_write');
  return false;
}

export function mountFiles(api, auth, wrap) {
  const base = '/files/:kind/:parent';
  const access = wrap(async (req, res, next) => {
    const { kind, parent } = req.params;

    if (kind === 'report') {
      if (!hasPerm(req.user, 'brief')) throw new AppError('اجازه دسترسی ندارید', 403);
      const report = await Report.findById(parent).select('authorId').lean();
      if (!report) throw new AppError('گزارش پیدا نشد', 404);
      if (req.method !== 'GET' && String(report.authorId) !== String(req.user._id)) {
        throw new AppError('فقط نویسنده می‌تواند پیوست این گزارش را تغییر دهد', 403);
      }
      return next();
    }

    if (kind === 'workcase') {
      const item = await LegalCase.findById(parent).lean();
      if (!item) throw new AppError('ارجاع پیدا نشد', 404);
      const lid = hasPerm(req.user, 'legal') ? await legalUnitId() : '';
      if (!canAccessCase(req.user, item, lid)) throw new AppError('اجازه دسترسی ندارید', 403);
      if (req.method !== 'GET' && !canMutateFiles(req.user, kind)) {
        throw new AppError('اجازه بارگذاری ندارید', 403);
      }
      return next();
    }

    const model = kind === 'contract' ? Contract : kind === 'customer' ? Customer : null;
    const viewKey = kind === 'contract' ? 'cont' : 'cust';
    if (!model || (!hasPerm(req.user, viewKey) && !canMutateFiles(req.user, kind))
      || (req.method !== 'GET' && !canMutateFiles(req.user, kind))) {
      throw new AppError('اجازه دسترسی ندارید', 403);
    }
    if (!await model.exists({ _id: parent })) throw new AppError('پرونده پیدا نشد', 404);
    next();
  });

  api.use(base, auth, access);

  api.get(base, wrap(async (req, res) => res.set('Cache-Control', 'no-store')
    .json(await DossierFile.find(req.params).select('-bytes').sort({ date: -1 }).lean())));

  api.post(base, raw({ type: 'application/octet-stream', limit: '8mb' }), wrap(async (req, res) => {
    const buf = req.body;
    if (!Buffer.isBuffer(buf) || !buf.length) throw new AppError('فایل خالی یا نامعتبر است');
    const hex = buf.subarray(0, 8).toString('hex');
    const type = hex.startsWith('255044462d') ? 'application/pdf'
      : hex.startsWith('ffd8ff') ? 'image/jpeg'
        : hex === '89504e470d0a1a0a' ? 'image/png'
          : buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP' ? 'image/webp' : '';
    const name = String(req.query.title || 'مدرک').slice(0, 180);
    const office = hex.startsWith('504b0304') && buf.includes(Buffer.from('[Content_Types].xml'));
    let mime = type;
    if (office && /\.docx$/i.test(name) && buf.includes(Buffer.from('word/document.xml'))) {
      mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (office && /\.xlsx$/i.test(name) && buf.includes(Buffer.from('xl/workbook.xml'))) {
      mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    if (!mime) throw new AppError('قالب فایل پشتیبانی نمی‌شود. PDF، تصویر، Word یا Excel انتخاب کنید.');
    const doc = await DossierFile.create({
      ...req.params,
      title: name,
      category: String(req.query.category || 'سایر').slice(0, 120),
      type: mime,
      bytes: buf,
      size: buf.length,
      by: req.user.name,
      date: new Date(),
    });
    if (req.params.kind === 'report') await noteReportFile(req.user, req.params.parent, 'پیوست گزارش', name);
    res.status(201).json({ id: doc.id });
  }));

  api.get(base + '/:id', wrap(async (req, res) => {
    const { kind, parent, id } = req.params;
    const f = mongoose.isObjectIdOrHexString(id) && await DossierFile.findOne({ _id: id, parent, kind });
    if (!f) throw new AppError('فایل پیدا نشد', 404);
    res.set({
      'Cache-Control': 'private, no-store',
      'Content-Type': f.type,
      'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(f.title),
    }).send(f.bytes);
  }));

  api.delete(base + '/:id', wrap(async (req, res) => {
    const { kind, parent, id } = req.params;
    const existing = mongoose.isObjectIdOrHexString(id) && await DossierFile.findOne({ _id: id, kind, parent }).select('title');
    if (!existing) throw new AppError('فایل پیدا نشد', 404);
    await DossierFile.deleteOne({ _id: id, kind, parent });
    if (kind === 'report') await noteReportFile(req.user, parent, 'حذف پیوست گزارش', existing.title);
    res.json({ ok: true });
  }));
}

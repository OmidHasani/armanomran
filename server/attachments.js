import { randomUUID } from 'crypto';
import { GridFSBucket, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { AppError } from './validate.js';

const KINDS = [
  { k: 'contract_signed', l: 'قرارداد امضاشده' },
  { k: 'installment_signed', l: 'جدول اقساط امضاشده' },
  { k: 'payment_receipt', l: 'فیش / رسید پرداخت' },
  { k: 'id_card', l: 'مدارک هویتی' },
  { k: 'other', l: 'سایر اسناد' },
];

const KIND_SET = new Set(KINDS.map((x) => x.k));
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const attachmentSchema = new mongoose.Schema({
  _id: String,
  custId: { type: String, required: true, index: true },
  contractId: { type: String, default: '', index: true },
  kind: { type: String, required: true },
  title: { type: String, default: '' },
  originalName: { type: String, default: '' },
  mime: { type: String, required: true },
  size: { type: Number, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  uploadedBy: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false, collection: 'attachments' });

attachmentSchema.index({ custId: 1, createdAt: -1 });

export const Attachment = mongoose.model('Attachment', attachmentSchema);

function bucket() {
  if (!mongoose.connection?.db) throw new AppError('اتصال پایگاه داده برقرار نیست', 503);
  return new GridFSBucket(mongoose.connection.db, { bucketName: 'crm_files' });
}

function publicAttach(doc) {
  return {
    id: String(doc._id),
    custId: doc.custId,
    contractId: doc.contractId || '',
    kind: doc.kind,
    title: doc.title || '',
    originalName: doc.originalName || '',
    mime: doc.mime,
    size: Number(doc.size) || 0,
    uploadedBy: doc.uploadedBy || '',
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
    url: `/api/attachments/${doc._id}/file`,
  };
}

function normalizeKind(kind) {
  const k = String(kind || '').trim();
  if (!KIND_SET.has(k)) throw new AppError('نوع سند نامعتبر است');
  return k;
}

function assertFile(file) {
  if (!file?.buffer?.length) throw new AppError('فایلی ارسال نشده است');
  if (file.size > MAX_BYTES) throw new AppError('حجم فایل حداکثر ۵ مگابایت است');
  const mime = String(file.mimetype || '').toLowerCase();
  if (!ALLOWED_MIME.has(mime)) throw new AppError('فقط تصویر (JPG/PNG/WebP/GIF) یا PDF مجاز است');
  return mime;
}

async function storeBuffer(file, meta) {
  const mime = assertFile(file);
  const gfs = bucket();
  const filename = `${meta.custId}/${Date.now()}-${randomUUID()}`;
  const uploadStream = gfs.openUploadStream(filename, {
    contentType: mime,
    metadata: {
      custId: meta.custId,
      contractId: meta.contractId || '',
      kind: meta.kind,
      originalName: file.originalname || '',
    },
  });
  await new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', resolve);
    uploadStream.end(file.buffer);
  });
  return { fileId: uploadStream.id, mime, size: file.size, originalName: file.originalname || '' };
}

async function deleteGridFile(fileId) {
  if (!fileId) return;
  try {
    await bucket().delete(fileId instanceof ObjectId ? fileId : new ObjectId(String(fileId)));
  } catch {
    /* already gone */
  }
}

export function attachmentOptions() {
  return { kinds: KINDS, maxBytes: MAX_BYTES, allowedMime: [...ALLOWED_MIME] };
}

export async function listAttachments({ custId, contractId } = {}) {
  const filter = {};
  if (custId) filter.custId = String(custId);
  if (contractId) filter.contractId = String(contractId);
  if (!filter.custId && !filter.contractId) throw new AppError('شناسه مشتری یا قرارداد لازم است');
  const rows = await Attachment.find(filter).sort({ createdAt: -1 }).lean();
  return rows.map(publicAttach);
}

export async function createAttachment({ file, custId, contractId, kind, title }, user) {
  const cid = String(custId || '').trim();
  if (!cid) throw new AppError('شناسه مشتری لازم است');
  const k = normalizeKind(kind);
  const stored = await storeBuffer(file, {
    custId: cid,
    contractId: String(contractId || '').trim(),
    kind: k,
  });
  const now = new Date();
  const doc = await Attachment.create({
    _id: randomUUID(),
    custId: cid,
    contractId: String(contractId || '').trim(),
    kind: k,
    title: String(title || '').trim().slice(0, 200),
    originalName: stored.originalName.slice(0, 260),
    mime: stored.mime,
    size: stored.size,
    fileId: stored.fileId,
    uploadedBy: user?.name || user?.username || '',
    createdAt: now,
    updatedAt: now,
  });
  return publicAttach(doc.toObject());
}

export async function updateAttachment(id, body, user) {
  const doc = await Attachment.findById(String(id));
  if (!doc) throw new AppError('سند پیدا نشد', 404);
  if (body?.kind != null && body.kind !== '') doc.kind = normalizeKind(body.kind);
  if (body?.title != null) doc.title = String(body.title || '').trim().slice(0, 200);
  if (body?.contractId != null) doc.contractId = String(body.contractId || '').trim();
  doc.updatedAt = new Date();
  doc.uploadedBy = doc.uploadedBy || user?.name || user?.username || '';
  await doc.save();
  return publicAttach(doc.toObject());
}

export async function getAttachmentFile(id) {
  const doc = await Attachment.findById(String(id)).lean();
  if (!doc) throw new AppError('سند پیدا نشد', 404);
  const stream = bucket().openDownloadStream(doc.fileId);
  return {
    meta: publicAttach(doc),
    stream,
    mime: doc.mime,
    originalName: doc.originalName || 'file',
  };
}

export async function deleteAttachment(id) {
  const doc = await Attachment.findById(String(id));
  if (!doc) throw new AppError('سند پیدا نشد', 404);
  const fileId = doc.fileId;
  await doc.deleteOne();
  await deleteGridFile(fileId);
  return { ok: true };
}

export async function purgeAttachments({ customerIds = [], contractIds = [] } = {}) {
  const filter = [];
  if (customerIds.length) filter.push({ custId: { $in: customerIds.map(String) } });
  if (contractIds.length) filter.push({ contractId: { $in: contractIds.map(String) } });
  if (!filter.length) return { deleted: 0 };
  const rows = await Attachment.find({ $or: filter }).lean();
  let deleted = 0;
  for (const row of rows) {
    await Attachment.deleteOne({ _id: row._id });
    await deleteGridFile(row.fileId);
    deleted += 1;
  }
  return { deleted };
}

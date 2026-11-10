import mongoose from 'mongoose';

const { Schema } = mongoose;

const unitSchema = new Schema({
  id: { type: String, required: true },
  no: { type: String, required: true },
  floor: { type: String, default: '' },
  kind: { type: String, default: '' },
  area: { type: Number, required: true },
  ppm: { type: Number, required: true },
  total: { type: Number, required: true },
  ppmRaw: { type: Number, default: 0 },
  totalRaw: { type: Number, default: 0 },
  st: { type: String, enum: ['free', 'res', 'sold'], required: true },
  block: { type: String, default: '' },
  rooms: { type: Number, default: 0 },
  face: { type: String, default: '' },
  parking: { type: Boolean, default: false },
  parkingCount: { type: Number, default: 0 },
  storage: { type: Boolean, default: false },
  storageCount: { type: Number, default: 0 },
  storageArea: { type: Number, default: 0 },
  handReady: { type: Boolean, default: false },
  handDate: { type: String, default: '' },
  dangSplit: { type: Boolean, default: false },
  owners: {
    type: [{
      id: { type: String, required: true },
      custId: { type: String, required: true },
      dang: { type: Number, required: true },
      note: { type: String, default: '' },
    }],
    default: [],
  },
}, { _id: false });

const projectSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  addr: { type: String, default: '' },
  note: { type: String, default: '' },
  vcName: { type: String, default: '' },
  vcPhone: { type: String, default: '' },
  vcNote: { type: String, default: '' },
  units: { type: [unitSchema], default: [] },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });

const noteSchema = new Schema({
  d: String,
  t: String,
  by: String,
}, { _id: false });

const customerSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  father: { type: String, default: '' },
  nid: { type: String, required: true },
  bc: { type: String, default: '' },
  phone: { type: String, required: true },
  addr: { type: String, default: '' },
  kyc: { type: Schema.Types.Mixed },
  notes: { type: [noteSchema], default: [] },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });
customerSchema.index({ nid: 1 }, { unique: true });
customerSchema.index({ phone: 1 });

const instPaySchema = new Schema({
  id: { type: String, required: true },
  amt: { type: Number, required: true },
  date: { type: String, required: true },
  ref: { type: String, default: '' },
  note: { type: String, default: '' },
  overFrom: { type: String, default: '' },
}, { _id: false });

const instSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  amt: { type: Number, required: true },
  date: { type: String, required: true },
  paid: { type: Boolean, default: false },
  pdate: { type: String, default: '' },
  ref: { type: String, default: '' },
  kind: { type: String, default: '' },
  fromPayId: { type: String, default: '' },
  payer: { type: String, default: '' },
  acct: { type: String, default: '' },
  pays: { type: [instPaySchema], default: [] },
  latePctDaily: { type: Number, default: undefined },
  lateDays: { type: Number, default: 0 },
  lateCalc: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  lateNote: { type: String, default: '' },
}, { _id: false });

const facSchema = new Schema({
  t: String,
  cost: Number,
  done: Boolean,
}, { _id: false });

const qarzPaySchema = new Schema({
  id: { type: String, default: '' },
  amt: { type: Number, default: 0 },
  date: { type: String, default: '' },
  bank: { type: String, default: '' },
  ref: { type: String, default: '' },
}, { _id: false });

const contractDocSchema = new Schema({
  title: { type: String, default: '' },
  birth: { type: String, default: '' },
  addr: { type: String, default: '' },
  phone: { type: String, default: '' },
  loc: { type: String, default: '' },
  area: { type: String, default: '' },
  floor: { type: String, default: '' },
  unitNo: { type: String, default: '' },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
  handDate: { type: String, default: '' },
  qarzTotal: { type: Number, default: 0 },
  qarzPays: { type: [qarzPaySchema], default: [] },
  payDayLabel: { type: String, default: '' },
  coolDays: { type: String, default: '' },
  qarzRefundCount: { type: String, default: '' },
  payBank: { type: String, default: '' },
  payCard: { type: String, default: '' },
  paySheba: { type: String, default: '' },
  payAcct: { type: String, default: '' },
  payName: { type: String, default: '' },
  postal: { type: String, default: '' },
  block: { type: String, default: '' },
  landAddr: { type: String, default: '' },
  chequeNo: { type: String, default: '' },
  delayFineDaily: { type: Number, default: 0 },
  delayExtraDays: { type: String, default: '' },
}, { _id: false });

const contractSchema = new Schema({
  _id: String,
  no: { type: String, required: true },
  type: { type: String, enum: ['lease', 'partner', 'invest'], required: true },
  cust: { type: String, required: true },
  proj: { type: String, required: true },
  unit: { type: String, required: true },
  date: { type: String, required: true },
  total: { type: Number, required: true },
  baseTotal: { type: Number, default: 0 },
  extraOn: { type: Boolean, default: false },
  extraPct: { type: Number, default: 0 },
  extraAmt: { type: Number, default: 0 },
  profitOn: { type: Boolean, default: false },
  profitPct: { type: Number, default: 0 },
  profitAmt: { type: Number, default: 0 },
  dur: { type: String, default: '' },
  note: { type: String, default: '' },
  latePctDaily: { type: Number, default: 0 },
  auto: Boolean,
  resId: { type: String, default: '' },
  inst: { type: [instSchema], default: [] },
  fac: { type: [facSchema], default: undefined },
  hand: { type: String, default: '' },
  doc: { type: contractDocSchema, default: undefined },
  ed: { type: Schema.Types.Mixed },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });
contractSchema.index({ no: 1 }, { unique: true });
contractSchema.index({ cust: 1 });
contractSchema.index({ proj: 1, unit: 1 });
contractSchema.index({ resId: 1 });

const paySchema = new Schema({
  id: { type: String, required: true },
  amt: { type: Number, required: true },
  date: { type: String, required: true },
  ref: { type: String, default: '' },
  acct: { type: String, default: '' },
  payer: { type: String, default: '' },
  tp: { type: Boolean, default: false },
  rel: { type: String, default: '' },
  appv: { type: String, default: '' },
  s: { type: String, enum: ['ok', 'used', 'ref', 'closed'], default: 'ok' },
}, { _id: false });

const logSchema = new Schema({
  d: String,
  h: String,
  by: String,
  t: String,
}, { _id: false });

const reservationSchema = new Schema({
  _id: String,
  no: { type: String, required: true },
  cust: { type: String, required: true },
  proj: { type: String, required: true },
  unit: { type: String, required: true },
  need: { type: Number, required: true },
  fine: { type: Number, required: true },
  deadline: { type: String, required: true },
  date: { type: String, required: true },
  st: { type: String, enum: ['active', 'cancelling', 'cancel', 'conv'], required: true },
  pays: { type: [paySchema], default: [] },
  by: { type: String, default: '' },
  appr: { type: String, default: '' },
  log: { type: [logSchema], default: [] },
  cancel: { type: Schema.Types.Mixed },
  doc: { type: Schema.Types.Mixed },
  ed: { type: Schema.Types.Mixed },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });
reservationSchema.index({ no: 1 }, { unique: true });
reservationSchema.index({ cust: 1 });
reservationSchema.index({ st: 1 });

const leadEventSchema = new Schema({
  id: String,
  d: String,
  h: { type: String, default: '' },
  by: { type: String, default: '' },
  from: Number,
  s: Number,
  note: { type: String, default: '' },
  kind: { type: String, default: 'stage' },
  vcName: { type: String, default: '' },
  vcPhone: { type: String, default: '' },
  visitAt: { type: String, default: '' },
}, { _id: false });

const leadSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  phone: { type: String, required: true },
  src: { type: String, default: '' },
  proj: { type: String, default: '' },
  stage: { type: Number, default: 0 },
  next: { type: String, default: '' },
  loan: { type: String, default: 'no' },
  rep: { type: String, default: '' },
  note: { type: String, default: '' },
  cust: { type: String, default: '' },
  vcName: { type: String, default: '' },
  vcPhone: { type: String, default: '' },
  visitAt: { type: String, default: '' },
  visitDoneAt: { type: String, default: '' },
  h: { type: [leadEventSchema], default: [] },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });
leadSchema.index({ phone: 1 });
leadSchema.index({ stage: 1 });
leadSchema.index({ rep: 1 });

const metaSchema = new Schema({
  _id: { type: String, default: 'crm' },
  version: { type: Number, default: 0 },
  fine: { type: Number, default: 30000000 },
  days: { type: Number, default: 20 },
  legalDays: { type: Number, default: 7 },
  autoLegal: { type: Boolean, default: true },
  me: { type: String, default: '' },
  pn: { type: Number, default: 1000 },
  cn: { type: Number, default: 1000 },
  rn: { type: Number, default: 1000 },
  updatedBy: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false, collection: 'meta' });

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'legal'], required: true },
  perms: { type: [String], default: [] },
  unitIds: { type: [String], default: [] },
  active: { type: Boolean, default: true },
  lastLoginAt: Date,
}, { timestamps: true, versionKey: false });
userSchema.index({ unitIds: 1 });
userSchema.index({ role: 1, active: 1 });

const orgUnitSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, lowercase: true, trim: true },
  note: { type: String, default: '' },
  active: { type: Boolean, default: true },
  memberIds: { type: [String], default: [] },
  headId: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false, collection: 'org_units' });
orgUnitSchema.index({ active: 1, name: 1 });
orgUnitSchema.index({ memberIds: 1 });

const timelineSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['create', 'follow', 'transfer', 'status', 'assign'],
    required: true,
  },
  d: { type: String, required: true },
  h: { type: String, required: true },
  by: { type: String, default: '' },
  byId: { type: String, default: '' },
  actions: { type: [String], default: [] },
  subjects: { type: [String], default: [] },
  result: { type: String, default: '' },
  note: { type: String, default: '' },
  next: { type: String, default: '' },
  fromUnitId: { type: String, default: '' },
  fromUnitName: { type: String, default: '' },
  toUnitId: { type: String, default: '' },
  toUnitName: { type: String, default: '' },
  fromUserId: { type: String, default: '' },
  toUserId: { type: String, default: '' },
  toUserName: { type: String, default: '' },
  status: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const followSchema = new Schema({
  id: { type: String, required: true },
  d: { type: String, required: true },
  h: { type: String, required: true },
  by: { type: String, default: '' },
  byId: { type: String, default: '' },
  actions: { type: [String], default: [] },
  subjects: { type: [String], default: [] },
  result: { type: String, default: '' },
  note: { type: String, default: '' },
  next: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const legalCaseSchema = new Schema({
  _id: String,
  sourceKey: { type: String, required: true, unique: true },
  kind: {
    type: String,
    enum: ['installment', 'reservation', 'manual', 'contract', 'payment', 'report', 'text'],
    required: true,
  },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  status: { type: String, enum: ['new', 'working', 'waiting', 'done'], default: 'new', index: true },
  priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
  referredAt: { type: Date, default: Date.now },
  referredBy: { type: String, default: 'سامانه' },
  referredById: { type: String, default: '' },
  currentUnitId: { type: String, default: '', index: true },
  currentUnitName: { type: String, default: '' },
  thresholdDays: { type: Number, default: 7 },
  overdueDays: { type: Number, default: 0 },
  customer: {
    id: String, name: String, nid: String, phone: String, addr: String, father: String,
  },
  project: { id: String, name: String, addr: String },
  unit: { id: String, no: String, floor: String, kind: String, area: Number, total: Number },
  contract: {
    id: String,
    no: String,
    type: { type: String },
    date: String,
    total: Number,
    paid: Number,
    remaining: Number,
  },
  installment: {
    id: String, title: String, amt: Number, date: String, ref: String, paid: Boolean,
  },
  reservation: {
    id: String, no: String, need: Number, paid: Number, deadline: String, st: String,
  },
  payment: {
    id: String, amt: Number, date: String, ref: String, acct: String, payer: String,
  },
  ledgerId: { type: String, default: '' },
  checkId: { type: String, default: '' },
  chart: {
    due: Number, paid: Number, remaining: Number, contractTotal: Number, overdueAmt: Number,
  },
  assignedTo: { type: String, default: '' },
  assignedName: { type: String, default: '' },
  follows: { type: [followSchema], default: [] },
  timeline: { type: [timelineSchema], default: [] },
  closedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false, collection: 'legal_cases' });
legalCaseSchema.index({ status: 1, referredAt: -1 });
legalCaseSchema.index({ currentUnitId: 1, status: 1, referredAt: -1 });
legalCaseSchema.index({ assignedTo: 1, status: 1 });
legalCaseSchema.index({ referredById: 1 });
legalCaseSchema.index({ 'customer.id': 1 });
legalCaseSchema.index({ 'contract.id': 1 });

const partySchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  kind: { type: String, enum: ['cust', 'staff', 'contractor'], required: true },
  title: { type: String, default: '' },
  phone: { type: String, default: '' },
  nid: { type: String, default: '' },
  custId: { type: String, default: '' },
  note: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });
partySchema.index({ name: 1 });
partySchema.index({ kind: 1 });
partySchema.index({ custId: 1 });

const ledgerSchema = new Schema({
  _id: String,
  party: { type: String, required: true, index: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  amt: { type: Number, required: true },
  desc: { type: String, default: '' },
  ref: { type: String, default: '' },
  by: { type: String, default: '' },
  source: { type: String, enum: ['manual', 'check'], default: 'manual' },
  checkId: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });
ledgerSchema.index({ party: 1, date: 1 });
ledgerSchema.index({ checkId: 1 });

const checkSchema = new Schema({
  _id: String,
  type: { type: String, enum: ['in', 'out'], required: true },
  party: { type: String, required: true, index: true },
  amt: { type: Number, required: true },
  checkDate: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  regDate: { type: String, required: true },
  bank: { type: String, default: '' },
  branch: { type: String, default: '' },
  sayad: { type: String, default: '' },
  serial: { type: String, default: '' },
  accountNo: { type: String, default: '' },
  holder: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'cleared', 'bounced', 'returned', 'cancelled'],
    default: 'pending',
  },
  desc: { type: String, default: '' },
  note: { type: String, default: '' },
  by: { type: String, default: '' },
  ledgerId: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });
checkSchema.index({ type: 1, dueDate: 1 });
checkSchema.index({ party: 1, regDate: 1 });

export const Project = mongoose.model('Project', projectSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const Contract = mongoose.model('Contract', contractSchema);
export const Reservation = mongoose.model('Reservation', reservationSchema);
export const Lead = mongoose.model('Lead', leadSchema);
export const Party = mongoose.model('Party', partySchema);
export const Ledger = mongoose.model('Ledger', ledgerSchema);
export const Check = mongoose.model('Check', checkSchema);
export const Meta = mongoose.model('Meta', metaSchema);
export const User = mongoose.model('User', userSchema);
export const OrgUnit = mongoose.model('OrgUnit', orgUnitSchema);
export const LegalCase = mongoose.model('LegalCase', legalCaseSchema);
export const WorkCase = LegalCase;

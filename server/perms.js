export const ROLES = {
  admin: 'مدیر',
  staff: 'کارشناس فروش',
  legal: 'واحد حقوقی',
};

export const DASH_KINDS = {
  manage: 'میز کار مدیریتی',
  legal: 'میز کار حقوقی',
  contracts: 'میز کار امور قراردادها',
};

export const PERM_DEFS = [
  { k: 'dash', l: 'داشبورد', g: 'view' },
  { k: 'lead', l: 'سرنخ‌ها', g: 'view' },
  { k: 'proj', l: 'پروژه‌ها و واحدها', g: 'view' },
  { k: 'cust', l: 'مشتریان', g: 'view' },
  { k: 'cont', l: 'مشاهده قراردادها', g: 'view' },
  { k: 'res', l: 'رزروها', g: 'view' },
  { k: 'acct', l: 'حسابداری و اشخاص طرف حساب', g: 'view' },
  { k: 'rep', l: 'گزارش‌ها و آمار فروش', g: 'view' },
  { k: 'legal', l: 'واحد حقوقی و پرونده‌های ارجاعی', g: 'view' },
  { k: 'inbox', l: 'صندوق ارجاعات و پیگیری سازمانی', g: 'view' },
  { k: 'brief', l: 'گزارش‌نویسی', g: 'view' },
  { k: 'cont_add', l: 'ثبت قرارداد', g: 'act' },
  { k: 'cont_edit', l: 'ویرایش و حذف قرارداد', g: 'act' },
  { k: 'pay_add', l: 'ثبت پرداخت و واریز', g: 'act' },
  { k: 'pay_edit', l: 'ویرایش و حذف پرداخت', g: 'act' },
  { k: 'cust_write', l: 'ثبت و ویرایش مشتری', g: 'act' },
  { k: 'proj_write', l: 'ثبت و ویرایش پروژه و واحد', g: 'act' },
  { k: 'res_write', l: 'ثبت و ویرایش رزرو', g: 'act' },
  { k: 'lead_write', l: 'ثبت و ویرایش سرنخ', g: 'act' },
  { k: 'write', l: 'ویرایش کامل (همه اقدام‌های بالا)', g: 'power' },
  { k: 'admin', l: 'پنل ادمین، کاربران و تنظیمات', g: 'power' },
];

export const ACTION_KEYS = PERM_DEFS.filter((p) => p.g === 'act').map((p) => p.k);

export const ROLE_DEFAULTS = {
  admin: PERM_DEFS.map((p) => p.k),
  staff: ['dash', 'lead', 'proj', 'cust', 'cont', 'res', 'acct', 'rep', 'inbox', 'write', ...ACTION_KEYS],
  legal: ['dash', 'cust', 'cont', 'legal', 'inbox'],
};

export function normalizeRole(role) {
  return ROLES[role] ? role : 'staff';
}

export function normalizeDashKind(value) {
  const kind = String(value || '').trim();
  return DASH_KINDS[kind] ? kind : '';
}

export function resolveDashKind(user) {
  if (!user) return 'manage';
  const own = normalizeDashKind(user.dashKind);
  if (own) return own;
  const fromUnit = normalizeDashKind(user.$locals?.dashKind);
  if (fromUnit) return fromUnit;
  if (normalizeRole(user.role) === 'legal') return 'legal';
  return 'manage';
}

export function normalizePerms(role, perms) {
  const r = normalizeRole(role);
  if (r === 'admin') return [...ROLE_DEFAULTS.admin];
  const allowed = new Set(PERM_DEFS.map((p) => p.k));
  const list = Array.isArray(perms) ? perms.filter((p) => allowed.has(p)) : [];
  if (!Array.isArray(perms)) return [...(ROLE_DEFAULTS[r] || ROLE_DEFAULTS.staff)];
  return [...new Set(list)];
}

export function normalizeUnitIds(unitIds) {
  if (!Array.isArray(unitIds)) return [];
  return [...new Set(unitIds.map((id) => String(id || '').trim()).filter(Boolean))];
}

export function hasPerm(user, key) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = Array.isArray(user.perms) ? user.perms : normalizePerms(user.role, user.perms);
  return perms.includes(key) || !!user.$locals?.unitPerms?.includes(key);
}

/** Explicit action, or the legacy full-edit flag together with the related module. */
export function canAct(user, key) {
  if (!user || !ACTION_KEYS.includes(key)) return false;
  if (user.role === 'admin' || hasPerm(user, 'admin')) return true;
  if (hasPerm(user, key)) return true;
  if (!hasPerm(user, 'write')) return false;
  if (key === 'cont_add' || key === 'cont_edit') return hasPerm(user, 'cont');
  if (key === 'pay_add' || key === 'pay_edit') return hasPerm(user, 'cont') || hasPerm(user, 'res');
  if (key === 'cust_write') return hasPerm(user, 'cust');
  if (key === 'proj_write') return hasPerm(user, 'proj');
  if (key === 'res_write') return hasPerm(user, 'res');
  if (key === 'lead_write') return hasPerm(user, 'lead');
  return false;
}

const SAVE_KEYS = ['cont_add', 'cont_edit', 'pay_add', 'pay_edit', 'cust_write', 'proj_write', 'res_write', 'lead_write'];

export function canSaveState(user) {
  if (!user) return false;
  if (hasPerm(user, 'admin') || hasPerm(user, 'write') || hasPerm(user, 'acct')) return true;
  return SAVE_KEYS.some((key) => canAct(user, key));
}

export function publicUser(user) {
  const role = normalizeRole(user.role);
  const perms = normalizePerms(role, user.perms);
  const dashKind = normalizeDashKind(user.dashKind);
  return {
    id: String(user._id),
    username: user.username,
    name: user.name,
    role,
    roleLabel: ROLES[role],
    jobTitle: user.jobTitle || '',
    phone: user.phone || '',
    perms: [...new Set([...perms, ...(user.$locals?.unitPerms || [])])],
    unitIds: normalizeUnitIds(user.unitIds),
    active: user.active !== false,
    dashKind,
    dash: resolveDashKind(user),
  };
}

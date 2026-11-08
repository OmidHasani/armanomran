export const ROLES = {
  admin: 'مدیر',
  staff: 'کارشناس فروش',
  legal: 'واحد حقوقی',
};

export const PERM_DEFS = [
  { k: 'dash', l: 'داشبورد و پیگیری' },
  { k: 'lead', l: 'سرنخ‌ها' },
  { k: 'proj', l: 'پروژه‌ها و واحدها' },
  { k: 'cust', l: 'مشتریان' },
  { k: 'cont', l: 'قراردادها' },
  { k: 'res', l: 'رزروها' },
  { k: 'acct', l: 'حسابداری و اشخاص طرف حساب' },
  { k: 'rep', l: 'گزارش‌ها' },
  { k: 'legal', l: 'واحد حقوقی و پرونده‌های ارجاعی' },
  { k: 'inbox', l: 'صندوق ارجاعات و پیگیری سازمانی' },
  { k: 'write', l: 'ثبت و ویرایش اطلاعات CRM' },
  { k: 'admin', l: 'پنل ادمین، کاربران و تنظیمات' },
];

export const ROLE_DEFAULTS = {
  admin: PERM_DEFS.map((p) => p.k),
  staff: ['dash', 'lead', 'proj', 'cust', 'cont', 'res', 'acct', 'rep', 'write', 'inbox'],
  legal: ['dash', 'cust', 'cont', 'legal', 'inbox'],
};

export function normalizeRole(role) {
  return ROLES[role] ? role : 'staff';
}

export function normalizePerms(role, perms) {
  const r = normalizeRole(role);
  if (r === 'admin') return [...ROLE_DEFAULTS.admin];
  const allowed = new Set(PERM_DEFS.map((p) => p.k));
  const list = Array.isArray(perms) ? perms.filter((p) => allowed.has(p)) : [];
  if (!list.length) return [...(ROLE_DEFAULTS[r] || ROLE_DEFAULTS.staff)];
  if (r === 'legal' && !list.includes('legal')) list.push('legal');
  if (r === 'legal' && !list.includes('inbox')) list.push('inbox');
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
  return perms.includes(key);
}

export function publicUser(user) {
  const role = normalizeRole(user.role);
  const perms = normalizePerms(role, user.perms);
  return {
    id: String(user._id),
    username: user.username,
    name: user.name,
    role,
    roleLabel: ROLES[role],
    perms,
    unitIds: normalizeUnitIds(user.unitIds),
    active: user.active !== false,
  };
}

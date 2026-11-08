export function normalizeDigits(s) {
  return String(s ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

function j2g(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sa = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    if (gd <= sa[gm]) break;
    gd -= sa[gm];
  }
  return [gy, gm, gd];
}

export function todayJ(dt = new Date()) {
  const parts = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(dt);
  const g = (t) => parts.find((x) => x.type === t).value;
  const y = +g('year');
  const m = String(+g('month')).padStart(2, '0');
  const d = String(+g('day')).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

export function toDate(s) {
  const [y, m, d] = normalizeDigits(s).replace(/-/g, '/').split('/').map(Number);
  const [gy, gm, gd] = j2g(y, m, d);
  return new Date(gy, gm - 1, gd);
}

export function diffDays(jalali) {
  return Math.round((toDate(jalali) - toDate(todayJ())) / 864e5);
}

export function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

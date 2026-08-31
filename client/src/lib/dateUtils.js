// Ported from Workout-Book.html's small-utilities section (docs/legacy/Workout-Book.html:385-412).

export function pad2(n) { return String(n).padStart(2, '0'); }
export function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseYMD(s) {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}

export function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
export function firstWeekday(y, m) { return new Date(y, m - 1, 1).getDay(); }

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function addMonths(y, m, delta) {
  const idx = y * 12 + (m - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return { y: ny, m: nm };
}

export function fmtMonthYear(y, m) { return `${MONTH_NAMES[m - 1]} ${y}`; }

export function fmtDateLong(s) {
  const p = parseYMD(s);
  const dt = new Date(p.y, p.m - 1, p.d);
  return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function fmtDateShort(s) {
  const p = parseYMD(s);
  const dt = new Date(p.y, p.m - 1, p.d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function nowTimeStr() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function fmtTime12(hhmm) {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr), m = Number(mStr);
  const ap = h >= 12 ? 'PM' : 'AM';
  let hh = h % 12; if (hh === 0) hh = 12;
  return `${hh}:${pad2(m)} ${ap}`;
}

export function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function dateOffset(s, deltaDays) {
  const p = parseYMD(s);
  const d = new Date(p.y, p.m - 1, p.d);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

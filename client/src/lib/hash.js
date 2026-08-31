// Ported from Workout-Book.html's hash/ui-state section (docs/legacy/Workout-Book.html:601-620).
import { pad2, parseYMD, todayStr } from './dateUtils.js';

export function readUiFromHash(state) {
  const h = location.hash.replace(/^#/, '');
  const params = new URLSearchParams(h);
  const u = params.get('u'), m = params.get('m'), d = params.get('d');
  const today = todayStr();

  const ui = { currentUserId: null, year: 0, month: 0, selectedDate: null, modal: null };
  ui.currentUserId = (u && state.users.some((x) => x.id === u))
    ? u
    : (state.users.length === 1 ? state.users[0].id : null);

  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [yy, mm] = m.split('-');
    ui.year = Number(yy);
    ui.month = Number(mm);
  } else {
    const p = parseYMD(today);
    ui.year = p.y;
    ui.month = p.m;
  }

  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && ui.currentUserId) {
    ui.selectedDate = d;
    ui.modal = { type: 'dayDetail', date: d };
  }
  return ui;
}

export function writeUiToHash(ui) {
  const params = new URLSearchParams();
  if (ui.currentUserId) params.set('u', ui.currentUserId);
  params.set('m', `${ui.year}-${pad2(ui.month)}`);
  if (ui.selectedDate) params.set('d', ui.selectedDate);
  history.replaceState(null, '', '#' + params.toString());
}

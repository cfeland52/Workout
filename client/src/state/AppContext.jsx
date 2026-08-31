import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { readUiFromHash, writeUiToHash } from '../lib/hash.js';
import { addMonths, parseYMD, todayStr } from '../lib/dateUtils.js';

const AppContext = createContext(null);

const initialUi = { currentUserId: null, year: 0, month: 0, selectedDate: null, modal: null };

export function AppProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ui, setUiState] = useState(initialUi);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const hashInitialized = useRef(false);

  const refresh = useCallback(async () => {
    const next = await api.getState();
    setData(next);
    return next;
  }, []);

  useEffect(() => {
    refresh()
      .then((next) => {
        setUiState(readUiFromHash(next));
        hashInitialized.current = true;
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!hashInitialized.current) return;
    writeUiToHash(ui);
  }, [ui.currentUserId, ui.year, ui.month, ui.selectedDate]);

  const setUi = useCallback((patch) => {
    setUiState((prev) => (typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }));
  }, []);

  const selectUser = useCallback((userId) => setUi({ currentUserId: userId, modal: null }), [setUi]);
  const switchUser = useCallback(() => setUi({ currentUserId: null, selectedDate: null, modal: null }), [setUi]);

  const prevMonth = useCallback(() => setUi((prev) => {
    const r = addMonths(prev.year, prev.month, -1);
    return { ...prev, year: r.y, month: r.m };
  }), [setUi]);
  const nextMonth = useCallback(() => setUi((prev) => {
    const r = addMonths(prev.year, prev.month, 1);
    return { ...prev, year: r.y, month: r.m };
  }), [setUi]);
  const goToday = useCallback(() => {
    const p = parseYMD(todayStr());
    setUi({ year: p.y, month: p.m });
  }, [setUi]);
  const openDay = useCallback((date) => setUi({ selectedDate: date, modal: { type: 'dayDetail', date } }), [setUi]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const closeModal = useCallback(() => setUi({ modal: null }), [setUi]);
  const openModal = useCallback((modal) => setUi({ modal }), [setUi]);

  const value = {
    data, loading, error, refresh,
    ui, setUi, selectUser, switchUser, prevMonth, nextMonth, goToday, openDay,
    closeModal, openModal,
    toast, showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

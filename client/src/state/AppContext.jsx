import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, NetworkError } from '../api/client.js';
import { readUiFromHash, writeUiToHash } from '../lib/hash.js';
import { addMonths, parseYMD, todayStr } from '../lib/dateUtils.js';
import { loadCachedState, saveCachedState, loadOutbox, saveOutbox } from '../lib/offlineCache.js';
import { loadInProgress } from '../lib/draftCache.js';
import { applyLocal, sendRemote } from './operations.js';

// If the workout builder was left open when the tab got backgrounded/killed
// (see components/modals/WorkoutBuilder), drop the user right back into it
// on reload rather than the calendar, so "resume where you left off" doesn't
// require them to notice and re-navigate there themselves.
function resumeInProgress(ui) {
  const saved = loadInProgress();
  if (!saved) return ui;
  return { ...ui, currentUserId: saved.userId || ui.currentUserId, modal: saved.modal };
}

const AppContext = createContext(null);

const initialUi = { currentUserId: null, year: 0, month: 0, selectedDate: null, modal: null };

export function AppProvider({ children }) {
  const [data, setData] = useState(() => loadCachedState());
  const dataRef = useRef(data);
  dataRef.current = data;

  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [ui, setUiState] = useState(initialUi);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const hashInitialized = useRef(false);

  const [outbox, setOutboxState] = useState(() => loadOutbox());
  const outboxRef = useRef(outbox);
  outboxRef.current = outbox;
  const [online, setOnline] = useState(navigator.onLine);
  const [flushing, setFlushing] = useState(false);

  const setOutbox = useCallback((next) => {
    outboxRef.current = next;
    setOutboxState(next);
    saveOutbox(next);
  }, []);

  const setDataAndCache = useCallback((next) => {
    dataRef.current = next;
    setData(next);
    saveCachedState(next);
  }, []);

  // A full refresh from the server would clobber any optimistic changes
  // still sitting in the outbox, so it's only safe once that's empty.
  const refresh = useCallback(async () => {
    const next = await api.getState();
    setDataAndCache(next);
    return next;
  }, [setDataAndCache]);

  // A ref-based lock, not the `flushing` state: state updates are async, so
  // two calls arriving back-to-back (the online event firing right as the
  // mount-time attempt is still in flight, say) could both pass a state
  // check before either commits. The ref updates synchronously.
  const flushingRef = useRef(false);

  const flushOutbox = useCallback(async () => {
    if (flushingRef.current || !outboxRef.current.length) return;
    flushingRef.current = true;
    setFlushing(true);
    try {
      while (outboxRef.current.length) {
        const op = outboxRef.current[0];
        try {
          await sendRemote(op);
        } catch (err) {
          if (err instanceof NetworkError) return; // still offline — stop, try again later
          // A real server-side rejection (not a connectivity problem): drop it
          // rather than retrying forever, since it would just fail the same way.
          showToastRef.current?.(`Couldn't sync a change — ${err.message}`);
        }
        setOutbox(outboxRef.current.slice(1));
      }
      // Queue's drained — pick up anything that changed on the server meanwhile.
      await refresh();
    } finally {
      flushingRef.current = false;
      setFlushing(false);
    }
  }, [refresh, setOutbox]);

  const showToastRef = useRef(null);

  useEffect(() => {
    // If we already have a cache (from the useState initializer above),
    // the app is usable immediately — init the UI from it before even
    // trying the network, so offline-first really means offline-first.
    if (dataRef.current) {
      setUiState(resumeInProgress(readUiFromHash(dataRef.current)));
      hashInitialized.current = true;
    }
    refresh()
      .then((next) => {
        if (hashInitialized.current) return;
        setUiState(resumeInProgress(readUiFromHash(next)));
        hashInitialized.current = true;
      })
      .catch((err) => {
        if (!(err instanceof NetworkError)) { setError(err); return; }
        // No cache and offline on first-ever load: genuinely nothing to show.
        if (!dataRef.current) setError(err);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function goOnline() { setOnline(true); flushOutbox(); }
    function goOffline() { setOnline(false); }
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [flushOutbox]);

  // Belt-and-suspenders retry: 'online' doesn't always fire reliably (flaky
  // Wi-Fi, captive portals), and there may be leftover ops from a previous
  // session — so try once right away, then poll gently while queued.
  useEffect(() => {
    if (!outbox.length) return;
    flushOutbox();
    const t = setInterval(() => flushOutbox(), 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outbox.length]);

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
  showToastRef.current = showToast;

  const closeModal = useCallback(() => setUi({ modal: null }), [setUi]);
  const openModal = useCallback((modal) => setUi({ modal }), [setUi]);

  // The one path every mutation goes through: apply it locally right away
  // (works with or without a connection), try to send it, and if that fails
  // for connectivity reasons, queue it for later instead of losing it.
  const submit = useCallback(async (op) => {
    setDataAndCache(applyLocal(dataRef.current, op));
    if (outboxRef.current.length) {
      // Something's already queued ahead of this — append rather than
      // racing a direct send past it, so the server sees changes in order.
      setOutbox([...outboxRef.current, op]);
      return;
    }
    try {
      await sendRemote(op);
    } catch (err) {
      if (!(err instanceof NetworkError)) throw err;
      setOutbox([...outboxRef.current, op]);
      showToast("Saved on this device — will sync once you're back online.");
    }
  }, [setDataAndCache, setOutbox, showToast]);

  const value = {
    data, loading, error, refresh,
    ui, setUi, selectUser, switchUser, prevMonth, nextMonth, goToday, openDay,
    closeModal, openModal,
    toast, showToast,
    submit, online, pendingCount: outbox.length, flushing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

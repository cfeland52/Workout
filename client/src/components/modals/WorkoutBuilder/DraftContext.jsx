import { createContext, useCallback, useContext } from 'react';

const DraftContext = createContext(null);

export function DraftProvider({ draft, setDraft, children }) {
  // Mirrors the original app's imperative "mutate DRAFT, then render()" style:
  // clone the draft, let the mutator mutate the clone directly, commit it.
  const update = useCallback((mutator) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      mutator(next);
      return next;
    });
  }, [setDraft]);

  return <DraftContext.Provider value={{ draft, update }}>{children}</DraftContext.Provider>;
}

export function useDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useDraft must be used within DraftProvider');
  return ctx;
}

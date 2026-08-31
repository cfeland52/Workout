import { useDraft } from './DraftContext.jsx';
import { CATEGORIES } from '../../../lib/constants.js';

export default function StepSetup() {
  const { draft, update } = useDraft();

  return (
    <>
      <div className="field-row">
        <div className="field">
          <label htmlFor="d-date">Date</label>
          <input id="d-date" type="date" defaultValue={draft.date} />
        </div>
        <div className="field">
          <label htmlFor="d-start">Start time</label>
          <input id="d-start" type="time" defaultValue={draft.startTime || ''} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="d-bw">Body weight (optional)</label>
        <input id="d-bw" type="text" inputMode="decimal" placeholder="e.g. 251" defaultValue={draft.bodyWeight} />
      </div>
      <div className="field">
        <label>Category</label>
        <div className="choice-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={'choice-card' + (draft.category === c ? ' selected' : '')}
              onClick={() => update((d) => { d.category = c; })}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

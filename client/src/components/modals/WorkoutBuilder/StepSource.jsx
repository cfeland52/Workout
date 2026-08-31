import { useDraft } from './DraftContext.jsx';
import { fmtDateLong } from '../../../lib/dateUtils.js';

export default function StepSource({ onScratch, onTemplate }) {
  const { draft } = useDraft();
  return (
    <>
      <div className="choice-grid">
        <button className="choice-card" onClick={onScratch}>Start From Scratch</button>
        <button className="choice-card" onClick={onTemplate}>Use Previous Workout</button>
      </div>
      <p className="helptext">Category: {draft.category} &middot; {fmtDateLong(draft.date)}</p>
    </>
  );
}

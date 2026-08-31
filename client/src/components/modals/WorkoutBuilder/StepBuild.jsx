import { useApp } from '../../../state/AppContext.jsx';
import { useDraft } from './DraftContext.jsx';
import { CATEGORIES } from '../../../lib/constants.js';
import { allExerciseNames } from '../../../lib/selectors.js';
import { emptySlot } from '../../../lib/draft.js';
import BlockEditor from './BlockEditor.jsx';
import CardioEditor from './CardioEditor.jsx';

export default function StepBuild() {
  const { data } = useApp();
  const { draft, update } = useDraft();

  return (
    <>
      <div className="field-row">
        <div className="field">
          <label htmlFor="d-bw">Body weight (optional)</label>
          <input
            id="d-bw" type="text" inputMode="decimal" placeholder="e.g. 251"
            value={draft.bodyWeight}
            onChange={(e) => update((d) => { d.bodyWeight = e.target.value; })}
          />
        </div>
        <div className="field">
          <label htmlFor="d-cat">Category</label>
          <select id="d-cat" value={draft.category} onChange={(e) => update((d) => { d.category = e.target.value; })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="section-label" style={{ marginBottom: 8 }}>Exercises</div>
        {draft.blocks.map((b, bi) => <BlockEditor key={bi} block={b} bi={bi} />)}
        <div className="row-actions" style={{ marginTop: 6 }}>
          <button className="link-btn" onClick={() => update((d) => { d.blocks.push({ type: 'standard', exercises: [emptySlot()] }); })}>+ Add Exercise</button>
          <button className="link-btn" onClick={() => update((d) => { d.blocks.push({ type: 'superset', exercises: [emptySlot(), emptySlot()] }); })}>+ Add Superset</button>
        </div>
      </div>

      <hr className="divider" />

      <div>
        <div className="section-label" style={{ marginBottom: 8 }}>Cardio</div>
        {draft.cardio.map((c, ci) => <CardioEditor key={ci} c={c} ci={ci} />)}
        <button className="link-btn" onClick={() => update((d) => { d.cardio.push({ machine: 'Treadmill', time: '', speed: '', incline: '' }); })}>+ Add Cardio Entry</button>
      </div>

      <datalist id="exercise-options">
        {allExerciseNames(data).map((n) => <option key={n} value={n} />)}
      </datalist>
    </>
  );
}

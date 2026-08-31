import { useApp } from '../../../state/AppContext.jsx';
import { useDraft } from './DraftContext.jsx';
import { MUSCLE_GROUPS } from '../../../lib/constants.js';
import { exerciseGroupOf } from '../../../lib/selectors.js';
import { emptySet } from '../../../lib/draft.js';
import SetEditor from './SetEditor.jsx';

export default function ExerciseSlot({ ex, bi, si, removable }) {
  const { data } = useApp();
  const { update } = useDraft();
  const group = ex.muscleGroup || exerciseGroupOf(data, ex.name) || 'Chest';
  const groupOptions = [
    ...MUSCLE_GROUPS,
    ...Object.keys(data.exercises).filter((g) => !MUSCLE_GROUPS.includes(g) && g !== 'Cardio'),
  ];

  return (
    <div className="exercise-slot">
      <div className="exercise-slot-head">
        <input
          type="text" className="exercise-name-input" list="exercise-options" placeholder="Exercise name"
          value={ex.name}
          onChange={(e) => update((d) => {
            const slot = d.blocks[bi].exercises[si];
            slot.name = e.target.value;
            const grp = exerciseGroupOf(data, e.target.value.trim());
            if (grp) slot.muscleGroup = grp;
          })}
        />
        <select
          style={{ width: 120 }}
          value={group}
          onChange={(e) => update((d) => { d.blocks[bi].exercises[si].muscleGroup = e.target.value; })}
        >
          {groupOptions.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {removable && (
          <button className="icon-btn" onClick={() => update((d) => {
            const blk = d.blocks[bi];
            blk.exercises.splice(si, 1);
            if (blk.exercises.length <= 1) blk.type = 'standard';
            if (blk.exercises.length === 0) d.blocks.splice(bi, 1);
          })}>
            &#10005;
          </button>
        )}
      </div>
      {ex.sets.map((s, wi) => <SetEditor key={wi} set={s} bi={bi} si={si} wi={wi} />)}
      <div className="row-actions">
        <button className="link-btn" onClick={() => update((d) => { d.blocks[bi].exercises[si].sets.push(emptySet()); })}>+ Add Set</button>
      </div>
    </div>
  );
}

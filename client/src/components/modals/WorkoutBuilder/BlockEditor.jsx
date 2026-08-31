import { useDraft } from './DraftContext.jsx';
import { emptySlot } from '../../../lib/draft.js';
import ExerciseSlot from './ExerciseSlot.jsx';

export default function BlockEditor({ block, bi }) {
  const { update } = useDraft();
  return (
    <div className="block-card" style={{ marginBottom: 12 }}>
      <div className="block-card-head">
        {block.type === 'superset' ? <span className="block-type-badge">Superset</span> : <span className="block-type-badge standard">Standard</span>}
        <span className="row-actions">
          {block.type === 'superset' && block.exercises.length < 3 && (
            <button className="link-btn" onClick={() => update((d) => { d.blocks[bi].exercises.push(emptySlot()); })}>+ exercise</button>
          )}
          <button className="link-btn" style={{ color: 'var(--danger)' }} onClick={() => update((d) => { d.blocks.splice(bi, 1); })}>remove</button>
        </span>
      </div>
      {block.exercises.map((ex, si) => (
        <ExerciseSlot key={si} ex={ex} bi={bi} si={si} removable={block.exercises.length > 1} />
      ))}
    </div>
  );
}

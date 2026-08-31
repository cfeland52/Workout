import { useDraft } from './DraftContext.jsx';
import { emptySet } from '../../../lib/draft.js';

export default function SetEditor({ set, bi, si, wi }) {
  const { update } = useDraft();

  if (!set.isDrop) {
    const staleCls = set.stale ? ' stale' : '';
    return (
      <div className="set-row">
        <span className="set-idx">{wi + 1}</span>
        <input
          type="text" inputMode="decimal" className={staleCls.trim()} placeholder="reps"
          value={set.reps}
          onChange={(e) => update((d) => { d.blocks[bi].exercises[si].sets[wi].reps = e.target.value; d.blocks[bi].exercises[si].sets[wi].stale = false; })}
        />
        <input
          type="text" inputMode="decimal" className={staleCls.trim()} placeholder="weight"
          value={set.weight}
          onChange={(e) => update((d) => { d.blocks[bi].exercises[si].sets[wi].weight = e.target.value; d.blocks[bi].exercises[si].sets[wi].stale = false; })}
        />
        <button
          className="link-btn" title="Make drop set"
          onClick={() => update((d) => {
            const s = d.blocks[bi].exercises[si].sets[wi];
            d.blocks[bi].exercises[si].sets[wi] = { isDrop: true, stages: [{ reps: s.reps, weight: s.weight }, emptySet()] };
          })}
        >
          &#9660;
        </button>
        <button
          className="icon-btn set-row-remove"
          onClick={() => update((d) => { d.blocks[bi].exercises[si].sets.splice(wi, 1); })}
        >
          &#10005;
        </button>
      </div>
    );
  }

  return (
    <div className="set-block">
      <div className="set-block-head">
        <span className="tiny-label">Set {wi + 1} &middot; Drop Set</span>
        <span className="row-actions">
          <button className="link-btn" onClick={() => update((d) => { d.blocks[bi].exercises[si].sets[wi].stages.push(emptySet()); })}>+ stage</button>
          <button
            className="link-btn"
            onClick={() => update((d) => {
              const s = d.blocks[bi].exercises[si].sets[wi];
              const first = s.stages[0];
              d.blocks[bi].exercises[si].sets[wi] = { reps: first.reps, weight: first.weight };
            })}
          >
            undo
          </button>
          <button className="icon-btn" onClick={() => update((d) => { d.blocks[bi].exercises[si].sets.splice(wi, 1); })}>&#10005;</button>
        </span>
      </div>
      {set.stages.map((st, sti) => {
        const staleCls = st.stale ? ' stale' : '';
        return (
          <div className="stage-row" key={sti}>
            <input
              type="text" inputMode="decimal" className={staleCls.trim()} placeholder="reps"
              value={st.reps}
              onChange={(e) => update((d) => { const stg = d.blocks[bi].exercises[si].sets[wi].stages[sti]; stg.reps = e.target.value; stg.stale = false; })}
            />
            <input
              type="text" inputMode="decimal" className={staleCls.trim()} placeholder="weight"
              value={st.weight}
              onChange={(e) => update((d) => { const stg = d.blocks[bi].exercises[si].sets[wi].stages[sti]; stg.weight = e.target.value; stg.stale = false; })}
            />
            {set.stages.length > 2 ? (
              <button className="icon-btn" onClick={() => update((d) => {
                const stages = d.blocks[bi].exercises[si].sets[wi].stages;
                if (stages.length > 2) stages.splice(sti, 1);
              })}>
                &#10005;
              </button>
            ) : <span style={{ width: 34 }} />}
          </div>
        );
      })}
    </div>
  );
}

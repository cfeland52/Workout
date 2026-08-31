import { useApp } from '../../../state/AppContext.jsx';
import { useDraft } from './DraftContext.jsx';
import { fmtDateLong } from '../../../lib/dateUtils.js';
import { recentTemplates } from '../../../lib/selectors.js';

export default function StepTemplate({ onScratch, onPick }) {
  const { data, ui } = useApp();
  const { draft } = useDraft();
  const templates = recentTemplates(data, ui.currentUserId, draft.category, null);

  if (!templates.length) {
    return (
      <div className="empty-state">
        No previous {draft.category} workouts yet.<br />
        <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={onScratch}>Start From Scratch Instead</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {templates.map((t) => {
        const names = (t.blocks || []).map((b) => b.exercises.map((e) => e.name).join(' / ')).join(', ');
        return (
          <button key={t.id} className="template-card" style={{ width: '100%', textAlign: 'left' }} onClick={() => onPick(t.id)}>
            <span className="tc-date">{fmtDateLong(t.date)}</span>
            <span className="tc-list">{names || 'No exercises recorded'}</span>
          </button>
        );
      })}
    </div>
  );
}

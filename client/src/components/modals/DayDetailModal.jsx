import { useApp } from '../../state/AppContext.jsx';
import { fmtDateLong, fmtTime12 } from '../../lib/dateUtils.js';
import { eventsOnDate, standaloneBodyWeightFor, workoutsOnDate } from '../../lib/selectors.js';
import { cardioLabel, setLabel } from '../../lib/workoutView.js';
import ModalShell from './ModalShell.jsx';

function BodyWeightRow({ date, workoutBW, standaloneBW }) {
  const { openModal } = useApp();
  if (workoutBW) {
    return (
      <div className="bw-row">
        <span className="bw-label">Body weight</span>
        <span className="bw-value">{workoutBW.bodyWeight} lb</span>
        <span className="helptext">from that day&rsquo;s workout</span>
      </div>
    );
  }
  if (standaloneBW) {
    return (
      <div className="bw-row">
        <span className="bw-label">Body weight</span>
        <span className="bw-value">{standaloneBW.weight} lb</span>
        <span className="row-actions">
          <button className="link-btn" onClick={() => openModal({ type: 'bodyWeightForm', date, editingId: standaloneBW.id })}>Edit</button>
          <button className="link-btn" style={{ color: 'var(--danger)' }} onClick={() => openModal({ type: 'confirmDelete', kind: 'deleteBodyWeight', id: standaloneBW.id, returnDate: date, message: 'Delete this body weight entry? This cannot be undone.', confirmLabel: 'Delete Entry' })}>Delete</button>
        </span>
      </div>
    );
  }
  return (
    <div className="bw-row">
      <span className="bw-label">Body weight</span>
      <button className="link-btn" onClick={() => openModal({ type: 'bodyWeightForm', date, editingId: null })}>+ Log body weight</button>
    </div>
  );
}

function ExerciseView({ ex }) {
  if (!ex.sets || !ex.sets.length) {
    return (
      <>
        <div className="exercise-view-name">{ex.name}</div>
        <div className="helptext">No sets recorded</div>
      </>
    );
  }
  return (
    <>
      <div className="exercise-view-name">{ex.name}</div>
      <table className="sets-table">
        <tbody>
          {ex.sets.map((s, i) => (
            <tr key={i}><td>{i + 1}</td><td>{setLabel(s)}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function BlockView({ block }) {
  return (
    <div className="exercise-block-view">
      {block.type === 'superset' && <div className="superset-tag">Superset</div>}
      {block.exercises.map((ex, i) => (
        <div key={i}>
          {i > 0 && <div style={{ height: 8 }} />}
          <ExerciseView ex={ex} />
        </div>
      ))}
    </div>
  );
}

function CardioView({ c }) {
  return (
    <div className="cardio-card">
      <div className="cc-title">{c.machine}</div>
      <div className="helptext">{cardioLabel(c)}</div>
    </div>
  );
}

function WorkoutSummary({ w }) {
  const { openModal } = useApp();
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="workout-summary-head">
        <span className="category-badge">{w.notes || w.category}</span>
        <span className="row-actions">
          <button className="link-btn" onClick={() => openModal({ type: 'workoutBuilder', editingId: w.id })}>Edit</button>
          <button className="link-btn" style={{ color: 'var(--danger)' }} onClick={() => openModal({ type: 'confirmDelete', kind: 'deleteWorkout', id: w.id, returnDate: w.date, message: 'Delete this workout? This cannot be undone.', confirmLabel: 'Delete Workout' })}>Delete</button>
        </span>
      </div>
      <div className="meta-strip">
        {w.bodyWeight && <span>BW <strong>{w.bodyWeight}</strong></span>}
        {w.startTime && <span>Start <strong>{fmtTime12(w.startTime)}</strong></span>}
        {w.endTime && <span>End <strong>{fmtTime12(w.endTime)}</strong></span>}
      </div>
      {(w.blocks || []).map((b, i) => <BlockView key={i} block={b} />)}
      {(w.cardio || []).map((c, i) => <CardioView key={i} c={c} />)}
    </div>
  );
}

function EventSummary({ ev }) {
  const { openModal } = useApp();
  return (
    <div style={{ marginBottom: 14, borderLeft: '3px solid var(--info)', paddingLeft: 10 }}>
      <div className="workout-summary-head">
        <strong>{ev.title}</strong>
        <span className="row-actions">
          <button className="link-btn" onClick={() => openModal({ type: 'eventForm', editingId: ev.id })}>Edit</button>
          <button className="link-btn" style={{ color: 'var(--danger)' }} onClick={() => openModal({ type: 'confirmDelete', kind: 'deleteEvent', id: ev.id, returnDate: ev.date, message: 'Delete this event? This cannot be undone.', confirmLabel: 'Delete Event' })}>Delete</button>
        </span>
      </div>
      {ev.notes && <div className="helptext">{ev.notes}</div>}
    </div>
  );
}

export default function DayDetailModal({ date }) {
  const { data, ui, openModal } = useApp();
  const userId = ui.currentUserId;
  const workouts = workoutsOnDate(data, userId, date);
  const events = eventsOnDate(data, userId, date);
  const workoutBW = workouts.find((w) => w.bodyWeight !== null && w.bodyWeight !== undefined && w.bodyWeight !== '');
  const standaloneBW = standaloneBodyWeightFor(data, userId, date);

  return (
    <ModalShell title={fmtDateLong(date)}>
      <BodyWeightRow date={date} workoutBW={workoutBW} standaloneBW={standaloneBW} />
      {!workouts.length && !events.length && (
        <div className="empty-state">
          <span style={{ fontSize: 26 }}>📋</span>
          <div>No workout or event logged this day yet.</div>
        </div>
      )}
      {workouts.map((w) => <WorkoutSummary key={w.id} w={w} />)}
      {events.map((ev) => <EventSummary key={ev.id} ev={ev} />)}
      <div className="row-actions" style={{ marginTop: 6 }}>
        <button className="btn btn-accent btn-sm" onClick={() => openModal({ type: 'workoutBuilder', date })}>+ Log Workout</button>
        <button className="btn btn-sm" onClick={() => openModal({ type: 'eventForm', date, editingId: null })}>+ Special Event</button>
      </div>
    </ModalShell>
  );
}

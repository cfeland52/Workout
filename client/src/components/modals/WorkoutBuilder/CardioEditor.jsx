import { useDraft } from './DraftContext.jsx';
import { CARDIO_MACHINES } from '../../../lib/constants.js';

function Field({ c, ci, field, label, placeholder }) {
  const { update } = useDraft();
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="text" placeholder={placeholder || ''}
        value={c[field] || ''}
        onChange={(e) => update((d) => { d.cardio[ci][field] = e.target.value; })}
      />
    </div>
  );
}

function CardioFields({ c, ci }) {
  const { update } = useDraft();
  if (c.machine === 'Treadmill') {
    return (
      <div className="field-row">
        <Field c={c} ci={ci} field="time" label="Time" placeholder="e.g. 25 min" />
        <Field c={c} ci={ci} field="speed" label="Speed" placeholder="e.g. 3 mph" />
        <Field c={c} ci={ci} field="incline" label="Incline" placeholder="e.g. 12" />
      </div>
    );
  }
  if (c.machine === 'Bike') {
    return (
      <div className="field-row">
        <Field c={c} ci={ci} field="time" label="Time" placeholder="e.g. 20 min" />
        <Field c={c} ci={ci} field="speed" label="Speed" placeholder="e.g. 15 mph" />
      </div>
    );
  }
  if (c.machine === 'Row Machine') {
    return (
      <div className="field-row">
        <Field c={c} ci={ci} field="totalDistance" label="Total distance" placeholder="e.g. 2000m" />
        <Field c={c} ci={ci} field="time" label="Time" placeholder="e.g. 8:30" />
        <Field c={c} ci={ci} field="avgSplit" label="Avg /500m split" placeholder="e.g. 1:52" />
      </div>
    );
  }
  return (
    <div className="field">
      <label>Details</label>
      <textarea
        value={c.description || ''}
        onChange={(e) => update((d) => { d.cardio[ci].description = e.target.value; })}
      />
    </div>
  );
}

function freshCardio(machine) {
  if (machine === 'Treadmill') return { machine, time: '', speed: '', incline: '' };
  if (machine === 'Bike') return { machine, time: '', speed: '' };
  if (machine === 'Row Machine') return { machine, totalDistance: '', time: '', avgSplit: '' };
  return { machine, description: '' };
}

export default function CardioEditor({ c, ci }) {
  const { update } = useDraft();
  return (
    <div className="block-card" style={{ marginBottom: 12 }}>
      <div className="block-card-head">
        <select
          value={c.machine}
          onChange={(e) => update((d) => { d.cardio[ci] = freshCardio(e.target.value); })}
        >
          {CARDIO_MACHINES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="icon-btn" onClick={() => update((d) => { d.cardio.splice(ci, 1); })}>&#10005;</button>
      </div>
      <div className="exercise-slot">
        <CardioFields c={c} ci={ci} />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { MUSCLE_GROUPS } from '../../lib/constants.js';
import ModalShell from './ModalShell.jsx';

export default function ExerciseLibraryModal() {
  const { data, submit, closeModal, openModal, showToast } = useApp();
  const groups = [
    ...MUSCLE_GROUPS,
    ...Object.keys(data.exercises).filter((g) => !MUSCLE_GROUPS.includes(g) && g !== 'Cardio'),
  ];
  const [group, setGroup] = useState(groups[0]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await submit({ entity: 'exercise', action: 'add', muscleGroup: group, name: trimmed });
      setName('');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Exercise Library" footer={<button className="btn" onClick={closeModal}>Done</button>}>
      <div className="field">
        <label>Add exercise</label>
        <div className="field-row">
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            {groups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="text" placeholder="Exercise name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button className="btn btn-accent btn-sm" style={{ marginTop: 8 }} disabled={!name.trim() || saving} onClick={handleAdd}>Add</button>
      </div>
      <hr className="divider" />
      {groups.map((g) => {
        const list = data.exercises[g] || [];
        if (!list.length) return null;
        return (
          <div className="exercise-manage-group" key={g}>
            <h4>{g}</h4>
            <div className="exercise-chip-list">
              {list.map((n) => (
                <button
                  key={n}
                  className="exercise-chip"
                  title="Remove"
                  onClick={() => openModal({ type: 'confirmDelete', kind: 'removeExercise', group: g, name: n, message: `Remove "${n}" from the exercise library?`, confirmLabel: 'Remove' })}
                >
                  {n} ×
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </ModalShell>
  );
}

import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { api } from '../../api/client.js';
import ModalShell from './ModalShell.jsx';

// spec: { kind: 'deleteWorkout'|'deleteEvent'|'deleteBodyWeight'|'removeExercise',
//         id, group, name, returnDate, message, confirmLabel }
export default function ConfirmDeleteModal({ spec }) {
  const { refresh, closeModal, openModal, showToast } = useApp();
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      if (spec.kind === 'deleteWorkout') await api.deleteWorkout(spec.id);
      else if (spec.kind === 'deleteEvent') await api.deleteEvent(spec.id);
      else if (spec.kind === 'deleteBodyWeight') await api.deleteBodyWeight(spec.id);
      else if (spec.kind === 'removeExercise') await api.removeExercise(spec.group, spec.name);

      await refresh();
      if (spec.kind === 'removeExercise') openModal({ type: 'exerciseLibrary' });
      else if (spec.returnDate) openModal({ type: 'dayDetail', date: spec.returnDate });
      else closeModal();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell
      title="Please confirm"
      footer={
        <>
          <button className="btn" onClick={closeModal}>Cancel</button>
          <button className="btn btn-danger" disabled={busy} onClick={handleConfirm}>
            {spec.confirmLabel || 'Delete'}
          </button>
        </>
      }
    >
      <p>{spec.message}</p>
    </ModalShell>
  );
}

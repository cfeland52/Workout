import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import ModalShell from './ModalShell.jsx';

const ENTITY_BY_KIND = {
  deleteWorkout: 'workout',
  deleteEvent: 'event',
  deleteBodyWeight: 'bodyWeight',
};

// spec: { kind: 'deleteWorkout'|'deleteEvent'|'deleteBodyWeight'|'removeExercise',
//         id, group, name, returnDate, message, confirmLabel }
export default function ConfirmDeleteModal({ spec }) {
  const { submit, closeModal, openModal, showToast } = useApp();
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      if (spec.kind === 'removeExercise') {
        await submit({ entity: 'exercise', action: 'remove', muscleGroup: spec.group, name: spec.name });
      } else {
        await submit({ entity: ENTITY_BY_KIND[spec.kind], action: 'delete', id: spec.id });
      }

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

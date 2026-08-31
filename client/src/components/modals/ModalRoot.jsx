import { useApp } from '../../state/AppContext.jsx';
import AddUserModal from './AddUserModal.jsx';
import DayDetailModal from './DayDetailModal.jsx';
import EventFormModal from './EventFormModal.jsx';
import BodyWeightFormModal from './BodyWeightFormModal.jsx';
import ConfirmDeleteModal from './ConfirmDeleteModal.jsx';
import ExerciseLibraryModal from './ExerciseLibraryModal.jsx';
import BackupModal from './BackupModal.jsx';
import WorkoutBuilderModal from './WorkoutBuilder/WorkoutBuilderModal.jsx';

export default function ModalRoot() {
  const { ui } = useApp();
  const modal = ui.modal;
  if (!modal) return null;

  switch (modal.type) {
    case 'addUser': return <AddUserModal />;
    case 'dayDetail': return <DayDetailModal date={modal.date} />;
    case 'eventForm': return <EventFormModal date={modal.date} editingId={modal.editingId} />;
    case 'bodyWeightForm': return <BodyWeightFormModal date={modal.date} editingId={modal.editingId} />;
    case 'confirmDelete': return <ConfirmDeleteModal spec={modal} />;
    case 'exerciseLibrary': return <ExerciseLibraryModal />;
    case 'backup': return <BackupModal />;
    case 'workoutBuilder': return <WorkoutBuilderModal />;
    default: return null;
  }
}

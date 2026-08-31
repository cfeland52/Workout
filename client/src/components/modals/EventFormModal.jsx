import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { api } from '../../api/client.js';
import ModalShell from './ModalShell.jsx';

export default function EventFormModal({ date: initialDate, editingId }) {
  const { data, ui, refresh, openModal, closeModal, showToast } = useApp();
  const existing = editingId ? data.events.find((e) => e.id === editingId) : null;

  const [date, setDate] = useState(existing ? existing.date : initialDate);
  const [title, setTitle] = useState(existing ? existing.title : '');
  const [notes, setNotes] = useState(existing ? existing.notes : '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!date || !trimmedTitle) { showToast('Add a date and title.'); return; }
    setSaving(true);
    try {
      if (existing) {
        await api.updateEvent(existing.id, { ...existing, date, title: trimmedTitle, notes: notes.trim() });
      } else {
        await api.createEvent({ userId: ui.currentUserId, date, title: trimmedTitle, notes: notes.trim() });
      }
      await refresh();
      openModal({ type: 'dayDetail', date });
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={existing ? 'Edit Event' : 'Log Special Event'}
      footer={
        <>
          <button className="btn" onClick={closeModal}>Cancel</button>
          <button className="btn btn-accent" disabled={saving} onClick={handleSave}>Save Event</button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="ef-date">Date</label>
        <input id="ef-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="ef-title">Title</label>
        <input id="ef-title" type="text" placeholder="e.g. Stillwater 500 Ride" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="ef-notes">Notes (optional)</label>
        <textarea id="ef-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </ModalShell>
  );
}

import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { api } from '../../api/client.js';
import ModalShell from './ModalShell.jsx';

export default function BodyWeightFormModal({ date: initialDate, editingId }) {
  const { data, ui, refresh, openModal, closeModal, showToast } = useApp();
  const existing = editingId ? (data.bodyWeights || []).find((b) => b.id === editingId) : null;

  const [date, setDate] = useState(existing ? existing.date : initialDate);
  const [weight, setWeight] = useState(existing ? String(existing.weight) : '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedWeight = weight.trim();
    if (!date || !trimmedWeight || Number.isNaN(Number(trimmedWeight))) {
      showToast('Add a date and a valid weight.');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await api.updateBodyWeight(existing.id, { ...existing, date, weight: Number(trimmedWeight) });
      } else {
        // Match the original app's upsert-by-date behavior: a new entry for a
        // date that already has one overwrites it instead of duplicating.
        const clash = (data.bodyWeights || []).find((b) => b.userId === ui.currentUserId && b.date === date);
        if (clash) {
          await api.updateBodyWeight(clash.id, { ...clash, weight: Number(trimmedWeight) });
        } else {
          await api.createBodyWeight({ userId: ui.currentUserId, date, weight: Number(trimmedWeight) });
        }
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
      title={existing ? 'Edit Body Weight' : 'Log Body Weight'}
      footer={
        <>
          <button className="btn" onClick={closeModal}>Cancel</button>
          <button className="btn btn-accent" disabled={saving} onClick={handleSave}>Save</button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="bw-date">Date</label>
        <input id="bw-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="bw-weight">Body weight (lb)</label>
        <input
          id="bw-weight"
          type="number"
          step="0.1"
          inputMode="decimal"
          placeholder="e.g. 264.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
    </ModalShell>
  );
}

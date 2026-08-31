import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { api } from '../../api/client.js';
import ModalShell from './ModalShell.jsx';

export default function AddUserModal() {
  const { refresh, selectUser, closeModal, showToast } = useApp();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const user = await api.createUser(trimmed);
      await refresh();
      selectUser(user.id);
      showToast(`Welcome, ${user.name}.`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title="Add lifter"
      footer={
        <>
          <button className="btn" onClick={closeModal}>Cancel</button>
          <button className="btn btn-accent" disabled={!name.trim() || saving} onClick={handleAdd}>
            {saving ? 'Adding…' : 'Add'}
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="new-user-name">Name</label>
        <input
          id="new-user-name"
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="e.g. Clay"
        />
      </div>
    </ModalShell>
  );
}

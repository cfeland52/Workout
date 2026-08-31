import { useRef, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { api, NetworkError } from '../../api/client.js';
import { todayStr } from '../../lib/dateUtils.js';
import ModalShell from './ModalShell.jsx';

function downloadJson(payload, showToast) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-book-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  showToast('Backup downloaded.');
}

async function importJsonText(text, { refresh, showToast, pendingCount }) {
  if (pendingCount) {
    showToast("You have changes still syncing — wait for that to finish before importing a backup.");
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    showToast("That doesn't look like a valid backup.");
    return;
  }
  const payload = parsed && parsed.state && parsed.app === 'workout-book' ? parsed : { app: 'workout-book', state: parsed };
  try {
    const result = await api.importBackup(payload);
    await refresh();
    showToast(`Backup merged — ${result.added} new, ${result.updated} updated.`);
  } catch (err) {
    showToast(err instanceof NetworkError ? "Import needs a connection to the server — try again once you're online." : err.message);
  }
}

export default function BackupModal() {
  const { data, refresh, closeModal, showToast, pendingCount } = useApp();
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef(null);

  function handleExport() {
    // Exports whatever this device currently has, including any changes not
    // yet synced to the server — so it works offline too.
    downloadJson({ app: 'workout-book', exportedAt: new Date().toISOString(), state: data }, showToast);
  }

  function handleFilePicked(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importJsonText(String(reader.result), { refresh, showToast, pendingCount });
    reader.onerror = () => showToast('Could not read that file.');
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleImportFromText() {
    const text = pasteText.trim();
    if (!text) { showToast('Paste your backup text first.'); return; }
    importJsonText(text, { refresh, showToast, pendingCount });
  }

  return (
    <ModalShell title="Backup &amp; Restore" footer={<button className="btn" onClick={closeModal}>Done</button>}>
      <p className="helptext" style={{ marginBottom: 14 }}>
        Workout Book saves data to the server running on your desktop, shared by every device that connects to it,
        and keeps a copy on this device so it still works offline. Export a backup periodically as an extra safety
        copy, and Import one to merge in data from an old backup file — imported entries are merged in, never overwritten.
      </p>
      <div className="row-actions" style={{ marginBottom: 14 }}>
        <button className="btn btn-accent" onClick={handleExport}>&#8595; Export Backup</button>
        <button className="btn" onClick={() => fileInputRef.current?.click()}>&#8593; Import from File</button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFilePicked} />
      </div>
      <hr className="divider" />
      <div className="field" style={{ marginTop: 12 }}>
        <label>Or paste backup text here</label>
        <textarea
          placeholder="Paste the text you copied from Export here"
          style={{ width: '100%', minHeight: 100, fontFamily: 'var(--font-mono)', fontSize: 12 }}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />
        <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={handleImportFromText}>Import from Text</button>
      </div>
    </ModalShell>
  );
}

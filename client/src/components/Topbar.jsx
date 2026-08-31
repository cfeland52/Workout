import { useApp } from '../state/AppContext.jsx';
import { initials } from '../lib/selectors.js';

// sync-pill CSS already had synced/local/saving states from the original app
// (which never had a real server to sync with) — repurposed here for the
// actual online/offline/pending-sync states this app now has.
function syncStatus({ online, pendingCount, flushing }) {
  if (flushing) return { cls: 'saving', label: 'Syncing…' };
  if (pendingCount) return { cls: 'local', label: `${pendingCount} pending sync` };
  if (!online) return { cls: 'local', label: 'Offline' };
  return { cls: 'synced', label: 'Synced' };
}

export default function Topbar() {
  const { data, ui, switchUser, openModal, online, pendingCount, flushing } = useApp();
  const user = data.users.find((u) => u.id === ui.currentUserId) || null;
  const sync = syncStatus({ online, pendingCount, flushing });

  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-mark">Workout <span className="accent">Book</span></span>
      </div>
      <div className="topbar-right">
        <span className={`sync-pill ${sync.cls}`}>
          <span className="sync-dot" />
          <span className="sync-label">{sync.label}</span>
        </span>
        <button className="icon-btn" title="Backup &amp; restore" onClick={() => openModal({ type: 'backup' })}>
          &#8593;&#8595;
        </button>
        {user && (
          <>
            <button className="icon-btn" title="Exercise library" onClick={() => openModal({ type: 'exerciseLibrary' })}>
              &#9776;
            </button>
            <button className="user-chip" onClick={switchUser}>
              <span className="user-avatar">{initials(user.name)}</span>
              <span className="user-name-label">{user.name}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

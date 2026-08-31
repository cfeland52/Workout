import { useApp } from '../state/AppContext.jsx';
import { initials } from '../lib/selectors.js';

export default function Topbar() {
  const { data, ui, switchUser, openModal } = useApp();
  const user = data.users.find((u) => u.id === ui.currentUserId) || null;

  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-mark">Workout <span className="accent">Book</span></span>
      </div>
      <div className="topbar-right">
        <span className="sync-pill local">
          <span className="sync-dot" />
          <span className="sync-label">On this device</span>
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

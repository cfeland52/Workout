import { useApp } from '../../state/AppContext.jsx';
import { initials, userWorkouts } from '../../lib/selectors.js';

export default function UserSelect() {
  const { data, selectUser, openModal } = useApp();

  return (
    <div className="user-select-view">
      <h1>Who&rsquo;s lifting?</h1>
      <div className="user-grid">
        {data.users.map((u) => {
          const wc = userWorkouts(data, u.id).length;
          return (
            <button key={u.id} className="user-card" onClick={() => selectUser(u.id)}>
              <span className="user-avatar">{initials(u.name)}</span>
              <span className="user-card-name">{u.name}</span>
              <span className="user-card-sub">{wc} workout{wc === 1 ? '' : 's'} logged</span>
            </button>
          );
        })}
        <button className="user-card-add" onClick={() => openModal({ type: 'addUser' })}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>+</span>
          <span>Add lifter</span>
        </button>
      </div>
    </div>
  );
}

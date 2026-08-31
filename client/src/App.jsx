import { useApp } from './state/AppContext.jsx';
import { NetworkError } from './api/client.js';
import Topbar from './components/Topbar.jsx';
import UserSelect from './components/UserSelect/UserSelect.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Toast from './components/shared/Toast.jsx';
import ModalRoot from './components/modals/ModalRoot.jsx';

export default function App() {
  const { data, loading, error, ui } = useApp();

  if (loading) return <div style={{ padding: 40 }}>Loading&hellip;</div>;
  if (!data) {
    return (
      <div style={{ padding: 40 }}>
        {error instanceof NetworkError
          ? "Can't reach the server yet, and this device has no saved data from a previous visit. Connect once (over Tailscale or your home Wi-Fi) to load your data — after that it'll keep working offline."
          : `Couldn't reach the server: ${error?.message || 'unknown error'}`}
      </div>
    );
  }

  return (
    <>
      <Topbar />
      {ui.currentUserId ? <Dashboard /> : <UserSelect />}
      <ModalRoot />
      <Toast />
    </>
  );
}

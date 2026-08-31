import { useApp } from './state/AppContext.jsx';
import Topbar from './components/Topbar.jsx';
import UserSelect from './components/UserSelect/UserSelect.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Toast from './components/shared/Toast.jsx';
import ModalRoot from './components/modals/ModalRoot.jsx';

export default function App() {
  const { data, loading, error, ui } = useApp();

  if (loading) return <div style={{ padding: 40 }}>Loading&hellip;</div>;
  if (error) return <div style={{ padding: 40 }}>Couldn&rsquo;t reach the server: {error.message}</div>;

  return (
    <>
      <Topbar />
      {ui.currentUserId ? <Dashboard /> : <UserSelect />}
      <ModalRoot />
      <Toast />
    </>
  );
}

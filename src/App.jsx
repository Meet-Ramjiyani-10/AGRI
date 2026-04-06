import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Login from './pages/Login';
import FarmerPortal from './pages/FarmerPortal';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PilotReadiness from './pages/PilotReadiness';
import Header from './components/Header';
import SMSNotification from './components/SMSNotification';

function App() {
  const { role, notifications } = useApp();

  return (
    <div className="min-h-screen bg-[var(--color-govt-bg)]">
      {role && <Header />}
      <Routes>
        <Route path="/" element={role ? <Navigate to={`/${role}`} /> : <Login />} />
        <Route path="/farmer" element={role === 'farmer' ? <FarmerPortal /> : <Navigate to="/" />} />
        <Route path="/officer" element={role === 'officer' ? <OfficerDashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/pilot" element={<PilotReadiness />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* SMS Notification popups */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <SMSNotification key={n.id} message={n.message} type={n.type} />
        ))}
      </div>
    </div>
  );
}

export default App;

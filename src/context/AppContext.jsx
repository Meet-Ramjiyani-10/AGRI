import React, { createContext, useContext, useState, useCallback } from 'react';
import { applications as initialApps, grievances as initialGrievances, auditTrail as initialAudit } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [role, setRole] = useState(null); // 'farmer', 'officer', 'admin'
  const [fontSize, setFontSize] = useState(0); // 0=normal, 1=large, 2=larger
  const [highContrast, setHighContrast] = useState(false);
  const [applications, setApplications] = useState(initialApps);
  const [grievancesList, setGrievances] = useState(initialGrievances);
  const [audit, setAudit] = useState(initialAudit);
  const [notifications, setNotifications] = useState([]);
  const [offlineMode, setOfflineMode] = useState(false);
  // INTEGRATION ADDITION
  const [apiMode, setApiModeState] = useState(() => {
    const saved = localStorage.getItem('krishi_api_mode');
    return saved === 'prod' ? 'production' : (saved || 'mock');
  });
  const setApiMode = useCallback((mode) => {
    const normalized = mode === 'prod' ? 'production' : mode;
    localStorage.setItem('krishi_api_mode', normalized);
    setApiModeState(normalized);
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 1, 2));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 1, 0));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, []);

  const updateApplicationStatus = useCallback((appId, newStatus, officerAction) => {
    setApplications(prev => prev.map(app =>
      app.id === appId ? { ...app, status: newStatus, processedDate: new Date().toISOString().split('T')[0] } : app
    ));

    if (officerAction) {
      const app = initialApps.find(a => a.id === appId) || applications.find(a => a.id === appId);
      const aiRecommendation = app?.aiRecommendation === 'approve' ? 'Approve' : app?.aiRecommendation === 'reject' ? 'Reject' : 'Review';
      const isOverride = (aiRecommendation === 'Approve' && officerAction === 'Reject') ||
        (aiRecommendation === 'Reject' && officerAction === 'Approve');
      const newAuditEntry = {
        id: audit.length + 1,
        timestamp: new Date().toLocaleString('en-IN'),
        officer: 'Abhijit Desai',
        action: isOverride ? 'Override' : officerAction,
        appId: appId,
        aiRecommendation,
        finalDecision: newStatus === 'approved' ? 'Approved' : newStatus === 'rejected' ? 'Rejected' : 'Pending Officer',
        overridden: isOverride,
      };
      setAudit(prev => [newAuditEntry, ...prev]);
    }
  }, [audit.length, applications]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, time: new Date() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  React.useEffect(() => {
    document.body.classList.remove('font-large', 'font-larger', 'high-contrast');
    if (fontSize === 1) document.body.classList.add('font-large');
    if (fontSize === 2) document.body.classList.add('font-larger');
    if (highContrast) document.body.classList.add('high-contrast');
  }, [fontSize, highContrast]);

  return (
    <AppContext.Provider value={{
      role, setRole,
      fontSize, increaseFontSize, decreaseFontSize,
      highContrast, toggleHighContrast,
      applications, setApplications, updateApplicationStatus,
      grievancesList, setGrievances,
      audit,
      notifications, addNotification,
      offlineMode, setOfflineMode,
      apiMode, setApiMode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { role, setRole, fontSize, increaseFontSize, decreaseFontSize, highContrast, toggleHighContrast } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const roleLabels = {
    farmer: t('farmerPortal'),
    officer: t('officerDashboard'),
    admin: t('adminDashboard'),
  };

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  return (
    <header className="bg-white border-b-2 border-[var(--color-saffron)] shadow-sm no-print" role="banner">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[var(--color-saffron)] via-white to-[var(--color-green-govt)]"></div>

      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-saffron-light)] border-2 border-[var(--color-saffron)] flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-[var(--color-saffron-dark)]">🌾</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-navy)] leading-tight">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-[var(--color-govt-text-light)]">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Center: Role badge */}
          {role && (
            <div className="hidden md:flex items-center gap-2 bg-[var(--color-saffron-light)] px-4 py-1.5 rounded border border-[var(--color-saffron)]">
              <span className="text-sm font-semibold text-[var(--color-saffron-dark)]">
                {roleLabels[role]}
              </span>
            </div>
          )}

          {/* Right: Language toggle, Accessibility & actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Toggle - Most prominent */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs px-3 py-1.5 rounded border-2 border-[var(--color-saffron)] bg-[var(--color-saffron-light)] text-[var(--color-saffron-dark)] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-saffron)]"
              aria-label="Select Language / भाषा निवडा"
            >
              <option value="en">🌐 English</option>
              <option value="mr">🇮🇳 मराठी</option>
            </select>

            {/* Font size controls */}
            <div className="flex items-center gap-1 border border-[var(--color-govt-border)] rounded px-2 py-1" role="group" aria-label={language === 'mr' ? 'अक्षर आकार बदला' : 'Change font size'}>
              <button
                onClick={decreaseFontSize}
                disabled={fontSize === 0}
                className="text-xs px-1.5 py-0.5 hover:bg-gray-100 rounded disabled:opacity-40"
                aria-label={language === 'mr' ? 'अक्षर आकार कमी करा' : 'Decrease font size'}
                title="A-"
              >
                A-
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize === 2}
                className="text-sm px-1.5 py-0.5 hover:bg-gray-100 rounded font-bold disabled:opacity-40"
                aria-label={language === 'mr' ? 'अक्षर आकार वाढवा' : 'Increase font size'}
                title="A+"
              >
                A+
              </button>
            </div>

            {/* High contrast toggle */}
            <button
              onClick={toggleHighContrast}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                highContrast
                  ? 'bg-black text-white border-white'
                  : 'bg-white text-gray-700 border-[var(--color-govt-border)] hover:bg-gray-50'
              }`}
              aria-label={language === 'mr' ? 'उच्च कॉन्ट्रास्ट मोड' : 'High contrast mode'}
              title="High Contrast"
            >
              ◐ {t('contrast')}
            </button>

            {/* Pilot Readiness link */}
            <button
              onClick={() => navigate('/pilot')}
              className="text-xs px-3 py-1.5 rounded border border-[var(--color-green-govt)] text-[var(--color-green-govt)] hover:bg-[var(--color-green-govt-light)] transition-colors"
              aria-label={language === 'mr' ? 'पायलट तयारी' : 'Pilot readiness'}
            >
              🚀 {t('pilot')}
            </button>

            {/* Logout */}
            {role && (
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded bg-[var(--color-danger)] text-white hover:bg-red-700 transition-colors"
                aria-label={t('logout')}
              >
                {t('logout')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border - green */}
      <div className="h-0.5 bg-[var(--color-green-govt)]"></div>
    </header>
  );
}

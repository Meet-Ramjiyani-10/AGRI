import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { setRole } = useApp();
  const { t, language, setLanguage, setDefaultLanguageForRole } = useLanguage();
  const navigate = useNavigate();

  const roles = [
    {
      key: 'farmer',
      icon: '🌾',
      titleKey: 'farmerPortal',
      subtitle: 'Farmer Portal',
      descKey: 'farmerDesc',
      color: 'var(--color-green-govt)',
      lightColor: 'var(--color-green-govt-light)',
      defaultLang: 'mr',
    },
    {
      key: 'officer',
      icon: '👤',
      titleKey: 'officerDashboard',
      subtitle: 'Officer Dashboard',
      descKey: 'officerDesc',
      color: 'var(--color-saffron)',
      lightColor: 'var(--color-saffron-light)',
      defaultLang: 'en',
    },
    {
      key: 'admin',
      icon: '🏛️',
      titleKey: 'adminDashboard',
      subtitle: 'Admin / Collector Dashboard',
      descKey: 'adminDesc',
      color: 'var(--color-navy)',
      lightColor: 'var(--color-navy-light)',
      defaultLang: 'en',
    },
  ];

  const handleRoleSelect = (role) => {
    // Set default language based on role (only if not already set by user)
    setDefaultLanguageForRole(role);
    setRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-govt-bg)]">
      {/* Top accent */}
      <div className="h-2 bg-gradient-to-r from-[var(--color-saffron)] via-white to-[var(--color-green-govt)]"></div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Language toggle at top right */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm px-4 py-2 rounded border-2 border-[var(--color-saffron)] bg-[var(--color-saffron-light)] text-[var(--color-saffron-dark)] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-saffron)]"
            aria-label="Select Language / भाषा निवडा"
          >
            <option value="en">🌐 English</option>
            <option value="mr">🇮🇳 मराठी</option>
          </select>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-saffron-light)] border-3 border-[var(--color-saffron)] mb-4">
            <span className="text-4xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-1">{t('appTitle')}</h1>
          <p className="text-lg text-[var(--color-govt-text-light)]">KrishiSetu AI – {language === 'mr' ? 'स्मार्ट कृषी प्रशासन प्रणाली' : 'Smart Agriculture Administration System'}</p>
          <p className="text-sm text-[var(--color-govt-text-light)] mt-1">{language === 'mr' ? 'महाराष्ट्र शासन | कृषी विभाग' : 'Government of Maharashtra | Agriculture Department'}</p>
          <div className="w-24 h-0.5 bg-[var(--color-saffron)] mx-auto mt-3"></div>
        </div>

        {/* Role selection cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => handleRoleSelect(r.key)}
              className="bg-white border-2 border-gray-200 rounded p-6 text-left hover:shadow-md transition-all group"
              style={{ borderTopColor: r.color, borderTopWidth: '4px' }}
              aria-label={`${t(r.titleKey)} ${language === 'mr' ? 'म्हणून लॉगिन करा' : 'login'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: r.lightColor }}
                >
                  {r.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-govt-text)] group-hover:text-[var(--color-navy)]">{t(r.titleKey)}</h2>
                  <p className="text-xs text-[var(--color-govt-text-light)]">{r.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-govt-text-light)] mb-4">{t(r.descKey)}</p>
              <div
                className="text-sm font-semibold px-4 py-2 rounded text-center text-white transition-opacity group-hover:opacity-90"
                style={{ backgroundColor: r.color }}
              >
                {t('enterAs')} →
              </div>
            </button>
          ))}
        </div>

        {/* Info bar */}
        <div className="bg-white border border-[var(--color-govt-border)] rounded p-4 text-center">
          <p className="text-sm text-[var(--color-govt-text-light)]">
            {t('loginDesc')}
          </p>
        </div>

        {/* Pilot readiness link */}
        <div className="text-center mt-6">
          <a
            href="/pilot"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-green-govt)] hover:underline font-medium"
          >
            {t('pilotInfo')}
          </a>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-[var(--color-green-govt)] via-white to-[var(--color-saffron)]"></div>
    </div>
  );
}

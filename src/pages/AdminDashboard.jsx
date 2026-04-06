import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { pendingByScheme, schemeBudgets, budgetPredictionData, officers, proactiveEntitlements } from '../data/mockData';
import MaharashtraMap from '../components/MaharashtraMap';
import ApiStatusFooter from '../components/ApiStatusFooter';
import { mockMahaDBT } from '../services/mockApiServices';

export default function AdminDashboard() {
  const { audit, addNotification, apiMode, setApiMode } = useApp();
  const { t, isMarathi } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [smsSent, setSmsSent] = useState({});
  const [sortState, setSortState] = useState({ key: 'timestamp', dir: 'desc' });
  const [remoteSchemes, setRemoteSchemes] = useState([]);
  const [gatewayLoading, setGatewayLoading] = useState(false);

  const tabs = [
    { key: 'overview', labelKey: 'overview', icon: '📊' },
    { key: 'officers', labelKey: 'officers', icon: '👥' },
    { key: 'audit', labelKey: 'auditTrail', icon: '📜' },
    { key: 'proactive', labelKey: 'proactiveSearch', icon: '🔔' },
    { key: 'benchmark', labelKey: 'benchmark', icon: '📈' },
  ];

  const sortable = (data, key) =>
    [...data].sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortState.dir === 'asc' ? cmp : -cmp;
    });

  const sortedAudit = useMemo(() => sortable(audit, sortState.key), [audit, sortState]);
  const sortedOfficers = useMemo(() => sortable(officers, sortState.key in officers[0] ? sortState.key : 'pendingApps'), [sortState]);

  const onSort = (key) => {
    setSortState((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSendSMS = (farmer) => {
    setSmsSent((prev) => ({ ...prev, [farmer.farmerName]: true }));
    addNotification(
      isMarathi
        ? "📱 SMS sent in Marathi: 'आपण PM-KISAN साठी पात्र आहात. अर्ज करा.'"
        : "📱 SMS sent in Marathi: 'आपण PM-KISAN साठी पात्र आहात. अर्ज करा.'",
      'success'
    );
  };

  const handleEscalate = (officer) => {
    addNotification(`${officer.nameEn}: Alert sent to District Collector.`, 'error');
  };

  const benchmarkData = [
    { name: isMarathi ? 'मॅन्युअल' : 'Manual', value: 25, fill: '#dc2626' },
    { name: 'KrishiSetu AI', value: 3, fill: '#16a34a' },
  ];

  const toggleApiMode = () => {
    const nextMode = apiMode === 'mock' ? 'production' : 'mock';
    setApiMode(nextMode);
    if (nextMode === 'production') {
      addNotification('🚀 Production mode – ready to connect to real MahaDBT, Mahabhulekh, Aaple Sarkar APIs with official credentials.', 'info');
    }
  };

  const handleFetchSchemes = async () => {
    setGatewayLoading(true);
    // INTEGRATION ADDITION
    const schemes = await mockMahaDBT.getSchemes();
    setRemoteSchemes(schemes);
    addNotification(`Gateway (${apiMode === 'mock' ? 'MOCK' : 'PRODUCTION'}) fetched ${schemes.length} schemes.`, 'info');
    setGatewayLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center bg-[var(--color-govt-bg)]">
      <div className="w-full max-w-[1200px] px-4 py-6">
        {/* Main content card */}
        <div className="bg-white border border-[var(--color-govt-border)] rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex gap-1 mb-6 bg-gray-50 rounded border border-[var(--color-govt-border)] overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === tab.key ? 'bg-[var(--color-saffron)] text-white' : 'text-[var(--color-govt-text)] hover:bg-gray-50'
                }`}
              >
                {tab.icon} {t(tab.labelKey)}
              </button>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 bg-gray-50 border border-[var(--color-govt-border)] rounded p-3">
            <button
              id="apiModeToggle"
              onClick={toggleApiMode}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${apiMode === 'mock' ? 'bg-green-600 text-white' : 'bg-gray-300 text-black'}`}
            >
              🌐 API Gateway: {apiMode === 'mock' ? 'MOCK MODE' : 'PRODUCTION READY'}
            </button>
            <div className="text-xs text-[var(--color-govt-text-light)] api-mode-status">
              {apiMode === 'mock'
                ? '✅ Connected to Mock MahaDBT, Mahabhulekh, Aaple Sarkar'
                : '🚀 Ready for live API endpoints.'}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-3 text-left">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <h3 className="text-sm font-bold text-[var(--color-navy)]">MahaDBT Gateway Demo</h3>
                  <button onClick={handleFetchSchemes} disabled={gatewayLoading} className="text-xs px-3 py-1.5 rounded bg-[var(--color-saffron)] text-white disabled:opacity-50">
                    {gatewayLoading ? 'Loading...' : 'Fetch Active Schemes'}
                  </button>
                </div>
                {remoteSchemes.length > 0 && (
                  <ul className="mt-2 text-xs list-disc pl-4">
                    {remoteSchemes.map((s) => (
                      <li key={s.id}>{s.name} - {s.benefit}</li>
                    ))}
                  </ul>
                )}
              </div>
              {/* INTEGRATION ADDITION */}
              <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-3 text-left">
                <h3 className="text-sm font-bold text-[var(--color-navy)] mb-2">Integration Status</h3>
                {apiMode === 'mock' ? (
                  <div className="space-y-1 text-xs">
                    <p>✅ Mock MahaDBT API - responding</p>
                    <p>✅ Mock Mahabhulekh API - responding</p>
                    <p>✅ Mock Aaple Sarkar API - responding</p>
                  </div>
                ) : (
                  <p className="text-xs">Ready to connect to live endpoints.</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { labelKey: 'totalPending', value: '710', color: 'var(--color-saffron)' },
                  { labelKey: 'processedTodayAdmin', value: '45', color: 'var(--color-green-govt)' },
                  { labelKey: 'fraudFound', value: '12', color: 'var(--color-danger)' },
                  { labelKey: 'grievancesPending', value: '28', color: 'var(--color-navy)' },
                ].map((card) => (
                  <div key={card.labelKey} className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-4 text-center" style={{ borderTopColor: card.color, borderTopWidth: '3px' }}>
                    <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                    <p className="text-xs text-[var(--color-govt-text-light)] mt-1">{t(card.labelKey)}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-4">
                  <h3 className="font-bold text-lg text-[var(--color-navy)] mb-3 text-center border-b pb-1">{t('pendingByScheme')}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={pendingByScheme}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="scheme" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF9933" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-4">
                  <h3 className="font-bold text-lg text-[var(--color-navy)] mb-1 text-center border-b pb-1">{t('budgetPrediction')}</h3>
                  <p className="text-xs text-[var(--color-danger)] mb-3 font-medium text-center">{t('budgetWarning')}</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={budgetPredictionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="pmkisan" stroke="#FF9933" strokeWidth={2} name="PM-KISAN" />
                      <Line type="monotone" dataKey="pmfby" stroke="#138808" strokeWidth={2} name="PMFBY" />
                      <Line type="monotone" dataKey="kcc" stroke="#000080" strokeWidth={2} name="KCC" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-4 text-center">
                <h3 className="font-bold text-lg text-[var(--color-navy)] mb-2 border-b pb-1">🚀 Pilot Readiness</h3>
                <p className="text-sm text-[var(--color-govt-text)]">
                  Deployable in any taluka office in 1 day. Requires: 1 laptop, no internet, no new hardware. Pilot cost: ₹0.
                </p>
              </div>

              <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-4">
                <h3 className="font-bold text-lg text-[var(--color-navy)] mb-3 text-center border-b pb-1">{t('grievanceHeatmap')}</h3>
                <div className="h-[400px] rounded overflow-hidden border">
                  <MaharashtraMap />
                </div>
              </div>

              <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-4">
                <h3 className="font-bold text-lg text-[var(--color-navy)] mb-3 text-center border-b pb-1">{t('schemeBudgetStatus')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-2 text-xs font-semibold">{t('scheme')}</th>
                        <th className="text-right p-2 text-xs font-semibold">{t('budget')}</th>
                        <th className="text-right p-2 text-xs font-semibold">{t('utilized')}</th>
                        <th className="text-left p-2 text-xs font-semibold">{t('progress')}</th>
                        <th className="text-right p-2 text-xs font-semibold">{t('daysRemaining')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schemeBudgets.map((b) => {
                        const pct = Math.round((b.utilized / b.budget) * 100);
                        return (
                          <tr key={b.scheme} className="border-b">
                            <td className="p-2 text-left">{b.scheme}</td>
                            <td className="p-2 text-right">₹{b.budget}L</td>
                            <td className="p-2 text-right">₹{b.utilized}L ({pct}%)</td>
                            <td className="p-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${pct > 70 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-green-600'}`} style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                            <td className="p-2 text-right">{b.daysRemaining} {t('days')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'officers' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 text-center border-b pb-2">{t('officerWorkload')} (अधिकारी कार्यभार)</h2>
              <div className="w-full max-w-6xl mx-auto bg-gray-50 border border-[var(--color-govt-border)] rounded">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-3 text-xs font-semibold cursor-pointer" onClick={() => onSort('nameEn')}>{t('officerName')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('designation')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('district')}</th>
                        <th className="text-right p-3 text-xs font-semibold cursor-pointer" onClick={() => onSort('pendingApps')}>{t('pendingApplications')}</th>
                        <th className="text-right p-3 text-xs font-semibold cursor-pointer" onClick={() => onSort('avgProcessingTime')}>{t('avgProcessingTime')} ({t('mins')})</th>
                        <th className="text-right p-3 text-xs font-semibold">{t('vsDistrictAvg')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOfficers.map((o) => {
                        const isEscalate = o.avgProcessingTime > o.districtAvg * 1.5;
                        const vsAvg = (((o.avgProcessingTime - o.districtAvg) / o.districtAvg) * 100).toFixed(0);
                        return (
                          <tr key={o.id} className={`border-b ${isEscalate ? 'bg-red-50' : ''}`}>
                            <td className="p-3 text-left font-medium">{isMarathi ? o.name : o.nameEn}</td>
                            <td className="p-3 text-left">{o.role}</td>
                            <td className="p-3 text-left">{o.district}</td>
                            <td className="p-3 text-right">{o.pendingApps}</td>
                            <td className={`p-3 text-right font-semibold ${isEscalate ? 'text-red-700' : ''}`}>{o.avgProcessingTime}</td>
                            <td className="p-3 text-right">{vsAvg}%</td>
                            <td className="p-3 text-left">
                              {isEscalate ? (
                                <button onClick={() => handleEscalate(o)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                                  ⚠️ {t('escalateToCollector')}
                                </button>
                              ) : (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{t('normal')}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 text-center border-b pb-2">{t('auditTrail')} (ऑडिट ट्रेल)</h2>
              <div className="w-full max-w-6xl mx-auto bg-gray-50 border border-[var(--color-govt-border)] rounded">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-3 text-xs font-semibold cursor-pointer" onClick={() => onSort('timestamp')}>{t('timestamp')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('officerName')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('action')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('applicationId')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('aiRecommendation')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('finalDecision')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('overridden')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAudit.map((entry) => (
                        <tr key={entry.id} className={`border-b ${entry.overridden ? 'bg-amber-50' : ''}`}>
                          <td className="p-3 text-left font-mono text-xs">{entry.timestamp}</td>
                          <td className="p-3 text-left">{entry.officer}</td>
                          <td className="p-3 text-left">
                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                              entry.action === 'Approve' ? 'bg-green-100 text-green-700' : entry.action === 'Reject' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {entry.action}
                            </span>
                          </td>
                          <td className="p-3 text-left font-mono text-xs">{entry.appId}</td>
                          <td className="p-3 text-left text-xs">{entry.aiRecommendation}</td>
                          <td className="p-3 text-left text-xs font-medium">{entry.finalDecision}</td>
                          <td className="p-3 text-left text-xs">{entry.overridden ? t('yes') : t('no')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proactive' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 text-center border-b pb-2">
                🔔 {t('eligibleNotApplied')} ({t('eligibleNotAppliedLong')})
              </h2>
              {/* Demo: In production, XGBoost eligibility + records matching identifies these farmers */}
              <div className="w-full max-w-6xl mx-auto bg-gray-50 border border-[var(--color-govt-border)] rounded">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-3 text-xs font-semibold">{t('farmerName')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('village')}</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('scheme')}</th>
                        <th className="text-right p-3 text-xs font-semibold">{t('schemeBenefit')} (₹)</th>
                        <th className="text-left p-3 text-xs font-semibold">{t('sendSMS')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proactiveEntitlements.map((farmer) => (
                        <tr key={farmer.mobile} className="border-b">
                          <td className="p-3 text-left">{isMarathi ? farmer.farmerName : farmer.farmerNameEn}</td>
                          <td className="p-3 text-left">{farmer.village}</td>
                          <td className="p-3 text-left">{isMarathi ? farmer.eligibleSchemeMarathi : farmer.eligibleScheme}</td>
                          <td className="p-3 text-right font-semibold">{farmer.schemeBenefit?.toLocaleString('en-IN') || '6000'}</td>
                          <td className="p-3 text-left">
                            {smsSent[farmer.farmerName] ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ {t('smsSent')}</span>
                            ) : (
                              <button onClick={() => handleSendSMS(farmer)} className="text-xs bg-[var(--color-saffron)] text-white px-3 py-1 rounded hover:bg-[var(--color-saffron-dark)]">
                                📱 {t('sendSMS')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benchmark' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 text-center border-b pb-2">📈 {t('beforeAfterTitle')}</h2>
              <div className="w-full max-w-4xl mx-auto bg-gray-50 border border-[var(--color-govt-border)] rounded p-4 text-center">
                <p className="text-sm text-[var(--color-govt-text)] font-medium mb-3">{t('efficiencyLine')}</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ApiStatusFooter />
    </div>
  );
}

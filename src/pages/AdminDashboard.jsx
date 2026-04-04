import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { pendingByScheme, schemeBudgets, budgetPredictionData, officers, proactiveEntitlements, beforeAfterBenchmark } from '../data/mockData';
import MaharashtraMap from '../components/MaharashtraMap';

export default function AdminDashboard() {
  const { audit, addNotification } = useApp();
  const { t, language, isMarathi } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [smsSent, setSmsSent] = useState({});

  const handleSendSMS = (farmer) => {
    setSmsSent(prev => ({ ...prev, [farmer.farmerName]: true }));
    addNotification(isMarathi 
      ? `SMS ${farmer.farmerName} यांना: आदरणीय शेतकरी, आपण ${farmer.eligibleSchemeMarathi} साठी पात्र आहात. अर्ज करण्यासाठी जवळच्या CSC केंद्राला भेट द्या.`
      : `SMS to ${farmer.farmerNameEn}: Dear farmer, you are eligible for ${farmer.eligibleScheme}. Visit nearest CSC center to apply.`);
  };

  const handleExportPDF = () => {
    addNotification(isMarathi ? '📄 अहवाल PDF तयार होत आहे... डाउनलोड लवकरच सुरू होईल.' : '📄 Report PDF is being generated... Download will start soon.');
    // Simulated PDF export
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('KrishiSetu AI - Admin Report\n\nThis is a simulated PDF export.');
      link.download = 'KrishiSetu_Report_2026.pdf';
      link.click();
    }, 1000);
  };

  const tabs = [
    { key: 'overview', labelKey: 'overview', icon: '📊' },
    { key: 'officers', labelKey: 'officers', icon: '👥' },
    { key: 'audit', labelKey: 'auditTrail', icon: '📜' },
    { key: 'proactive', labelKey: 'proactiveSearch', icon: '🔔' },
    { key: 'benchmark', labelKey: 'benchmark', icon: '📈' },
  ];

  // Benchmark data with bilingual support
  const benchmarkData = [
    { metricKey: 'applicationProcessTime', manual: t('manualTime1'), ai: t('aiTime1'), improvement: t('improvement1') },
    { metricKey: 'documentVerification', manual: t('manualTime2'), ai: t('aiTime2'), improvement: t('improvement2') },
    { metricKey: 'fraudIdentification', manual: t('manualTime3'), ai: t('aiTime3'), improvement: t('improvement3') },
    { metricKey: 'grievanceResponse', manual: t('manualTime4'), ai: t('aiTime4'), improvement: t('improvement4') },
    { metricKey: 'dailyCapacity', manual: t('manualTime5'), ai: t('aiTime5'), improvement: t('improvement5') },
    { metricKey: 'eligibleFarmerIdentification', manual: t('manualTime6'), ai: t('aiTime6'), improvement: t('improvement6') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded border border-[var(--color-govt-border)] overflow-x-auto" role="tablist">
        {tabs.map(tab => (
          <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'bg-[var(--color-saffron)] text-white' : 'text-[var(--color-govt-text)] hover:bg-gray-50'
            }`}>
            {tab.icon} {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Export button */}
      <div className="flex justify-end mb-4">
        <button onClick={handleExportPDF}
          className="bg-[var(--color-navy)] text-white text-xs px-4 py-2 rounded hover:opacity-90 flex items-center gap-1" aria-label={t('downloadReport')}>
          📥 {t('downloadReport')} (PDF)
        </button>
      </div>

      {/* ========== OVERVIEW ========== */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { labelKey: 'totalPending', value: '710', color: 'var(--color-saffron)' },
              { labelKey: 'processedTodayAdmin', value: '45', color: 'var(--color-green-govt)' },
              { labelKey: 'fraudFound', value: '12', color: 'var(--color-danger)' },
              { labelKey: 'grievancesPending', value: '28', color: 'var(--color-navy)' },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-[var(--color-govt-border)] rounded p-4 text-center" style={{ borderTopColor: card.color, borderTopWidth: '3px' }}>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs text-[var(--color-govt-text-light)] mt-1">{t(card.labelKey)}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pending by scheme - bar chart */}
            <div className="bg-white border border-[var(--color-govt-border)] rounded p-4">
              <h3 className="font-bold text-sm text-[var(--color-navy)] mb-3 text-left">{t('pendingByScheme')}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pendingByScheme}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scheme" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF9933" name={isMarathi ? 'अर्ज संख्या' : 'Application Count'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Budget predictor - line chart */}
            <div className="bg-white border border-[var(--color-govt-border)] rounded p-4">
              <h3 className="font-bold text-sm text-[var(--color-navy)] mb-1 text-left">{t('budgetPrediction')}</h3>
              <p className="text-xs text-[var(--color-danger)] mb-3 font-medium text-left">{t('budgetWarning')}</p>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={budgetPredictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: '₹ ' + (isMarathi ? 'लाख' : 'Lakhs'), angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="pmkisan" stroke="#FF9933" strokeWidth={2} name="PM-KISAN" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pmfby" stroke="#138808" strokeWidth={2} name="PMFBY" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="kcc" stroke="#000080" strokeWidth={2} name="KCC" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="solar" stroke="#D32F2F" strokeWidth={2} name={isMarathi ? 'सोलर' : 'Solar'} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget exhaustion table */}
          <div className="bg-white border border-[var(--color-govt-border)] rounded p-4">
            <h3 className="font-bold text-sm text-[var(--color-navy)] mb-3 text-left">{t('schemeBudgetStatus')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-2 text-xs font-semibold">{t('scheme')}</th>
                    <th className="text-right p-2 text-xs font-semibold">{t('budget')} (₹ {isMarathi ? 'लाख' : 'Lakhs'})</th>
                    <th className="text-right p-2 text-xs font-semibold">{t('utilized')}</th>
                    <th className="text-left p-2 text-xs font-semibold">{t('progress')}</th>
                    <th className="text-right p-2 text-xs font-semibold">{t('daysRemaining')}</th>
                  </tr>
                </thead>
                <tbody>
                  {schemeBudgets.map(b => {
                    const pct = Math.round((b.utilized / b.budget) * 100);
                    return (
                      <tr key={b.scheme} className="border-b">
                        <td className="p-2 font-medium text-left">{b.scheme}</td>
                        <td className="p-2 text-right">₹{b.budget}L</td>
                        <td className="p-2 text-right">₹{b.utilized}L ({pct}%)</td>
                        <td className="p-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${pct > 70 ? 'bg-[var(--color-danger)]' : pct > 50 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-green-govt)]'}`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </td>
                        <td className={`p-2 text-right font-bold ${b.daysRemaining < 30 ? 'text-[var(--color-danger)]' : 'text-[var(--color-govt-text)]'}`}>
                          {b.daysRemaining} {t('days')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maharashtra heatmap */}
          <div className="bg-white border border-[var(--color-govt-border)] rounded p-4">
            <h3 className="font-bold text-sm text-[var(--color-navy)] mb-3 text-left">{t('grievanceHeatmap')}</h3>
            <div className="h-[400px] rounded overflow-hidden border">
              <MaharashtraMap />
            </div>
          </div>
        </div>
      )}

      {/* ========== OFFICER WORKLOAD ========== */}
      {activeTab === 'officers' && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4 text-left">{t('officerWorkload')}</h2>
          <div className="bg-white border border-[var(--color-govt-border)] rounded">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 text-xs font-semibold">{t('officerName')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('designation')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('district')}</th>
                    <th className="text-right p-3 text-xs font-semibold">{t('pending')}</th>
                    <th className="text-right p-3 text-xs font-semibold">{t('processedToday')}</th>
                    <th className="text-right p-3 text-xs font-semibold">{t('avgProcessingTime')} ({t('mins')})</th>
                    <th className="text-right p-3 text-xs font-semibold">{t('districtAvg')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map(o => {
                    const isCorrupt = o.avgProcessingTime > o.districtAvg * 1.5;
                    return (
                      <tr key={o.id} className={`border-b ${isCorrupt ? 'bg-[var(--color-danger-light)]' : ''}`}>
                        <td className="p-3 font-medium text-left">{isMarathi ? o.name : o.nameEn}</td>
                        <td className="p-3 text-left">{o.role}</td>
                        <td className="p-3 text-left">{o.district}</td>
                        <td className="p-3 text-right font-bold">{o.pendingApps}</td>
                        <td className="p-3 text-right">{o.processedToday}</td>
                        <td className={`p-3 text-right font-bold ${isCorrupt ? 'text-[var(--color-danger)]' : ''}`}>
                          {o.avgProcessingTime}
                        </td>
                        <td className="p-3 text-right">{o.districtAvg}</td>
                        <td className="p-3 text-left">
                          {isCorrupt ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-[var(--color-danger)] text-white px-2 py-0.5 rounded font-semibold">🚨 {t('suspicious')}</span>
                              <button
                                onClick={() => addNotification(isMarathi 
                                  ? `⚠️ ${o.name} बाबत तक्रार जिल्हाधिकाऱ्यांकडे पाठवली गेली.`
                                  : `⚠️ Report about ${o.nameEn} escalated to District Collector.`)}
                                className="text-xs bg-[var(--color-danger)] text-white px-2 py-0.5 rounded hover:bg-red-700"
                                aria-label={t('escalateToCollector')}
                              >
                                {isMarathi ? 'Escalate' : 'Escalate'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)] px-2 py-0.5 rounded">✅ {isMarathi ? 'सामान्य' : 'Normal'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-[var(--color-govt-text-light)] mt-2 text-left">
            {isMarathi 
              ? '🔴 जिल्हा सरासरीपेक्षा 50% जास्त प्रक्रिया वेळ असलेले अधिकारी स्वयंचलितपणे ध्वजांकित केले जातात.'
              : '🔴 Officers with processing time >50% above district average are automatically flagged.'}
          </p>
        </div>
      )}

      {/* ========== AUDIT TRAIL ========== */}
      {activeTab === 'audit' && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4 text-left">📜 {t('auditTrail')}</h2>
          <div className="bg-white border border-[var(--color-govt-border)] rounded">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 text-xs font-semibold">{t('timestamp')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('officerName')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('action')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('applicationId')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('aiRecommendation')}</th>
                    <th className="text-left p-3 text-xs font-semibold">{t('finalDecision')}</th>
                    <th className="text-center p-3 text-xs font-semibold">{t('overridden')}</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map(entry => (
                    <tr key={entry.id} className={`border-b ${entry.overridden ? 'bg-[var(--color-warning-light)]' : ''}`}>
                      <td className="p-3 text-xs font-mono text-left">{entry.timestamp}</td>
                      <td className="p-3 text-left">{entry.officer}</td>
                      <td className="p-3 text-left">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          entry.action === 'मंजूर' || entry.action === 'Approved' ? 'bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)]' :
                          entry.action === 'नाकारले' || entry.action === 'Rejected' ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' :
                          'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                        }`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-left">{entry.appId}</td>
                      <td className="p-3 text-xs text-left">{entry.aiRecommendation}</td>
                      <td className="p-3 text-xs font-medium text-left">{entry.finalDecision}</td>
                      <td className="p-3 text-center">
                        {entry.overridden ? <span className="text-[var(--color-danger)] font-bold">⚠️ {t('yes')}</span> : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========== PROACTIVE ENTITLEMENT ========== */}
      {activeTab === 'proactive' && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-[var(--color-navy)] mb-2 text-left">🔔 {t('eligibleNotApplied')}</h2>
          <p className="text-sm text-[var(--color-govt-text-light)] mb-4 text-left">
            {isMarathi 
              ? 'AI ने ओळखलेले शेतकरी जे योजनांना पात्र आहेत पण त्यांनी अर्ज केलेला नाही.'
              : 'AI-identified farmers who are eligible for schemes but have not applied.'}
          </p>
          <div className="space-y-3">
            {proactiveEntitlements.map((farmer, i) => (
              <div key={i} className="bg-white border border-[var(--color-govt-border)] rounded p-4 flex flex-wrap items-center justify-between gap-3 text-left">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-sm">{isMarathi ? farmer.farmerName : farmer.farmerNameEn} <span className="font-normal text-xs text-[var(--color-govt-text-light)]">({isMarathi ? farmer.farmerNameEn : farmer.farmerName})</span></p>
                  <p className="text-xs text-[var(--color-govt-text-light)]">{farmer.village} | {farmer.landArea} {t('acres')} | {t('crop')}: {farmer.cropType}</p>
                  <p className="text-xs mt-1">
                    <span className="bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)] px-2 py-0.5 rounded font-medium">{isMarathi ? farmer.eligibleSchemeMarathi : farmer.eligibleScheme}</span>
                  </p>
                  <p className="text-xs text-[var(--color-govt-text)] mt-1 italic">📝 {farmer.reason}</p>
                </div>
                <div>
                  {smsSent[farmer.farmerName] ? (
                    <span className="text-xs bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)] px-3 py-2 rounded font-semibold">✅ {t('smsSent')}</span>
                  ) : (
                    <button onClick={() => handleSendSMS(farmer)}
                      className="text-xs bg-[var(--color-saffron)] text-white px-4 py-2 rounded hover:bg-[var(--color-saffron-dark)] font-semibold" aria-label={`${isMarathi ? farmer.farmerName : farmer.farmerNameEn} ${t('sendSMS')}`}>
                      📱 {t('sendSMS')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== BENCHMARK ========== */}
      {activeTab === 'benchmark' && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4 text-left">📈 {t('beforeAfterTitle')}</h2>
          <div className="bg-white border border-[var(--color-govt-border)] rounded">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--color-saffron-light)] border-b">
                    <th className="text-left p-3 text-xs font-bold text-[var(--color-navy)]">{t('metric')}</th>
                    <th className="text-center p-3 text-xs font-bold text-[var(--color-danger)]">{t('manual')}</th>
                    <th className="text-center p-3 text-xs font-bold text-[var(--color-green-govt)]">{t('withAI')}</th>
                    <th className="text-center p-3 text-xs font-bold text-[var(--color-navy)]">{t('improvement')}</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkData.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3 font-medium text-left">{t(row.metricKey)}</td>
                      <td className="p-3 text-center text-[var(--color-danger)]">{row.manual}</td>
                      <td className="p-3 text-center text-[var(--color-green-govt)] font-semibold">{row.ai}</td>
                      <td className="p-3 text-center">
                        <span className="bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)] px-2 py-0.5 rounded text-xs font-bold">{row.improvement}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

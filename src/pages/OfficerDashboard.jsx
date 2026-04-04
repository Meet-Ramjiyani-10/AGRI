import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { grievances } from '../data/mockData';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function OfficerDashboard() {
  const { applications, updateApplicationStatus, addNotification } = useApp();
  const { t, language, isMarathi } = useLanguage();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedApp, setSelectedApp] = useState(null);
  const [grievanceResponses, setGrievanceResponses] = useState({});
  const [sentGrievances, setSentGrievances] = useState({});

  // Sort: high fraud risk first, then oldest pending
  const pendingApps = [...applications]
    .filter(a => a.status === 'pending_officer')
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      if (riskOrder[a.fraudRisk] !== riskOrder[b.fraudRisk]) return riskOrder[a.fraudRisk] - riskOrder[b.fraudRisk];
      return new Date(a.submittedDate) - new Date(b.submittedDate);
    });

  const processedToday = applications.filter(a => a.processedDate === new Date().toISOString().split('T')[0]).length;
  const pendingCount = pendingApps.length;

  const handleAction = (appId, action, label) => {
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending_officer';
    updateApplicationStatus(appId, status, label);
    addNotification(isMarathi 
      ? `SMS: अर्ज ${appId} ${label}. शेतकऱ्यांना सूचना पाठवली.`
      : `SMS: Application ${appId} ${label}. Notification sent to farmer.`);
    if (selectedApp?.id === appId) setSelectedApp(null);
  };

  const tabs = [
    { key: 'queue', labelKey: 'applicationQueue', icon: '📋', count: pendingCount },
    { key: 'grievance', labelKey: 'grievanceConsole', icon: '📢', count: grievances.filter(g => g.status === 'pending').length },
    { key: 'performance', labelKey: 'myPerformance', icon: '📊' },
  ];

  // Action labels based on language
  const actionLabels = {
    approve: isMarathi ? 'मंजूर' : 'Approved',
    reject: isMarathi ? 'नाकारले' : 'Rejected',
    review: isMarathi ? 'पुनरावलोकन' : 'Review',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded border border-[var(--color-govt-border)] overflow-hidden" role="tablist">
        {tabs.map(tab => (
          <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.key ? 'bg-[var(--color-saffron)] text-white' : 'text-[var(--color-govt-text)] hover:bg-gray-50'
            }`}>
            {tab.icon} {t(tab.labelKey)}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white text-[var(--color-saffron)]' : 'bg-[var(--color-danger)] text-white'}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ========== APPLICATION QUEUE ========== */}
      {activeTab === 'queue' && (
        <div className="flex gap-4 animate-fade-in">
          {/* Queue list */}
          <div className={`${selectedApp ? 'w-1/2' : 'w-full'} space-y-3 transition-all`}>
            <h2 className="text-lg font-bold text-[var(--color-navy)] mb-2 text-left">{t('pendingApplications')} ({pendingCount})</h2>
            {pendingApps.length === 0 ? (
              <div className="bg-white border border-[var(--color-govt-border)] rounded p-8 text-center text-[var(--color-govt-text-light)]">
                ✅ {t('allProcessed')}
              </div>
            ) : (
              pendingApps.map(app => (
                <div key={app.id} className={`bg-white border rounded p-4 cursor-pointer transition-all hover:shadow text-left ${
                  app.fraudRisk === 'high' ? 'border-[var(--color-danger)] border-l-4' :
                  app.fraudRisk === 'medium' ? 'border-[var(--color-warning)] border-l-4' :
                  'border-[var(--color-govt-border)]'
                } ${selectedApp?.id === app.id ? 'ring-2 ring-[var(--color-saffron)]' : ''}`}
                  onClick={() => setSelectedApp(app)}>
                  {/* Fraud banner */}
                  {app.fraudRisk === 'high' && (
                    <div className="bg-[var(--color-danger-light)] text-[var(--color-danger)] text-xs font-bold px-2 py-1 rounded mb-2 flex items-center gap-1">
                      🚨 {t('fraudDetected')} | {t('riskScore')}: {app.fraudScore}%
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm">{isMarathi ? app.farmerName : app.farmerNameEn} <span className="font-normal text-xs text-[var(--color-govt-text-light)]">({isMarathi ? app.farmerNameEn : app.farmerName})</span></p>
                      <p className="text-xs text-[var(--color-govt-text-light)] mt-0.5">{app.id} | {isMarathi ? app.schemeMarathi : app.scheme} | {app.village}</p>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded ${
                      app.aiRecommendation === 'approve' ? 'bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)]' :
                      app.aiRecommendation === 'reject' ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' :
                      'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                    }`}>
                      AI: {app.aiRecommendation === 'approve' ? t('approve') : app.aiRecommendation === 'reject' ? t('reject') : t('review')}
                      <span className="ml-1">({app.confidence}%)</span>
                    </div>
                  </div>
                  <p className="text-xs mt-2 text-[var(--color-govt-text)] italic">📝 {isMarathi ? app.reasonMarathi : app.reasonEnglish}</p>
                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button onClick={(e) => { e.stopPropagation(); handleAction(app.id, 'approve', actionLabels.approve); }}
                      className="flex-1 bg-[var(--color-green-govt)] text-white text-xs py-2 rounded hover:bg-[var(--color-green-govt-dark)] font-semibold" aria-label={`${app.id} ${t('approve')}`}>
                      ✅ {t('approve')}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleAction(app.id, 'reject', actionLabels.reject); }}
                      className="flex-1 bg-[var(--color-danger)] text-white text-xs py-2 rounded hover:bg-red-700 font-semibold" aria-label={`${app.id} ${t('reject')}`}>
                      ❌ {t('reject')}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                      className="flex-1 bg-[var(--color-saffron)] text-white text-xs py-2 rounded hover:bg-[var(--color-saffron-dark)] font-semibold" aria-label={`${app.id} ${t('viewDetails')}`}>
                      🔍 {t('viewDetails')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail sidebar */}
          {selectedApp && (
            <div className="w-1/2 bg-white border border-[var(--color-govt-border)] rounded p-4 sticky top-4 self-start animate-slide-in max-h-[calc(100vh-120px)] overflow-y-auto text-left">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h3 className="font-bold text-[var(--color-navy)]">{t('applicationDetails')}</h3>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600" aria-label={t('close')}>✕</button>
              </div>

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div><span className="text-[var(--color-govt-text-light)]">{t('applicationId')}:</span><br/><strong>{selectedApp.id}</strong></div>
                <div><span className="text-[var(--color-govt-text-light)]">{t('farmerName')}:</span><br/><strong>{isMarathi ? selectedApp.farmerName : selectedApp.farmerNameEn}</strong></div>
                <div><span className="text-[var(--color-govt-text-light)]">{t('scheme')}:</span><br/><strong>{isMarathi ? selectedApp.schemeMarathi : selectedApp.scheme}</strong></div>
                <div><span className="text-[var(--color-govt-text-light)]">{t('submissionDate')}:</span><br/><strong>{selectedApp.submittedDate}</strong></div>
                <div><span className="text-[var(--color-govt-text-light)]">{t('area')}:</span><br/><strong>{selectedApp.landArea} {t('acres')}</strong></div>
                <div><span className="text-[var(--color-govt-text-light)]">{t('crop')}:</span><br/><strong>{selectedApp.cropType}</strong></div>
              </div>

              {/* Fraud warning */}
              {selectedApp.fraudRisk === 'high' && (
                <div className="bg-[var(--color-danger-light)] border border-[var(--color-danger)] rounded p-3 mb-4">
                  <h4 className="text-sm font-bold text-[var(--color-danger)] mb-1">🚨 {t('fraudRisk')}: {isMarathi ? 'उच्च' : 'High'} ({selectedApp.fraudScore}%)</h4>
                  <p className="text-xs text-[var(--color-danger)] mb-2">{isMarathi ? selectedApp.reasonMarathi : selectedApp.reasonEnglish}</p>
                  {selectedApp.fraudDetails && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">{t('duplicateRecords')}:</p>
                      {selectedApp.fraudDetails.map((d, i) => (
                        <p key={i} className="text-xs bg-white rounded px-2 py-1">• {d}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Extracted fields with confidence */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[var(--color-navy)] mb-2">📋 {t('extractedData')}</h4>
                <div className="space-y-2">
                  {Object.entries(selectedApp.extractedFields).map(([key, { value, confidence }]) => (
                    <div key={key} className={`flex items-center justify-between p-2 rounded border text-xs ${confidence < 70 ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]' : 'border-gray-200'}`}>
                      <div>
                        <span className="text-[var(--color-govt-text-light)] block text-[10px] uppercase">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                      <ConfidenceBadge score={confidence} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility */}
              <div className="mb-4 p-3 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{t('eligibilityScore')}</span>
                  <span className={`text-lg font-bold ${selectedApp.eligibilityScore >= 70 ? 'text-[var(--color-green-govt)]' : 'text-[var(--color-danger)]'}`}>
                    {selectedApp.eligibilityScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${selectedApp.eligibilityScore >= 70 ? 'bg-[var(--color-green-govt)]' : 'bg-[var(--color-danger)]'}`}
                    style={{ width: `${selectedApp.eligibilityScore}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-[var(--color-govt-text)]">📝 {isMarathi ? selectedApp.reasonMarathi : selectedApp.reasonEnglish}</p>
                {selectedApp.alternativeScheme && (
                  <p className="text-xs mt-1 text-[var(--color-saffron)] font-medium">💡 {t('alternativeScheme')}: {selectedApp.alternativeScheme}</p>
                )}
              </div>

              {/* Documents */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[var(--color-navy)] mb-2">📎 {t('documents')}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.documents.map((doc, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">📄 {doc}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t pt-3">
                <button onClick={() => handleAction(selectedApp.id, 'approve', actionLabels.approve)}
                  className="flex-1 bg-[var(--color-green-govt)] text-white py-2 rounded text-sm font-semibold hover:bg-[var(--color-green-govt-dark)]" aria-label={t('approve')}>
                  ✅ {t('approve')}
                </button>
                <button onClick={() => handleAction(selectedApp.id, 'reject', actionLabels.reject)}
                  className="flex-1 bg-[var(--color-danger)] text-white py-2 rounded text-sm font-semibold hover:bg-red-700" aria-label={t('reject')}>
                  ❌ {t('reject')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== GRIEVANCE CONSOLE ========== */}
      {activeTab === 'grievance' && (
        <div className="animate-fade-in space-y-3">
          <h2 className="text-lg font-bold text-[var(--color-navy)] text-left">{t('grievanceConsole')}</h2>
          {grievances.map(g => (
            <div key={g.id} className={`bg-white border rounded p-4 text-left ${g.urgency === 'high' ? 'border-l-4 border-l-[var(--color-danger)]' : 'border-[var(--color-govt-border)]'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs text-[var(--color-govt-text-light)]">{g.id} | {g.date}</span>
                  <p className="font-semibold text-sm">{g.farmerName} – {g.district}</p>
                </div>
                <div className="flex gap-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{isMarathi ? g.category : g.categoryEn}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    g.urgency === 'high' ? 'bg-red-100 text-red-700' :
                    g.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {g.urgency === 'high' ? t('high') : g.urgency === 'medium' ? t('medium') : t('routine')}
                  </span>
                  {sentGrievances[g.id] && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✅ {t('responseSent')}</span>}
                </div>
              </div>
              <p className="text-sm bg-gray-50 p-2 rounded mb-3">{isMarathi ? g.complaint : g.complaintEn}</p>

              {!sentGrievances[g.id] && (
                <>
                  <label className="text-xs font-semibold text-[var(--color-govt-text-light)] block mb-1">{t('aiDraftResponse')} ({isMarathi ? 'संपादन योग्य' : 'editable'}):</label>
                  <textarea
                    value={grievanceResponses[g.id] ?? g.aiDraftResponse}
                    onChange={(e) => setGrievanceResponses(prev => ({ ...prev, [g.id]: e.target.value }))}
                    rows={3}
                    className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[var(--color-saffron)] text-left"
                    aria-label={t('aiDraftResponse')}
                  />
                  <button
                    onClick={() => {
                      setSentGrievances(prev => ({ ...prev, [g.id]: true }));
                      addNotification(isMarathi 
                        ? `SMS शेतकऱ्यांना: ${g.farmerName} यांना तक्रार ${g.id} बद्दल प्रतिसाद पाठवला.`
                        : `SMS to farmer: Response sent to ${g.farmerName} for grievance ${g.id}.`);
                    }}
                    className="bg-[var(--color-green-govt)] text-white text-xs px-4 py-2 rounded hover:bg-[var(--color-green-govt-dark)] font-semibold"
                    aria-label={t('sendResponse')}
                  >
                    📤 {t('sendResponse')}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========== PERFORMANCE ========== */}
      {activeTab === 'performance' && (
        <div className="animate-fade-in text-left">
          <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4">📊 {t('myPerformance')}</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[var(--color-govt-border)] rounded p-4 text-center">
              <p className="text-3xl font-bold text-[var(--color-green-govt)]">{processedToday + 8}</p>
              <p className="text-sm text-[var(--color-govt-text-light)]">{t('processedToday')}</p>
            </div>
            <div className="bg-white border border-[var(--color-govt-border)] rounded p-4 text-center">
              <p className="text-3xl font-bold text-[var(--color-saffron)]">4.2 {t('mins')}</p>
              <p className="text-sm text-[var(--color-govt-text-light)]">{t('avgProcessingTime')}</p>
            </div>
            <div className="bg-white border border-[var(--color-govt-border)] rounded p-4 text-center">
              <p className="text-3xl font-bold text-[var(--color-danger)]">{pendingCount}</p>
              <p className="text-sm text-[var(--color-govt-text-light)]">{t('pendingCount')}</p>
            </div>
          </div>
          <div className="bg-white border border-[var(--color-govt-border)] rounded p-4">
            <h3 className="font-semibold text-sm text-[var(--color-navy)] mb-2">{t('summary')}</h3>
            <p className="text-sm text-[var(--color-govt-text)]">
              {t('performanceSummary')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

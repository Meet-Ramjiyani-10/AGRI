import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { grievances } from '../data/mockData';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ApiStatusFooter from '../components/ApiStatusFooter';
import { mockAapleSarkar, mockMahabhulekh, mockMahaDBT } from '../services/mockApiServices';

export default function OfficerDashboard() {
  const { applications, updateApplicationStatus, addNotification } = useApp();
  const { t, isMarathi } = useLanguage();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedApp, setSelectedApp] = useState(null);
  const [grievanceData, setGrievanceData] = useState(grievances);
  const [landVerification, setLandVerification] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const pendingApps = [...applications]
    .filter((a) => a.status === 'pending_officer')
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      if (riskOrder[a.fraudRisk] !== riskOrder[b.fraudRisk]) return riskOrder[a.fraudRisk] - riskOrder[b.fraudRisk];
      return new Date(a.submittedDate) - new Date(b.submittedDate);
    });

  const processedToday = applications.filter((a) => a.processedDate === new Date().toISOString().split('T')[0]).length;
  const pendingCount = pendingApps.length;
  const pendingGrievances = grievanceData.filter((g) => g.status === 'pending');
  const resolvedGrievances = grievanceData.filter((g) => g.status === 'resolved');

  const actionLabels = {
    approve: 'Approve',
    reject: 'Reject',
    review: 'Review',
  };

  const openDetails = (app) => {
    setSelectedApp(app);
    setLandVerification(null);
    setDetailsLoading(true);
    mockMahabhulekh.verifyLand(app.landId || 'MH12/123', app.farmerNameEn || app.farmerName).then((result) => {
      setLandVerification(result);
    }).finally(() => setDetailsLoading(false));
  };

  const workflowLabel = (status) => {
    const labels = {
      submitted: t('submitted'),
      processing: t('processingStatus'),
      pending_officer: t('officerReview'),
      approved: t('approved'),
      rejected: t('rejected'),
      disbursement: t('disbursement'),
    };
    return labels[status] || status;
  };

  const workflowClass = (status) => {
    if (status === 'approved' || status === 'disbursement') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    if (status === 'pending_officer') return 'bg-blue-100 text-blue-700';
    if (status === 'processing') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  const urgencyClass = (urgency) => {
    if (urgency === 'emergency') return 'bg-red-100 text-red-700';
    if (urgency === 'urgent') return 'bg-orange-100 text-orange-700';
    return 'bg-slate-100 text-slate-700';
  };

  const urgencyLabel = (urgency) => {
    if (urgency === 'emergency') return t('emergency');
    if (urgency === 'urgent') return t('urgent');
    return t('routine');
  };

  const handleAction = (appId, action) => {
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'processing';
    // INTEGRATION ADDITION
    const appData = applications.find((a) => a.id === appId);
    const actionPromise = action === 'approve'
      ? mockMahaDBT.submitApplication({ applicationId: appId, ...appData })
      : Promise.resolve({ applicationId: appId });
    actionPromise.then((res) => {
      updateApplicationStatus(appId, status, actionLabels[action]);
      addNotification(
        isMarathi
          ? `SMS: अर्ज ${res.applicationId} ${action === 'approve' ? 'मंजूर' : action === 'reject' ? 'नाकारला' : 'पुनरावलोकनात'} गेला.`
          : `SMS: Application ${res.applicationId} ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'moved to review'}.`,
        action === 'reject' ? 'error' : 'success'
      );
      if (selectedApp?.id === appId) setSelectedApp(null);
    });
  };

  const handleSendResponse = (grievanceId) => {
    // INTEGRATION ADDITION
    mockAapleSarkar.getStatus(grievanceId).then(() => {
      setGrievanceData((prev) =>
        prev.map((g) => (g.id === grievanceId ? { ...g, status: 'resolved' } : g))
      );
      addNotification(isMarathi ? `✅ तक्रार ${grievanceId} निकाली काढली.` : `✅ Grievance ${grievanceId} resolved.`, 'success');
    });
  };

  const tabs = [
    { key: 'queue', labelKey: 'applicationQueue', icon: '📋', count: pendingCount },
    { key: 'grievance', labelKey: 'grievanceConsole', icon: '📢', count: pendingGrievances.length },
    { key: 'performance', labelKey: 'myPerformance', icon: '📊' },
  ];

  const fieldLabels = {
    name: t('name'),
    aadhaar: t('aadhaarNumber'),
    landArea: t('landArea'),
    bankAccount: isMarathi ? 'बँक खाते' : 'Bank Account',
    ifsc: 'IFSC',
    address: t('village'),
    cropType: t('cropType'),
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center bg-[var(--color-govt-bg)]">
      <div className="w-full max-w-[1200px] px-4 py-6">
        {/* Main content card */}
        <div className="bg-white border border-[var(--color-govt-border)] rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex gap-1 mb-6 bg-gray-50 rounded border border-[var(--color-govt-border)] overflow-hidden" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.key ? 'bg-[var(--color-saffron)] text-white' : 'text-[var(--color-govt-text)] hover:bg-gray-50'
            }`}
          >
            {tab.icon} {t(tab.labelKey)}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white text-[var(--color-saffron)]' : 'bg-[var(--color-danger)] text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
          </div>

          {activeTab === 'queue' && (
            <div className="flex gap-4 animate-fade-in">
              <div className={`${selectedApp ? 'w-1/2' : 'w-full max-w-5xl mx-auto'} space-y-4 transition-all`}>
                <h2 className="text-xl font-bold text-[var(--color-navy)] mb-4 text-center border-b pb-2">{t('pendingApplications')} ({pendingCount})</h2>
                {pendingApps.length === 0 ? (
                  <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-8 text-center text-[var(--color-govt-text-light)]">✅ {t('allProcessed')}</div>
                ) : (
                  pendingApps.map((app) => (
                    <div
                      key={app.id}
                      className={`bg-gray-50 border rounded p-4 cursor-pointer transition-all hover:shadow text-left ${
                        app.fraudRisk === 'high'
                          ? 'border-[var(--color-danger)] border-l-4'
                          : app.fraudRisk === 'medium'
                            ? 'border-[var(--color-warning)] border-l-4'
                            : 'border-[var(--color-govt-border)]'
                      } ${selectedApp?.id === app.id ? 'ring-2 ring-[var(--color-saffron)]' : ''}`}
                      onClick={() => openDetails(app)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm">{isMarathi ? app.farmerName : app.farmerNameEn}</p>
                          <p className="text-xs text-[var(--color-govt-text-light)] mt-0.5">{app.id} | {isMarathi ? app.schemeMarathi : app.scheme} | {app.village}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${workflowClass(app.status)}`}>
                            {t('workflowStatus')}: {workflowLabel(app.status)}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            app.aiRecommendation === 'approve'
                              ? 'bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)]'
                              : app.aiRecommendation === 'reject'
                                ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'
                                : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                          }`}>
                            AI: {app.aiRecommendation} ({app.confidence}%)
                          </span>
                        </div>
                      </div>
                      <p className="text-xs mt-2 text-[var(--color-govt-text)] italic">📝 {isMarathi ? app.reasonMarathi : app.reasonEnglish}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(app.id, 'approve'); }}
                          className="flex-1 bg-[var(--color-green-govt)] text-white text-xs py-2 rounded hover:bg-[var(--color-green-govt-dark)] font-semibold"
                        >
                          ✅ {t('approve')}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(app.id, 'reject'); }}
                          className="flex-1 bg-[var(--color-danger)] text-white text-xs py-2 rounded hover:bg-red-700 font-semibold"
                        >
                          ❌ {t('reject')}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(app.id, 'review'); }}
                          className="flex-1 bg-[var(--color-saffron)] text-white text-xs py-2 rounded hover:bg-[var(--color-saffron-dark)] font-semibold"
                        >
                          🟧 {t('review')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetails(app);
                          }}
                          className="flex-1 bg-[var(--color-saffron)] text-white text-xs py-2 rounded hover:bg-[var(--color-saffron-dark)] font-semibold"
                        >
                          🔍 {t('viewDetails')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedApp && (
                <div className="w-1/2 bg-white border border-[var(--color-govt-border)] rounded p-4 sticky top-4 self-start animate-slide-in max-h-[calc(100vh-120px)] overflow-y-auto text-left">
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                    <h3 className="font-bold text-[var(--color-navy)]">{t('applicationDetails')}</h3>
                    <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>

                  {/* Demo: in production, OCR + NER model outputs (Tesseract/PaddleOCR + LLM extraction) populate these fields */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div><span className="text-[var(--color-govt-text-light)]">{t('applicationId')}:</span><br /><strong>{selectedApp.id}</strong></div>
                    <div><span className="text-[var(--color-govt-text-light)]">{t('farmerName')}:</span><br /><strong>{isMarathi ? selectedApp.farmerName : selectedApp.farmerNameEn}</strong></div>
                    <div><span className="text-[var(--color-govt-text-light)]">{t('scheme')}:</span><br /><strong>{isMarathi ? selectedApp.schemeMarathi : selectedApp.scheme}</strong></div>
                    <div><span className="text-[var(--color-govt-text-light)]">{t('submissionDate')}:</span><br /><strong>{selectedApp.submittedDate}</strong></div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-[var(--color-navy)] mb-2">📋 {t('extractedData')}</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedApp.extractedFields).map(([key, { value, confidence }]) => (
                        <div
                          key={key}
                          className={`p-2 rounded border text-xs ${confidence < 70 ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[var(--color-govt-text-light)] block text-[10px] uppercase">{fieldLabels[key] || key}</span>
                              <span className="font-medium">{value}</span>
                            </div>
                            <ConfidenceBadge score={confidence} />
                          </div>
                          {confidence < 70 && (
                            <p className="text-[11px] mt-1 font-semibold text-orange-700">⚠️ {t('manualReviewRecommended')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* INTEGRATION ADDITION */}
                  <div className="mb-4 border rounded p-3 bg-gray-50">
                    <h4 className="text-sm font-bold text-[var(--color-navy)] mb-1">Mahabhulekh Verification</h4>
                    {detailsLoading ? (
                      <p className="text-xs text-gray-500">Verifying land record...</p>
                    ) : !landVerification ? (
                      <p className="text-xs text-gray-500">No verification data</p>
                    ) : landVerification.isValid ? (
                      <p className="text-xs text-green-700">✅ Valid | Area: {landVerification.landArea} acres | Confidence: {(landVerification.confidence * 100).toFixed(0)}%</p>
                    ) : (
                      <p className="text-xs text-red-700">❌ Invalid | {landVerification.reason}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-[var(--color-navy)] mb-2">🖼️ {t('documentPreview')}</h4>
                    <div className="border rounded p-2 bg-gray-50">
                      <div className="w-full h-44 rounded border border-gray-200 bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold">
                        7/12 Record Preview
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t pt-3">
                    <button
                      onClick={() => handleAction(selectedApp.id, 'approve')}
                      className="flex-1 bg-[var(--color-green-govt)] text-white py-2 rounded text-sm font-semibold hover:bg-[var(--color-green-govt-dark)]"
                    >
                      ✅ {t('approve')}
                    </button>
                    <button
                      onClick={() => handleAction(selectedApp.id, 'reject')}
                      className="flex-1 bg-[var(--color-danger)] text-white py-2 rounded text-sm font-semibold hover:bg-red-700"
                    >
                      ❌ {t('reject')}
                    </button>
                    <button
                      onClick={() => handleAction(selectedApp.id, 'review')}
                      className="flex-1 bg-[var(--color-saffron)] text-white py-2 rounded text-sm font-semibold hover:bg-[var(--color-saffron-dark)]"
                    >
                      🟧 {t('review')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grievance' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 text-center border-b pb-2">{t('grievanceConsole')} (तक्रारी)</h2>
              <div className="max-w-4xl mx-auto space-y-5">
              {pendingGrievances.map((g) => (
                <div
                  key={g.id}
                  className={`bg-gray-50 border rounded p-4 text-left ${
                    g.urgency === 'emergency' ? 'border-l-4 border-l-red-600' : g.urgency === 'urgent' ? 'border-l-4 border-l-orange-500' : 'border-[var(--color-govt-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs text-[var(--color-govt-text-light)]">{g.id} | {g.date}</span>
                      <p className="font-semibold text-sm">{g.farmerName} – {g.district}</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{isMarathi ? g.category : g.categoryEn}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${urgencyClass(g.urgency)}`}>{urgencyLabel(g.urgency)}</span>
                    </div>
                  </div>
                  <p className="text-sm bg-white p-2 rounded mb-3 border">{isMarathi ? g.complaint : g.complaintEn}</p>
                  {/* Demo: In production, this draft comes from an LLM with safety + policy checks */}
                  <label className="text-xs font-semibold text-[var(--color-govt-text-light)] block mb-1">{t('aiDraftResponse')}:</label>
                  <textarea
                    value={g.aiDraftResponse}
                    onChange={(e) => setGrievanceData((prev) => prev.map((item) => (item.id === g.id ? { ...item, aiDraftResponse: e.target.value } : item)))}
                    rows={3}
                    className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[var(--color-saffron)] text-left bg-white"
                  />
                  <button
                    onClick={() => handleSendResponse(g.id)}
                    className="bg-[var(--color-green-govt)] text-white text-xs px-4 py-2 rounded hover:bg-[var(--color-green-govt-dark)] font-semibold"
                  >
                    📤 {t('sendResponse')}
                  </button>
                </div>
              ))}
              {resolvedGrievances.length > 0 && (
                <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-4">
                  <h3 className="font-semibold text-sm mb-2 text-center border-b pb-1">✅ {t('resolved')} ({resolvedGrievances.length})</h3>
                  <div className="space-y-2">
                    {resolvedGrievances.map((g) => (
                      <div key={g.id} className="text-xs p-2 rounded bg-green-50 border border-green-200 text-center">
                        {g.id} - {g.farmerName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 text-center border-b pb-2">📊 {t('myPerformance')}</h2>
              <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white border border-[var(--color-govt-border)] rounded-lg shadow-sm p-6 text-center">
                  <p className="text-4xl font-bold text-[var(--color-green-govt)] mb-2">{processedToday + 8}</p>
                  <p className="text-sm font-semibold text-[var(--color-govt-text-light)]">{t('processedToday')}</p>
                </div>
                <div className="bg-white border border-[var(--color-govt-border)] rounded-lg shadow-sm p-6 text-center">
                  <p className="text-4xl font-bold text-[var(--color-saffron)] mb-2">4.2 {t('mins')}</p>
                  <p className="text-sm font-semibold text-[var(--color-govt-text-light)]">{t('avgProcessingTime')}</p>
                </div>
                <div className="bg-white border border-[var(--color-govt-border)] rounded-lg shadow-sm p-6 text-center">
                  <p className="text-4xl font-bold text-[var(--color-danger)] mb-2">{pendingCount}</p>
                  <p className="text-sm font-semibold text-[var(--color-govt-text-light)]">{t('pendingCount')}</p>
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

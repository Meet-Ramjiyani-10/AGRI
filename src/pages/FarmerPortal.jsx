import { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { schemes, applications } from '../data/mockData';
import StatusTracker from '../components/StatusTracker';
import ConfidenceBadge from '../components/ConfidenceBadge';
import LoadingMessages from '../components/LoadingMessages';
import { saveOfflineApplication } from '../utils/offlineStorage';
import { mockAapleSarkar, mockMahaDBT } from '../services/mockApiServices';

export default function FarmerPortal() {
  const { offlineMode, setOfflineMode, addNotification, apiMode } = useApp();
  const { t, isMarathi } = useLanguage();
  const [activeTab, setActiveTab] = useState('apply');
  const [selectedScheme, setSelectedScheme] = useState('');
  const [formData, setFormData] = useState({ name: '', aadhaar: '', mobile: '', village: '', landArea: '', cropType: '' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('mr-IN');
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastApplicationId, setLastApplicationId] = useState('');
  const [grievanceTrackingId, setGrievanceTrackingId] = useState('');
  const [schemeOptions, setSchemeOptions] = useState([]);
  const [isFetchingSchemes, setIsFetchingSchemes] = useState(false);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState(false);
  const fileInputRef = useRef(null);

  const fetchSchemes = async () => {
    try {
      setIsFetchingSchemes(true);
      const list = await mockMahaDBT.getSchemes();
      setSchemeOptions(list);
      addNotification(`✅ ${list.length} schemes fetched from ${apiMode === 'mock' ? 'MOCK' : 'PRODUCTION'} gateway.`, 'info');
    } finally {
      setIsFetchingSchemes(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const extractedData = {
    name: { value: formData.name || 'विशाल पवार', confidence: 98 },
    aadhaar: { value: formData.aadhaar || '9876-5432-1098', confidence: 97 },
    landArea: { value: `${formData.landArea || '3.5'} ${isMarathi ? 'एकर' : 'acres'}`, confidence: 91 },
    village: { value: formData.village || 'शिरूर, पुणे', confidence: 89 },
    cropType: { value: formData.cropType || (isMarathi ? 'गहू' : 'Wheat'), confidence: 85 },
  };

  const fieldLabels = {
    name: t('name'),
    aadhaar: t('aadhaarNumber'),
    landArea: t('landArea'),
    village: t('village'),
    cropType: t('cropType'),
  };

  const scheme = schemes.find((s) => s.id === selectedScheme);
  const landNum = parseFloat(formData.landArea) || 3.5;
  const isEligible = !scheme?.maxLand || landNum <= scheme.maxLand;
  const eligibilityScore = isEligible ? 91 : 42;

  const handleFileUpload = (files) => {
    const fileList = Array.from(files || []);
    setUploadedFiles((prev) => [...prev, ...fileList.map((f) => f.name)]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const validateApplication = () => {
    const required = ['name', 'aadhaar', 'mobile', 'village', 'landArea', 'cropType'];
    const missing = required.find((k) => !String(formData[k] || '').trim());
    if (missing || !selectedScheme || uploadedFiles.length === 0) {
      addNotification(isMarathi ? 'कृपया सर्व आवश्यक माहिती भरा आणि कागदपत्रे अपलोड करा.' : 'Please fill all required fields and upload documents.');
      return false;
    }
    const mobileOk = /^\d{10}$/.test(formData.mobile);
    if (!mobileOk) {
      addNotification(isMarathi ? 'मोबाईल क्रमांक 10 अंकी असावा.' : 'Mobile Number must be 10 digits.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateApplication()) return;
    if (offlineMode) {
      await saveOfflineApplication({ ...formData, scheme: selectedScheme, files: uploadedFiles, timestamp: Date.now() });
      setOfflineSaved(true);
      addNotification(t('savedLocally'));
      return;
    }
    const generatedId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      setIsSubmittingApp(true);
      const submitResponse = await mockMahaDBT.submitApplication({ applicationId: generatedId, ...formData });
      setLastApplicationId(submitResponse.applicationId);
      setIsProcessing(true);
      setProcessingComplete(false);
      setShowEligibility(false);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleProcessingComplete = () => {
    setProcessingComplete(true);
    setTimeout(() => {
      setShowEligibility(true);
      alert(`${t('applicationIdGenerated')}: ${lastApplicationId}. ${t('saveForTracking')}\n📱 SMS sent to farmer: Your application has been submitted successfully.`);
      addNotification(isMarathi ? `SMS: अर्ज ${lastApplicationId} यशस्वीरित्या सादर.` : `SMS: Application ${lastApplicationId} submitted successfully.`, 'success');
    }, 500);
  };

  const handleVoiceInput = () => {
    const SampleFallback = 'माझा पीक विमा दावा 3 महिन्यांपासून प्रलंबित आहे.';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setGrievanceText(SampleFallback);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      setGrievanceText(transcript || SampleFallback);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setGrievanceText(SampleFallback);
    };
    recognition.start();
  };

  const handleGrievanceSubmit = () => {
    if (!grievanceText.trim()) return;
    setIsSubmittingGrievance(true);
    mockAapleSarkar.submitGrievance(grievanceText, formData.aadhaar || 'FARMER-001').then((resp) => {
      setGrievanceSubmitted(true);
      setGrievanceTrackingId(resp.trackingId);
      addNotification(isMarathi ? `SMS: तक्रार ${resp.trackingId} नोंदवली.` : `SMS: Grievance ${resp.trackingId} submitted successfully.`, 'success');
    }).finally(() => setIsSubmittingGrievance(false));
  };

  const tabs = [
    { key: 'apply', labelKey: 'newApplication', icon: '📋' },
    { key: 'status', labelKey: 'applicationStatus', icon: '📊' },
    { key: 'grievance', labelKey: 'fileGrievance', icon: '📢' },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex justify-center bg-[var(--color-govt-bg)]">
      <div className="w-full max-w-[1200px] px-4 py-6">
        {/* Main content card */}
        <div className="bg-white border border-[var(--color-govt-border)] rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex gap-1 mb-6 bg-gray-50 rounded border border-[var(--color-govt-border)] overflow-hidden" role="tablist">
            {tabs.map((item) => (
              <button
                key={item.key}
                role="tab"
                aria-selected={activeTab === item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === item.key ? 'bg-[var(--color-saffron)] text-white' : 'text-[var(--color-govt-text)] hover:bg-gray-50'}`}
              >
                {item.icon} {t(item.labelKey)}
              </button>
            ))}
          </div>

          {activeTab === 'apply' && (
            <div className="animate-fade-in">
              <div className="bg-gray-50 border border-[var(--color-govt-border)] rounded p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{offlineMode ? '📴' : '🌐'}</span>
                  <span className="text-sm font-medium">{t('offlineMode')}</span>
                  <span className="text-xs text-[var(--color-govt-text-light)]">{t('offlineModeDesc')}</span>
                </div>
                <button
                  onClick={() => { setOfflineMode(!offlineMode); setOfflineSaved(false); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${offlineMode ? 'bg-[var(--color-saffron)]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${offlineMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {offlineSaved && <div className="bg-[var(--color-saffron-light)] border border-[var(--color-saffron)] rounded p-3 mb-4 text-sm">📴 {t('savedLocally')}</div>}

              {!isProcessing ? (
                <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 text-center border-b border-[var(--color-govt-border)] pb-2">{t('newApplication')}</h2>

                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-sm font-semibold text-left">{t('selectScheme')} *</label>
                      <button
                        type="button"
                        onClick={fetchSchemes}
                        disabled={isFetchingSchemes}
                    className="text-xs px-2 py-1 rounded bg-[var(--color-saffron)] text-white disabled:opacity-50"
                  >
                    {isFetchingSchemes ? '...' : 'Fetch Schemes'}
                  </button>
                </div>
                <select value={selectedScheme} onChange={(e) => setSelectedScheme(e.target.value)} className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm text-left" required>
                  <option value="">-- {t('selectScheme')} --</option>
                  {(schemeOptions.length ? schemeOptions : schemes).map((s) => (
                    <option key={s.id} value={s.id}>{isMarathi ? (s.nameMarathi || s.name) : s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-left">{t('farmerName')} *</label>
                  <input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-left">{t('aadhaarNumber')} *</label>
                  <input value={formData.aadhaar} onChange={(e) => setFormData((p) => ({ ...p, aadhaar: e.target.value }))} className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-left">{t('mobileNumber')} *</label>
                  <input value={formData.mobile} onChange={(e) => setFormData((p) => ({ ...p, mobile: e.target.value }))} className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-left">{t('village')} *</label>
                  <input value={formData.village} onChange={(e) => setFormData((p) => ({ ...p, village: e.target.value }))} className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-left">{t('landArea')} *</label>
                  <input type="number" step="0.1" value={formData.landArea} onChange={(e) => setFormData((p) => ({ ...p, landArea: e.target.value }))} className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-left">{t('cropType')} *</label>
                  <input value={formData.cropType} onChange={(e) => setFormData((p) => ({ ...p, cropType: e.target.value }))} className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm" required />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-left">{t('uploadDocuments')} *</label>
                <div
                  className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${dragOver ? 'border-[var(--color-saffron)] bg-[var(--color-saffron-light)]' : 'border-[var(--color-govt-border)]'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
                  <p className="text-sm">{t('dragDropFiles')}</p>
                  <p className="text-xs text-[var(--color-govt-text-light)]">{t('acceptedFormats')}</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedFiles.map((f, i) => <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">📄 {f}</span>)}
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmittingApp} className="w-full bg-[var(--color-green-govt)] text-white py-3 rounded font-semibold text-sm hover:bg-[var(--color-green-govt-dark)] disabled:opacity-60">
                {isSubmittingApp ? 'Submitting...' : `${t('submit')} →`}
              </button>
            </form>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 text-center">
              <LoadingMessages onComplete={handleProcessingComplete} />
              {processingComplete && (
                <div className="bg-white border border-[var(--color-govt-border)] rounded p-4 animate-fade-in text-left">
                  <h3 className="font-bold text-[var(--color-navy)] mb-3 text-lg border-b pb-2 text-center">📋 {t('extractedData')}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(extractedData).map(([key, { value, confidence }]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded border text-left border-gray-200">
                        <div>
                          <span className="text-xs text-[var(--color-govt-text-light)] block">{fieldLabels[key] || key}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                        <ConfidenceBadge score={confidence} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showEligibility && (
                <div className={`border rounded p-4 text-center ${isEligible ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                  <h3 className="font-bold text-lg mb-2">{isEligible ? `✅ ${t('eligible')}` : `❌ ${t('ineligible')}`}</h3>
                  <p className="text-sm">{t('eligibilityScore')}: {`${eligibilityScore}/100`}</p>
                  <div className="mt-3"><StatusTracker currentStatus="submitted" /></div>
                </div>
              )}
            </div>
          )}
        </div>
          )}

          {activeTab === 'status' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 border-b pb-2 text-center">📊 {isMarathi ? 'माझ्या अर्जांची स्थिती' : 'My Application Status'}</h2>
              <div className="max-w-4xl mx-auto space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded p-4 mb-3 text-left bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs text-[var(--color-govt-text-light)]">{t('applicationId')}:</span>
                      <span className="font-mono font-bold text-sm ml-1">{app.id}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {app.status === 'approved' ? t('approved') : app.status === 'rejected' ? t('rejected') : t('pending')}
                    </span>
                  </div>
                  <StatusTracker currentStatus={app.status === 'approved' ? 'disbursement' : app.status} />
                </div>
              ))}
              </div>
            </div>
          )}

          {activeTab === 'grievance' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6 border-b pb-2 text-center">📢 {t('fileGrievance')}</h2>
              <div className="max-w-4xl mx-auto">
              {!grievanceSubmitted ? (
                <div className="text-left">
                  <label className="block text-sm font-semibold mb-1">{t('grievanceText')} *</label>
                  <textarea
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder={isMarathi ? 'आपली तक्रार मराठीत लिहा...' : 'Write your grievance...'}
                    rows={4}
                    className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs text-[var(--color-govt-text-light)]">{t('chooseLanguageForVoice')}:</label>
                    <select value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)} className="text-xs border border-[var(--color-govt-border)] rounded px-2 py-1">
                      <option value="mr-IN">{t('marathi')}</option>
                      <option value="hi-IN">{t('hindi')}</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`px-3 py-2 rounded text-sm font-semibold ${isListening ? 'bg-red-600 text-white' : 'bg-[var(--color-saffron)] text-white'}`}
                    >
                      🎤 {t('speakComplaint')}
                    </button>
                  </div>
                  <button
                    onClick={handleGrievanceSubmit}
                    disabled={!grievanceText.trim() || isSubmittingGrievance}
                    className="mt-4 bg-[var(--color-saffron)] text-white px-6 py-2.5 rounded font-semibold text-sm disabled:opacity-50"
                  >
                    {isSubmittingGrievance ? 'Submitting...' : t('submitGrievance')}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-500 rounded p-4 text-center">
                  <h3 className="font-bold text-green-700 mb-2 text-lg">✅ {t('grievanceSubmitted')}</h3>
                  <p className="text-sm font-mono">{grievanceTrackingId || 'GRV-2026-NEW'}</p>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

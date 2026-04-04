import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { schemes, applications } from '../data/mockData';
import StatusTracker from '../components/StatusTracker';
import ConfidenceBadge from '../components/ConfidenceBadge';
import LoadingMessages from '../components/LoadingMessages';
import { saveOfflineApplication } from '../utils/offlineStorage';

export default function FarmerPortal() {
  const { offlineMode, setOfflineMode, addNotification } = useApp();
  const { t, language, isMarathi } = useLanguage();
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
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Simulated extracted data for demo
  const extractedData = {
    name: { value: formData.name || 'विशाल पवार', confidence: 98 },
    aadhaar: { value: formData.aadhaar || '9876-5432-1098', confidence: 97 },
    landArea: { value: (formData.landArea || '3.5') + (isMarathi ? ' एकर' : ' acres'), confidence: 91 },
    village: { value: formData.village || 'शिरूर, पुणे', confidence: 89 },
    cropType: { value: formData.cropType || (isMarathi ? 'गहू' : 'Wheat'), confidence: 85 },
  };

  // Field labels based on language
  const fieldLabels = {
    name: t('name'),
    aadhaar: t('aadhaarNumber'),
    landArea: t('landArea'),
    village: t('village'),
    cropType: t('cropType'),
  };

  const scheme = schemes.find(s => s.id === selectedScheme);
  const landNum = parseFloat(formData.landArea) || 3.5;
  const isEligible = !scheme?.maxLand || landNum <= scheme.maxLand;
  const eligibilityScore = isEligible ? Math.floor(80 + Math.random() * 15) : Math.floor(20 + Math.random() * 25);

  const handleFileUpload = (files) => {
    const fileList = Array.from(files);
    setUploadedFiles(prev => [...prev, ...fileList.map(f => f.name)]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (offlineMode) {
      try {
        await saveOfflineApplication({ ...formData, scheme: selectedScheme, files: uploadedFiles, timestamp: Date.now() });
        setOfflineSaved(true);
        addNotification(isMarathi 
          ? 'ऑफलाइन सेव्ह: आपला अर्ज स्थानिक पातळीवर जतन केला आहे. इंटरनेट उपलब्ध झाल्यावर स्वयंचलित सिंक होईल.'
          : 'Offline saved: Your application has been saved locally. It will sync automatically when internet is available.');
      } catch (err) {
        console.error(err);
      }
      return;
    }
    setIsProcessing(true);
    setProcessingComplete(false);
    setShowEligibility(false);
  };

  const handleProcessingComplete = () => {
    setProcessingComplete(true);
    setTimeout(() => setShowEligibility(true), 500);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Fallback demo text
      setGrievanceText(isMarathi 
        ? 'माझा पीक विमा दावा 3 महिन्यांपासून प्रलंबित आहे. कृपया तातडीने कार्यवाही करा.'
        : 'My crop insurance claim has been pending for 3 months. Please take immediate action.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'mr-IN'; // Always Marathi for speech recognition
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setGrievanceText(prev => prev + ' ' + transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      // Fallback demo text
      setGrievanceText(isMarathi 
        ? 'माझा पीक विमा दावा 3 महिन्यांपासून प्रलंबित आहे. कृपया तातडीने कार्यवाही करा.'
        : 'My crop insurance claim has been pending for 3 months. Please take immediate action.');
    };
    recognition.start();
  };

  const handleGrievanceSubmit = () => {
    setGrievanceSubmitted(true);
    addNotification(isMarathi 
      ? 'SMS: आपली तक्रार (GRV-2026-NEW) नोंदवली गेली आहे. 48 तासांत प्रतिसाद मिळेल.'
      : 'SMS: Your grievance (GRV-2026-NEW) has been registered. Response within 48 hours.');
  };

  const tabs = [
    { key: 'apply', labelKey: 'newApplication', icon: '📋' },
    { key: 'status', labelKey: 'applicationStatus', icon: '📊' },
    { key: 'grievance', labelKey: 'fileGrievance', icon: '📢' },
  ];

  // Form field definitions
  const formFields = [
    { key: 'name', labelKey: 'farmerName', placeholder: isMarathi ? 'पूर्ण नाव लिहा' : 'Enter full name', type: 'text' },
    { key: 'aadhaar', labelKey: 'aadhaarNumber', placeholder: 'XXXX-XXXX-XXXX', type: 'text' },
    { key: 'mobile', labelKey: 'mobileNumber', placeholder: '98XXXXXXXX', type: 'tel' },
    { key: 'village', labelKey: 'village', placeholder: isMarathi ? 'गाव, तालुका' : 'Village, Taluka', type: 'text' },
    { key: 'landArea', labelKey: 'landArea', placeholder: isMarathi ? 'उदा. 3.5' : 'e.g. 3.5', type: 'number' },
    { key: 'cropType', labelKey: 'cropType', placeholder: isMarathi ? 'उदा. गहू, ऊस' : 'e.g. Wheat, Sugarcane', type: 'text' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded border border-[var(--color-govt-border)] overflow-hidden" role="tablist">
        {tabs.map(t_item => (
          <button
            key={t_item.key}
            role="tab"
            aria-selected={activeTab === t_item.key}
            aria-label={t(t_item.labelKey)}
            onClick={() => setActiveTab(t_item.key)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === t_item.key
                ? 'bg-[var(--color-saffron)] text-white'
                : 'text-[var(--color-govt-text)] hover:bg-gray-50'
            }`}
          >
            {t_item.icon} {t(t_item.labelKey)}
          </button>
        ))}
      </div>

      {/* ========== APPLY TAB ========== */}
      {activeTab === 'apply' && (
        <div className="animate-fade-in">
          {/* Offline toggle */}
          <div className="bg-white border border-[var(--color-govt-border)] rounded p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{offlineMode ? '📴' : '🌐'}</span>
              <span className="text-sm font-medium">{t('offlineMode')}</span>
              <span className="text-xs text-[var(--color-govt-text-light)]">{t('offlineModeDesc')}</span>
            </div>
            <button
              onClick={() => { setOfflineMode(!offlineMode); setOfflineSaved(false); }}
              className={`relative w-12 h-6 rounded-full transition-colors ${offlineMode ? 'bg-[var(--color-saffron)]' : 'bg-gray-300'}`}
              aria-label={t('offlineMode')}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${offlineMode ? 'translate-x-6' : 'translate-x-0.5'}`}></span>
            </button>
          </div>

          {offlineSaved && (
            <div className="bg-[var(--color-saffron-light)] border border-[var(--color-saffron)] text-[var(--color-saffron-dark)] rounded p-3 mb-4 text-sm" role="alert">
              📴 {t('savedLocally')}
            </div>
          )}

          {!isProcessing ? (
            <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-govt-border)] rounded p-6">
              <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4 border-b border-[var(--color-govt-border)] pb-2">
                {t('newApplication')}
              </h2>

              {/* Scheme selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--color-govt-text)] mb-1 text-left" htmlFor="scheme-select">
                  {t('selectScheme')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="scheme-select"
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  required
                  className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-saffron)] text-left"
                  aria-label={t('selectScheme')}
                >
                  <option value="">-- {t('selectScheme')} --</option>
                  {schemes.map(s => (
                    <option key={s.id} value={s.id}>{isMarathi ? s.nameMarathi : s.name} ({isMarathi ? s.name : s.nameMarathi})</option>
                  ))}
                </select>
              </div>

              {/* Form fields 2-column */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {formFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-[var(--color-govt-text)] mb-1 text-left" htmlFor={`field-${field.key}`}>
                      {t(field.labelKey)} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`field-${field.key}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required
                      className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-saffron)] text-left"
                      step={field.type === 'number' ? '0.1' : undefined}
                      aria-label={t(field.labelKey)}
                    />
                  </div>
                ))}
              </div>

              {/* Document upload */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--color-govt-text)] mb-1 text-left">
                  {t('uploadDocuments')} <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-[var(--color-saffron)] bg-[var(--color-saffron-light)]' : 'border-[var(--color-govt-border)] hover:border-[var(--color-saffron)]'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  aria-label={t('dragDropFiles')}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm text-[var(--color-govt-text)]">{t('dragDropFiles')}</p>
                  <p className="text-xs text-[var(--color-govt-text-light)] mt-1">{t('acceptedFormats')}</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)] text-xs px-2 py-1 rounded">
                        📄 {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--color-green-govt)] text-white py-3 rounded font-semibold text-sm hover:bg-[var(--color-green-govt-dark)] transition-colors"
                aria-label={t('submit')}
              >
                {t('submit')} →
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Processing */}
              <LoadingMessages onComplete={handleProcessingComplete} language={language} />

              {/* Extracted fields */}
              {processingComplete && (
                <div className="bg-white border border-[var(--color-govt-border)] rounded p-4 animate-fade-in">
                  <h3 className="font-bold text-[var(--color-navy)] mb-3 text-sm border-b pb-2 text-left">📋 {t('extractedData')}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(extractedData).map(([key, { value, confidence }]) => (
                      <div key={key} className={`flex items-center justify-between p-2 rounded border text-left ${confidence < 70 ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]' : 'border-gray-200'}`}>
                        <div>
                          <span className="text-xs text-[var(--color-govt-text-light)] block">
                            {fieldLabels[key] || key}
                          </span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                        <ConfidenceBadge score={confidence} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility result */}
              {showEligibility && (
                <div className={`border rounded p-4 animate-fade-in text-left ${isEligible ? 'bg-[var(--color-green-govt-light)] border-[var(--color-green-govt)]' : 'bg-[var(--color-danger-light)] border-[var(--color-danger)]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm">{isEligible ? `✅ ${t('eligible')}` : `❌ ${t('ineligible')}`}</h3>
                    <span className={`text-lg font-bold ${isEligible ? 'text-[var(--color-green-govt)]' : 'text-[var(--color-danger)]'}`}>
                      {t('eligibilityScore')}: {eligibilityScore}/100
                    </span>
                  </div>
                  <p className="text-sm">
                    {isEligible
                      ? (isMarathi 
                          ? `सर्व कागदपत्रे सत्यापित. शेतकरी ${scheme?.nameMarathi || 'या योजने'}साठी पात्र आहे.`
                          : `All documents verified. Farmer is eligible for ${scheme?.name || 'this scheme'}.`)
                      : (isMarathi
                          ? `शेतकऱ्याचे क्षेत्र (${formData.landArea || '6.2'} एकर) पात्रता मर्यादा (${scheme?.maxLand || 5} एकर) पेक्षा जास्त आहे.`
                          : `Farmer's land area (${formData.landArea || '6.2'} acres) exceeds the eligibility limit (${scheme?.maxLand || 5} acres).`)}
                  </p>
                  {!isEligible && (
                    <p className="text-sm mt-2 font-medium">💡 {t('alternativeScheme')}: {isMarathi ? 'सोलर पंप योजना, मुख्यमंत्री सौर कृषी योजना' : 'Solar Pump Scheme, Mukhyamantri Saur Krishi Yojana'}</p>
                  )}
                  <div className="mt-3">
                    <StatusTracker currentStatus="processing" language={language} />
                  </div>
                  <button
                    onClick={() => {
                      addNotification(isMarathi
                        ? `SMS: आपला अर्ज #APP-2026-NEW सादर झाला आहे. स्थिती: प्रक्रिया सुरू.`
                        : `SMS: Your application #APP-2026-NEW has been submitted. Status: Processing.`);
                    }}
                    className="mt-2 text-xs bg-[var(--color-saffron)] text-white px-4 py-2 rounded hover:bg-[var(--color-saffron-dark)]"
                  >
                    📱 {isMarathi ? 'SMS सूचना पाठवा (सिम्युलेशन)' : 'Send SMS notification (simulation)'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== STATUS TAB ========== */}
      {activeTab === 'status' && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-white border border-[var(--color-govt-border)] rounded p-4">
            <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4 border-b pb-2 text-left">📊 {isMarathi ? 'माझ्या अर्जांची स्थिती' : 'My Application Status'}</h2>
            {applications.map(app => (
              <div key={app.id} className="border border-gray-200 rounded p-4 mb-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs text-[var(--color-govt-text-light)]">{t('applicationId')}:</span>
                    <span className="font-mono font-bold text-sm ml-1">{app.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[var(--color-navy-light)] text-[var(--color-navy)] px-2 py-0.5 rounded">
                      {isMarathi ? app.schemeMarathi : app.scheme}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      app.status === 'approved' ? 'bg-[var(--color-green-govt-light)] text-[var(--color-green-govt)]' :
                      app.status === 'rejected' ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' :
                      'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                    }`}>
                      {app.status === 'approved' ? t('approved') : app.status === 'rejected' ? t('rejected') : t('pending')}
                    </span>
                  </div>
                </div>
                <StatusTracker currentStatus={app.status} language={language} />
                <div className="flex flex-wrap gap-4 text-xs text-[var(--color-govt-text-light)] mt-2">
                  <span>📅 {isMarathi ? 'सादर' : 'Submitted'}: {app.submittedDate}</span>
                  {app.processedDate && <span>✅ {isMarathi ? 'प्रक्रिया' : 'Processed'}: {app.processedDate}</span>}
                  <span>📐 {t('area')}: {app.landArea} {t('acres')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== GRIEVANCE TAB ========== */}
      {activeTab === 'grievance' && (
        <div className="animate-fade-in">
          <div className="bg-white border border-[var(--color-govt-border)] rounded p-6">
            <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4 border-b pb-2 text-left">📢 {t('fileGrievance')}</h2>

            {!grievanceSubmitted ? (
              <div className="text-left">
                <label className="block text-sm font-semibold mb-1" htmlFor="grievance-input">
                  {t('grievanceText')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="grievance-input"
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder={isMarathi ? 'आपली तक्रार मराठीत लिहा...' : 'Write your grievance...'}
                    rows={4}
                    className="w-full border border-[var(--color-govt-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-saffron)] pr-16 text-left"
                    aria-label={t('grievanceText')}
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${
                      isListening ? 'bg-[var(--color-danger)] text-white animate-pulse-dot' : 'bg-[var(--color-saffron-light)] text-[var(--color-saffron-dark)] hover:bg-[var(--color-saffron)]  hover:text-white'
                    }`}
                    aria-label={t('speak')}
                    title={t('speak')}
                  >
                    🎤
                  </button>
                </div>
                <p className="text-xs text-[var(--color-govt-text-light)] mt-1">
                  {isListening ? (isMarathi ? '🔴 ऐकत आहे... बोला' : '🔴 Listening... Speak now') : (isMarathi ? '🎤 बोला बटण दाबा किंवा मजकूर लिहा' : '🎤 Press speak button or type text')}
                </p>

                <button
                  onClick={handleGrievanceSubmit}
                  disabled={!grievanceText.trim()}
                  className="mt-4 bg-[var(--color-saffron)] text-white px-6 py-2.5 rounded font-semibold text-sm hover:bg-[var(--color-saffron-dark)] transition-colors disabled:opacity-50"
                  aria-label={t('submitGrievance')}
                >
                  {t('submitGrievance')}
                </button>
              </div>
            ) : (
              <div className="animate-fade-in text-left">
                <div className="bg-[var(--color-green-govt-light)] border border-[var(--color-green-govt)] rounded p-4 mb-4">
                  <h3 className="font-bold text-[var(--color-green-govt)] mb-2">✅ {t('grievanceSubmitted')}</h3>
                  <p className="text-sm">{isMarathi ? 'तक्रार क्रमांक' : 'Grievance ID'}: <strong>GRV-2026-NEW</strong></p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{t('category')}: {isMarathi ? 'विमा विलंब' : 'Insurance Delay'}</span>
                    <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded">{t('urgency')}: {t('high')}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-govt-text-light)] mb-1">{isMarathi ? 'आपला मजकूर' : 'Your text'}:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{grievanceText}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-govt-text-light)] mb-1">{isMarathi ? 'AI वर्गीकरण' : 'AI Classification'}:</p>
                    <p className="text-sm">{t('category')}: <strong>{isMarathi ? 'विमा विलंब' : 'Insurance Delay'}</strong> | {t('urgency')}: <strong className="text-red-600">{t('high')}</strong></p>
                  </div>
                </div>
                <button
                  onClick={() => { setGrievanceSubmitted(false); setGrievanceText(''); }}
                  className="mt-4 text-sm text-[var(--color-saffron)] hover:underline"
                >
                  ← {isMarathi ? 'नवीन तक्रार नोंदवा' : 'File new grievance'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

// Complete translations for English and Marathi
export const translations = {
  en: {
    // Common
    dashboard: 'Dashboard',
    logout: 'Logout',
    submit: 'Submit',
    approve: 'Approve',
    reject: 'Reject',
    review: 'Review',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    processing: 'Processing',
    
    // Headers & Navigation
    appTitle: 'KrishiSetu AI',
    appSubtitle: 'Government of Maharashtra | Smart Agriculture Administration System',
    farmerPortal: 'Farmer Portal',
    officerDashboard: 'Officer Dashboard',
    adminDashboard: 'Admin / Collector Dashboard',
    languageToggle: 'Language / भाषा',
    contrast: 'Contrast',
    pilot: 'Pilot',
    
    // Login page
    loginDesc: 'Secure government system | This is a demo environment | All data is synthetic',
    enterAs: 'Enter',
    farmerDesc: 'Submit applications, upload documents, check status',
    officerDesc: 'Application review, grievance redressal, workload management',
    adminDesc: 'District-level monitoring, reports, corruption detection',
    pilotInfo: 'View Pilot Readiness Information',
    
    // Form fields
    applicationId: 'Application ID',
    status: 'Status',
    farmerName: 'Farmer Name',
    scheme: 'Scheme',
    selectScheme: 'Select Scheme',
    uploadDocuments: 'Upload Documents',
    grievance: 'Grievance',
    confidenceScore: 'Confidence Score',
    fraudDetected: 'Fraud Detected',
    eligibilityScore: 'Eligibility Score',
    reason: 'Reason',
    downloadReport: 'Download Report',
    
    // Farmer Portal
    newApplication: 'Submit New Application',
    applicationStatus: 'Application Status',
    fileGrievance: 'File Grievance',
    offlineMode: 'Offline Mode',
    offlineModeDesc: '(Use when no internet)',
    savedLocally: 'Saved locally. Will sync automatically when online.',
    name: 'Name',
    aadhaarNumber: 'Aadhaar Number',
    mobileNumber: 'Mobile Number',
    village: 'Village / Taluka',
    landArea: 'Land Area (acres)',
    cropType: 'Crop Type',
    dragDropFiles: 'Drag files here or click',
    acceptedFormats: 'PDF, JPG, PNG accepted',
    extractedData: 'Extracted Data',
    eligible: 'Eligible',
    ineligible: 'Ineligible',
    alternativeScheme: 'Alternative Scheme',
    
    // Grievance
    grievanceText: 'Describe your grievance',
    speak: 'Speak',
    listening: 'Listening...',
    submitGrievance: 'Submit Grievance',
    grievanceSubmitted: 'Grievance Submitted',
    category: 'Category',
    urgency: 'Urgency',
    aiDraftResponse: 'AI Draft Response',
    sendResponse: 'Send Response',
    responseSent: 'Response Sent',
    high: 'High',
    medium: 'Medium',
    routine: 'Routine',
    insuranceDelay: 'Insurance Delay',
    subsidyDelay: 'Subsidy Delay',
    applicationStatusCat: 'Application Status',
    
    // Officer Dashboard
    applicationQueue: 'Application Queue',
    grievanceConsole: 'Grievance Console',
    myPerformance: 'My Performance',
    pendingApplications: 'Pending Applications',
    allProcessed: 'All applications processed. No pending applications.',
    aiRecommendation: 'AI Recommendation',
    viewDetails: 'View Details',
    applicationDetails: 'Application Details',
    close: 'Close',
    submissionDate: 'Submission Date',
    area: 'Area',
    crop: 'Crop',
    fraudRisk: 'Fraud Risk',
    riskScore: 'Risk Score',
    duplicateRecords: 'Duplicate Records',
    documents: 'Documents',
    processedToday: 'Processed Today',
    avgProcessingTime: 'Avg Processing Time',
    pendingCount: 'Pending Count',
    summary: 'Summary',
    performanceSummary: 'You are taking slightly more time than district average (3.5 min). Using KrishiSetu AI recommendations can speed up processing.',
    
    // Admin Dashboard
    overview: 'Overview',
    officers: 'Officers',
    auditTrail: 'Audit Trail',
    proactiveSearch: 'Proactive Entitlement',
    benchmark: 'Comparison',
    totalPending: 'Total Pending',
    processedTodayAdmin: 'Processed Today',
    fraudFound: 'Fraud Found',
    grievancesPending: 'Grievances Pending',
    pendingByScheme: 'Pending Applications by Scheme',
    budgetPrediction: 'Budget Utilization Forecast',
    budgetWarning: 'PM-KISAN funds will run out in 14 days (at current approval rate)',
    schemeBudgetStatus: 'Scheme Budget Status',
    budget: 'Budget',
    utilized: 'Utilized',
    progress: 'Progress',
    daysRemaining: 'Days Remaining',
    grievanceHeatmap: 'Grievance Density Map (Maharashtra)',
    officerWorkload: 'Officer Workload',
    officerName: 'Officer Name',
    designation: 'Designation',
    district: 'District',
    districtAvg: 'District Avg',
    statusCol: 'Status',
    suspicious: 'Suspicious',
    escalateToCollector: 'Escalate to Collector',
    timestamp: 'Timestamp',
    action: 'Action',
    finalDecision: 'Final Decision',
    overridden: 'Overridden',
    yes: 'Yes',
    no: 'No',
    eligibleNotApplied: 'Eligible Farmers Who Haven\'t Applied',
    sendSMS: 'Send SMS',
    smsSent: 'SMS Sent',
    beforeAfterTitle: 'Before vs After KrishiSetu AI',
    metric: 'Metric',
    manual: 'Manual Process',
    withAI: 'With KrishiSetu AI',
    improvement: 'Improvement',
    
    // Status tracker
    submitted: 'Submitted',
    processingStatus: 'Processing',
    officerReview: 'Officer Review',
    decision: 'Decision',
    
    // Pilot Readiness
    pilotTitle: 'Pilot Readiness',
    pilotMessage: 'KrishiSetu AI can be deployed in any taluka office in 1 day. Requires: 1 laptop, no internet, no new hardware. Estimated pilot cost: ₹0 beyond existing infrastructure.',
    
    // Loading messages
    loadingDoc: 'Reading documents...',
    loadingAadhaar: 'Extracting Aadhaar number...',
    loadingLand: 'Verifying land records...',
    loadingBank: 'Validating bank details...',
    loadingEligibility: 'Checking eligibility...',
    loadingComplete: 'Complete!',
    
    // Notifications
    smsNotification: 'SMS Notification',
    applicationSubmitted: 'Your application has been submitted. Status: Processing.',
    applicationApproved: 'Application approved. Farmer notified.',
    applicationRejected: 'Application rejected. Farmer notified.',
    grievanceRegistered: 'Your grievance has been registered. Response within 48 hours.',
    
    // Benchmark data
    applicationProcessTime: 'Application Processing Time',
    documentVerification: 'Document Verification',
    fraudIdentification: 'Fraud Identification',
    grievanceResponse: 'Grievance Response',
    dailyCapacity: 'Daily Application Capacity',
    eligibleFarmerIdentification: 'Eligible Farmer Identification',
    manualTime1: '20-30 minutes',
    aiTime1: '2-3 minutes',
    manualTime2: '15-20 minutes',
    aiTime2: '30 seconds',
    manualTime3: 'Rare / Manual',
    aiTime3: 'Automatic (every application)',
    manualTime4: '7-15 days',
    aiTime4: 'Instant classification + draft',
    manualTime5: '15-20 apps/officer',
    aiTime5: '100+ apps/officer',
    manualTime6: 'Not possible',
    aiTime6: 'Automatic search',
    improvement1: '90%',
    improvement2: '97%',
    improvement3: '100%',
    improvement4: '95%',
    improvement5: '5x',
    improvement6: 'New',
    
    mins: 'min',
    days: 'days',
    acres: 'acres',
  },
  
  mr: {
    // Common
    dashboard: 'डॅशबोर्ड',
    logout: 'लॉगआउट',
    submit: 'सादर करा',
    approve: 'मंजूर करा',
    reject: 'नाकारा',
    review: 'पुनरावलोकन करा',
    pending: 'प्रलंबित',
    approved: 'मंजूर',
    rejected: 'नाकारले',
    processing: 'प्रक्रिया करत आहे',
    
    // Headers & Navigation
    appTitle: 'कृषिसेतू AI',
    appSubtitle: 'महाराष्ट्र शासन | स्मार्ट कृषी प्रशासन प्रणाली',
    farmerPortal: 'शेतकरी पोर्टल',
    officerDashboard: 'अधिकारी डॅशबोर्ड',
    adminDashboard: 'प्रशासक / जिल्हाधिकारी डॅशबोर्ड',
    languageToggle: 'भाषा / Language',
    contrast: 'कॉन्ट्रास्ट',
    pilot: 'पायलट',
    
    // Login page
    loginDesc: '🔒 सुरक्षित शासकीय प्रणाली | हे डेमो वातावरण आहे | सर्व डेटा कृत्रिम (synthetic) आहे',
    enterAs: 'प्रवेश करा',
    farmerDesc: 'अर्ज सादर करा, कागदपत्रे अपलोड करा, स्थिती तपासा',
    officerDesc: 'अर्ज पुनरावलोकन, तक्रार निवारण, कार्यभार व्यवस्थापन',
    adminDesc: 'जिल्हास्तरीय देखरेख, अहवाल, भ्रष्टाचार ओळख',
    pilotInfo: '🚀 पायलट तयारी माहिती पहा →',
    
    // Form fields
    applicationId: 'अर्ज क्रमांक',
    status: 'स्थिती',
    farmerName: 'शेतकरी नाव',
    scheme: 'योजना',
    selectScheme: 'योजना निवडा',
    uploadDocuments: 'कागदपत्रे अपलोड करा',
    grievance: 'तक्रार',
    confidenceScore: 'विश्वासांक',
    fraudDetected: 'फसवणूक आढळली',
    eligibilityScore: 'पात्रता स्कोअर',
    reason: 'कारण',
    downloadReport: 'अहवाल डाउनलोड करा',
    
    // Farmer Portal
    newApplication: 'नवीन अर्ज सादर करा',
    applicationStatus: 'अर्ज स्थिती',
    fileGrievance: 'तक्रार नोंदवा',
    offlineMode: 'ऑफलाइन मोड',
    offlineModeDesc: '(इंटरनेट नसताना वापरा)',
    savedLocally: 'स्थानिक पातळीवर जतन केले. इंटरनेट परत आल्यावर स्वयंचलित सिंक होईल.',
    name: 'नाव',
    aadhaarNumber: 'आधार क्रमांक',
    mobileNumber: 'मोबाईल क्रमांक',
    village: 'गाव / तालुका',
    landArea: 'शेत क्षेत्र (एकर)',
    cropType: 'पीक प्रकार',
    dragDropFiles: 'कागदपत्रे इथे ड्रॅग करा किंवा क्लिक करा',
    acceptedFormats: 'PDF, JPG, PNG स्वीकारले जातात',
    extractedData: 'काढलेली माहिती (Extracted Data)',
    eligible: 'पात्र',
    ineligible: 'अपात्र',
    alternativeScheme: 'पर्यायी योजना',
    
    // Grievance
    grievanceText: 'आपली तक्रार लिहा',
    speak: 'बोला',
    listening: 'ऐकत आहे...',
    submitGrievance: 'तक्रार सादर करा',
    grievanceSubmitted: 'तक्रार नोंदवली गेली',
    category: 'प्रकार',
    urgency: 'तातडी',
    aiDraftResponse: 'AI मसुदा प्रतिसाद',
    sendResponse: 'प्रतिसाद पाठवा',
    responseSent: 'प्रतिसाद पाठवला',
    high: 'तातडीचे',
    medium: 'सामान्य',
    routine: 'नियमित',
    insuranceDelay: 'विमा विलंब',
    subsidyDelay: 'अनुदान विलंब',
    applicationStatusCat: 'अर्ज स्थिती',
    
    // Officer Dashboard
    applicationQueue: 'अर्ज रांग',
    grievanceConsole: 'तक्रार कक्ष',
    myPerformance: 'माझी कामगिरी',
    pendingApplications: 'प्रलंबित अर्ज',
    allProcessed: 'सर्व अर्ज प्रक्रिया पूर्ण. कोणतेही प्रलंबित अर्ज नाहीत.',
    aiRecommendation: 'AI शिफारस',
    viewDetails: 'तपशील पहा',
    applicationDetails: 'अर्ज तपशील',
    close: 'बंद करा',
    submissionDate: 'जमा दिनांक',
    area: 'क्षेत्र',
    crop: 'पीक',
    fraudRisk: 'फसवणूक जोखीम',
    riskScore: 'जोखीम स्कोअर',
    duplicateRecords: 'डुप्लिकेट नोंदी',
    documents: 'कागदपत्रे',
    processedToday: 'आज प्रक्रिया केलेले',
    avgProcessingTime: 'सरासरी प्रक्रिया वेळ',
    pendingCount: 'प्रलंबित संख्या',
    summary: 'सारांश',
    performanceSummary: 'आपणी जिल्हा सरासरी (3.5 मिनिटे) पेक्षा किंचित जास्त वेळ घेत आहात. KrishiSetu AI शिफारसी वापरून प्रक्रिया गतिमान करता येईल.',
    
    // Admin Dashboard
    overview: 'सारांश',
    officers: 'अधिकारी',
    auditTrail: 'ऑडिट ट्रेल',
    proactiveSearch: 'पात्रता शोध',
    benchmark: 'तुलना',
    totalPending: 'एकूण प्रलंबित',
    processedTodayAdmin: 'आज प्रक्रिया',
    fraudFound: 'फसवणूक आढळली',
    grievancesPending: 'तक्रारी प्रलंबित',
    pendingByScheme: 'योजनानुसार प्रलंबित अर्ज',
    budgetPrediction: 'अंदाजपत्रक वापर अंदाज',
    budgetWarning: '⚠️ PM-KISAN निधी 14 दिवसांत संपेल (सध्याच्या मंजुरी दराने)',
    schemeBudgetStatus: 'योजना अंदाजपत्रक स्थिती',
    budget: 'बजेट',
    utilized: 'वापरलेले',
    progress: 'प्रगती',
    daysRemaining: 'शिल्लक दिवस',
    grievanceHeatmap: 'तक्रार घनता नकाशा (महाराष्ट्र)',
    officerWorkload: 'अधिकारी कार्यभार',
    officerName: 'अधिकारी नाव',
    designation: 'पद',
    district: 'जिल्हा',
    districtAvg: 'जिल्हा सरासरी',
    statusCol: 'स्थिती',
    suspicious: 'संशयास्पद',
    escalateToCollector: 'जिल्हाधिकाऱ्यांकडे पाठवा',
    timestamp: 'वेळ',
    action: 'कृती',
    finalDecision: 'अंतिम निर्णय',
    overridden: 'ओव्हरराइड',
    yes: 'होय',
    no: 'नाही',
    eligibleNotApplied: 'पात्र पण अर्ज न केलेले शेतकरी',
    sendSMS: 'SMS पाठवा',
    smsSent: 'SMS पाठवला',
    beforeAfterTitle: 'KrishiSetu AI आधी विरुद्ध नंतर',
    metric: 'मेट्रिक',
    manual: 'मॅन्युअल प्रक्रिया',
    withAI: 'KrishiSetu AI सह',
    improvement: 'सुधारणा',
    
    // Status tracker
    submitted: 'सादर केले',
    processingStatus: 'प्रक्रिया सुरू',
    officerReview: 'अधिकारी पुनरावलोकन',
    decision: 'निर्णय',
    
    // Pilot Readiness
    pilotTitle: 'पायलट तयारी',
    pilotMessage: 'KrishiSetu AI कोणत्याही तालुका कार्यालयात 1 दिवसात तैनात केले जाऊ शकते. आवश्यक: 1 लॅपटॉप, इंटरनेट नाही, नवीन हार्डवेअर नाही. अंदाजित पायलट खर्च: विद्यमान पायाभूत सुविधांच्या पलीकडे ₹0.',
    
    // Loading messages
    loadingDoc: 'कागदपत्र वाचत आहे...',
    loadingAadhaar: 'आधार क्रमांक काढत आहे...',
    loadingLand: 'जमीन नोंदी तपासत आहे...',
    loadingBank: 'बँक तपशील सत्यापित करत आहे...',
    loadingEligibility: 'पात्रता तपासत आहे...',
    loadingComplete: 'पूर्ण!',
    
    // Notifications
    smsNotification: 'SMS सूचना',
    applicationSubmitted: 'आपला अर्ज सादर झाला आहे. स्थिती: प्रक्रिया सुरू.',
    applicationApproved: 'अर्ज मंजूर. शेतकऱ्यांना सूचना पाठवली.',
    applicationRejected: 'अर्ज नाकारला. शेतकऱ्यांना सूचना पाठवली.',
    grievanceRegistered: 'आपली तक्रार नोंदवली गेली आहे. 48 तासांत प्रतिसाद मिळेल.',
    
    // Benchmark data
    applicationProcessTime: 'अर्ज प्रक्रिया वेळ',
    documentVerification: 'कागदपत्र तपासणी',
    fraudIdentification: 'फसवणूक ओळख',
    grievanceResponse: 'तक्रार प्रतिसाद',
    dailyCapacity: 'दैनिक अर्ज क्षमता',
    eligibleFarmerIdentification: 'पात्र शेतकरी ओळख',
    manualTime1: '20-30 मिनिटे',
    aiTime1: '2-3 मिनिटे',
    manualTime2: '15-20 मिनिटे',
    aiTime2: '30 सेकंद',
    manualTime3: 'क्वचित / मॅन्युअल',
    aiTime3: 'स्वयंचलित (प्रत्येक अर्ज)',
    manualTime4: '7-15 दिवस',
    aiTime4: 'तत्काळ वर्गीकरण + मसुदा',
    manualTime5: '15-20 अर्ज/अधिकारी',
    aiTime5: '100+ अर्ज/अधिकारी',
    manualTime6: 'शक्य नाही',
    aiTime6: 'स्वयंचलित शोध',
    improvement1: '90%',
    improvement2: '97%',
    improvement3: '100%',
    improvement4: '95%',
    improvement5: '5x',
    improvement6: 'नवीन',
    
    mins: 'मि.',
    days: 'दिवस',
    acres: 'एकर',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default language based on role will be set when role changes
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('krishisetu_language');
    return saved || 'mr'; // Default to Marathi initially
  });

  useEffect(() => {
    localStorage.setItem('krishisetu_language', language);
    document.documentElement.lang = language === 'mr' ? 'mr' : 'en';
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'mr' : 'en');
  };

  const setDefaultLanguageForRole = (role) => {
    const savedLang = localStorage.getItem('krishisetu_language');
    if (!savedLang) {
      // Set default based on role only if no preference saved
      if (role === 'farmer') {
        setLanguage('mr');
      } else {
        setLanguage('en');
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      toggleLanguage, 
      t,
      setDefaultLanguageForRole,
      isMarathi: language === 'mr',
      isEnglish: language === 'en'
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

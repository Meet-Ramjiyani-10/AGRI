import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function PilotReadiness() {
  const { role } = useApp();
  const { t, language, setLanguage, isMarathi } = useLanguage();
  const navigate = useNavigate();

  const pilotItems = isMarathi ? [
    { icon: '💻', label: 'आवश्यक हार्डवेअर', value: 'फक्त 1 लॅपटॉप', desc: 'विद्यमान सरकारी लॅपटॉप पुरेसा आहे' },
    { icon: '🌐', label: 'इंटरनेट', value: 'आवश्यक नाही', desc: 'ऑफलाइन-फर्स्ट आर्किटेक्चर. इंटरनेट आल्यावर स्वयंसिंक' },
    { icon: '🔧', label: 'नवीन हार्डवेअर', value: 'लागत नाही', desc: 'विद्यमान पायाभूत सुविधांवर चालते' },
    { icon: '💰', label: 'अंदाजित खर्च', value: '₹0', desc: 'विद्यमान पायाभूत सुविधांपलीकडे शून्य खर्च' },
    { icon: '⏱️', label: 'तैनाती वेळ', value: '1 दिवस', desc: 'स्थापना, प्रशिक्षण आणि सुरुवात' },
    { icon: '📚', label: 'प्रशिक्षण', value: '2 तास', desc: 'सरळ मराठी इंटरफेस, कमी प्रशिक्षण आवश्यक' },
  ] : [
    { icon: '💻', label: 'Required Hardware', value: 'Just 1 Laptop', desc: 'Existing government laptop is sufficient' },
    { icon: '🌐', label: 'Internet', value: 'Not Required', desc: 'Offline-first architecture. Auto-syncs when online' },
    { icon: '🔧', label: 'New Hardware', value: 'Not Needed', desc: 'Runs on existing infrastructure' },
    { icon: '💰', label: 'Estimated Cost', value: '₹0', desc: 'Zero cost beyond existing infrastructure' },
    { icon: '⏱️', label: 'Deployment Time', value: '1 Day', desc: 'Installation, training, and go-live' },
    { icon: '📚', label: 'Training', value: '2 Hours', desc: 'Simple Marathi interface, minimal training needed' },
  ];

  const benefits = isMarathi ? [
    'अर्ज प्रक्रिया वेळ 90% कमी (20-30 मिनिटांवरून 2-3 मिनिटांवर)',
    'स्वयंचलित फसवणूक ओळख – प्रत्येक अर्जाची तपासणी',
    'AI-आधारित तक्रार वर्गीकरण आणि मसुदा प्रतिसाद',
    'पात्र शेतकऱ्यांचा स्वयंचलित शोध – SMS सूचना',
    'अंदाजपत्रक संपण्याचा अंदाज – वेळेवर निर्णय',
    'संपूर्ण ऑडिट ट्रेल – पारदर्शकता आणि जबाबदारी',
    'ऑफलाइन-फर्स्ट – इंटरनेट नसतानाही काम करते',
  ] : [
    '90% reduction in application processing time (from 20-30 min to 2-3 min)',
    'Automatic fraud detection – every application screened',
    'AI-powered grievance classification and draft responses',
    'Auto-identify eligible farmers – SMS notifications',
    'Budget exhaustion prediction – timely decisions',
    'Complete audit trail – transparency and accountability',
    'Offline-first – works even without internet',
  ];

  const ps9Items = isMarathi ? [
    '✅ बुद्धिमान दस्तऐवज प्रक्रिया (Document Processing)',
    '✅ कार्यप्रवाह स्वयंचलन (Workflow Automation)',
    '✅ अंदाजात्मक विश्लेषण (Predictive Analytics)',
    '✅ तक्रार व्यवस्थापन (Grievance Management)',
    '✅ रिअल-टाइम अहवाल (Real-time Reports)',
    '✅ जलद निर्णय (Faster Decisions)',
  ] : [
    '✅ Intelligent Document Processing',
    '✅ Workflow Automation',
    '✅ Predictive Analytics',
    '✅ Grievance Management',
    '✅ Real-time Reports',
    '✅ Faster Decisions',
  ];

  return (
    <div className="min-h-screen bg-[var(--color-govt-bg)]">
      {!role && <div className="h-2 bg-gradient-to-r from-[var(--color-saffron)] via-white to-[var(--color-green-govt)]"></div>}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-[var(--color-govt-border)] rounded px-2 py-1 bg-white"
            aria-label={t('languageToggle')}
          >
            <option value="en">English</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🚀</span>
          <h1 className="text-2xl font-bold text-[var(--color-navy)] mt-3">
            {isMarathi ? 'कृषिसेतू AI – पायलट तयारी' : 'KrishiSetu AI – Pilot Readiness'}
          </h1>
          <p className="text-sm text-[var(--color-govt-text-light)] mt-1">
            {isMarathi ? 'KrishiSetu AI Pilot Readiness' : 'कृषिसेतू AI पायलट तयारी'}
          </p>
          <div className="w-16 h-0.5 bg-[var(--color-saffron)] mx-auto mt-3"></div>
        </div>

        {/* Main card */}
        <div className="bg-white border-2 border-[var(--color-green-govt)] rounded p-8 mb-6" style={{ borderTopWidth: '4px' }}>
          <h2 className="text-xl font-bold text-[var(--color-green-govt)] mb-6 text-center">
            {isMarathi 
              ? 'कृषिसेतू AI कोणत्याही तालुका कार्यालयात 1 दिवसात तैनात करता येते'
              : 'KrishiSetu AI can be deployed in any taluka office in 1 day'}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {pilotItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded border border-gray-200 text-left">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs text-[var(--color-govt-text-light)]">{item.label}</p>
                  <p className="font-bold text-[var(--color-navy)]">{item.value}</p>
                  <p className="text-xs text-[var(--color-govt-text-light)] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key benefits */}
        <div className="bg-[var(--color-saffron-light)] border border-[var(--color-saffron)] rounded p-6 mb-6">
          <h3 className="font-bold text-[var(--color-saffron-dark)] mb-3">
            {isMarathi ? '✅ KrishiSetu AI चे प्रमुख फायदे' : '✅ Key Benefits of KrishiSetu AI'}
          </h3>
          <ul className="space-y-2 text-sm text-[var(--color-govt-text)] text-left">
            {benefits.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[var(--color-green-govt)] flex-shrink-0 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* PS 9 compliance */}
        <div className="bg-[var(--color-green-govt-light)] border border-[var(--color-green-govt)] rounded p-6 mb-6">
          <h3 className="font-bold text-[var(--color-green-govt-dark)] mb-3">
            {isMarathi ? '📋 PS 9 आवश्यकता पूर्तता' : '📋 PS 9 Requirements Compliance'}
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {ps9Items.map((item, i) => (
              <div key={i} className="bg-white rounded px-3 py-2 text-left">{item}</div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-[var(--color-saffron)] text-white px-8 py-3 rounded font-semibold hover:bg-[var(--color-saffron-dark)] transition-colors"
          >
            🏠 {isMarathi ? 'मुख्यपृष्ठावर परत जा' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

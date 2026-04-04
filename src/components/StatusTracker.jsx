import { useLanguage } from '../context/LanguageContext';

export default function StatusTracker({ currentStatus }) {
  const { t, isMarathi } = useLanguage();
  
  const steps = [
    { key: 'submitted', labelKey: 'submitted', icon: '📋' },
    { key: 'processing', labelKey: 'processing', icon: '⚙️' },
    { key: 'pending_officer', labelKey: 'officerReview', icon: '👤' },
    { key: 'approved', labelKey: 'approved', icon: '✅' },
    { key: 'rejected', labelKey: 'rejected', icon: '❌' },
  ];

  const statusOrder = { submitted: 0, processing: 1, pending_officer: 2, approved: 3, rejected: 3 };
  const currentIndex = statusOrder[currentStatus] ?? 0;
  const isRejected = currentStatus === 'rejected';

  return (
    <div className="w-full py-4" role="progressbar" aria-label={isMarathi ? 'अर्ज स्थिती' : 'Application Status'} aria-valuenow={currentIndex} aria-valuemax={3}>
      <div className="flex items-center justify-between relative">
        {steps.filter(s => {
          if (isRejected && s.key === 'approved') return false;
          if (!isRejected && s.key === 'rejected') return false;
          return true;
        }).map((step, idx, arr) => {
          const stepIdx = statusOrder[step.key];
          const isActive = stepIdx <= currentIndex;
          const isCurrent = step.key === currentStatus;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
              {/* Connector line */}
              {idx > 0 && (
                <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${
                  isActive ? 'bg-[var(--color-green-govt)]' : 'bg-gray-300'
                }`} style={{ transform: 'translateX(50%)' }}></div>
              )}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                isCurrent
                  ? (isRejected ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]' : 'border-[var(--color-green-govt)] bg-[var(--color-green-govt-light)] animate-pulse-dot')
                  : isActive
                    ? 'border-[var(--color-green-govt)] bg-[var(--color-green-govt-light)]'
                    : 'border-gray-300 bg-gray-50'
              }`}>
                {step.icon}
              </div>
              <span className={`text-xs mt-1 text-center font-medium ${
                isCurrent ? (isRejected ? 'text-[var(--color-danger)]' : 'text-[var(--color-green-govt)]') : isActive ? 'text-[var(--color-govt-text)]' : 'text-gray-400'
              }`}>
                {t(step.labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LoadingMessages({ onComplete }) {
  const { t, isMarathi } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingSteps = [
    { key: 'loadingDoc' },
    { key: 'loadingAadhaar' },
    { key: 'loadingLand' },
    { key: 'loadingBank' },
    { key: 'loadingEligibility' },
    { key: 'loadingComplete' },
  ];

  useEffect(() => {
    if (currentIndex < loadingSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 800);
      }
    }
  }, [currentIndex, onComplete]);

  return (
    <div className="bg-white border border-[var(--color-govt-border)] rounded p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-saffron-light)] flex items-center justify-center">
          <span className={`text-lg ${!isComplete ? 'animate-spin' : ''}`}>{isComplete ? '✅' : '⚙️'}</span>
        </div>
        <h3 className="font-semibold text-[var(--color-govt-text)]">
          {isComplete 
            ? (isMarathi ? 'प्रक्रिया पूर्ण' : 'Processing Complete') 
            : (isMarathi ? 'AI प्रक्रिया सुरू आहे...' : 'AI Processing...')}
        </h3>
      </div>
      <div className="space-y-2 ml-11">
        {loadingSteps.slice(0, currentIndex + 1).map((step, idx) => (
          <div key={idx} className="flex items-center gap-2 animate-fade-in">
            <span className={`text-sm ${idx === currentIndex && !isComplete ? 'text-[var(--color-saffron)]' : 'text-[var(--color-green-govt)]'}`}>
              {idx < currentIndex || isComplete ? '✓' : '●'}
            </span>
            <span className={`text-sm ${idx === currentIndex && !isComplete ? 'font-semibold text-[var(--color-govt-text)]' : 'text-[var(--color-govt-text-light)]'}`}>
              {t(step.key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

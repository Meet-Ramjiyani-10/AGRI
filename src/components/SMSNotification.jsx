import { useLanguage } from '../context/LanguageContext';

export default function SMSNotification({ message }) {
  const { t } = useLanguage();
  
  return (
    <div className="animate-slide-in bg-[var(--color-green-govt)] text-white px-4 py-3 rounded shadow-lg max-w-sm" role="alert" aria-live="polite">
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">📱</span>
        <div>
          <p className="text-xs font-semibold mb-0.5 opacity-80">{t('smsNotification')}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

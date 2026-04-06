import { useLanguage } from '../context/LanguageContext';

export default function SMSNotification({ message, type = 'success' }) {
  const { t } = useLanguage();
  const styles = {
    success: 'bg-[var(--color-green-govt)]',
    error: 'bg-[var(--color-danger)]',
    info: 'bg-[var(--color-navy)]',
  };
  
  return (
    <div className={`animate-slide-in text-white px-4 py-3 rounded shadow-lg max-w-sm ${styles[type] || styles.success}`} role="alert" aria-live="polite">
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

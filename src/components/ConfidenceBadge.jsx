import { useLanguage } from '../context/LanguageContext';

export default function ConfidenceBadge({ score, label }) {
  const { t, isMarathi } = useLanguage();
  
  const getColor = (s) => {
    if (s >= 85) return { bg: 'bg-[var(--color-green-govt-light)]', text: 'text-[var(--color-green-govt)]', border: 'border-[var(--color-green-govt)]' };
    if (s >= 70) return { bg: 'bg-[var(--color-warning-light)]', text: 'text-[var(--color-warning)]', border: 'border-[var(--color-warning)]' };
    return { bg: 'bg-[var(--color-danger-light)]', text: 'text-[var(--color-danger)]', border: 'border-[var(--color-danger)]' };
  };

  const colors = getColor(score);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
      aria-label={`${label || t('confidenceScore')}: ${score}%`}
    >
      {label && <span className="font-normal">{label}</span>}
      {score}%
      {score < 70 && <span title={isMarathi ? 'मॅन्युअल तपासणी आवश्यक' : 'Manual review required'}>⚠️</span>}
    </span>
  );
}

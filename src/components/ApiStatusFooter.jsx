import { useApp } from '../context/AppContext';

export default function ApiStatusFooter() {
  const { apiMode } = useApp();
  const useMock = apiMode !== 'production';

  return (
    <footer className="mt-6 py-2 text-left text-xs text-[var(--color-govt-text-light)] border-t border-[var(--color-govt-border)]">
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded ${useMock ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
        {useMock ? '✅ Connected to Mock MahaDBT, Mahabhulekh, Aaple Sarkar' : '🚀 Ready for live API endpoints.'}
      </span>
    </footer>
  );
}

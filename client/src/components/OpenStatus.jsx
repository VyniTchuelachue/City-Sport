import { useLang } from '../context/LanguageContext.jsx';
import { formatTime } from '../lib/hours.js';

export function statusText(status, t, lang) {
  if (!status?.time) return t('status.closed');
  const time = formatTime(status.time, lang);
  if (status.open) {
    return status.closingSoon ? t('status.closingSoon', time) : t('status.openUntil', time);
  }
  if (status.daysAhead === 0) return t('status.opensToday', time);
  if (status.daysAhead === 1) return t('status.opensTomorrow', time);
  return t('status.opensDay', t('days')[status.day], time);
}

// A filled dot means open, a hollow one closed; the wording carries the same
// information, so the colour is never the only signal.
export default function OpenStatus({ status, className = '' }) {
  const { t, lang } = useLang();
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${
          status?.open ? 'bg-enseigne' : 'border-[1.5px] border-current opacity-60'
        }`}
      />
      <span>{statusText(status, t, lang)}</span>
    </span>
  );
}

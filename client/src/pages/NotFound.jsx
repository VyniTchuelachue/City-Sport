import { Link } from 'react-router-dom';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLang();
  usePageTitle(t('notFound.pageTitle'));

  return (
    <div className="wrap py-24 lg:py-32">
      <h1 className="titre text-[clamp(2.75rem,8vw,5.5rem)]">{t('notFound.title')}</h1>
      <p className="mt-5 text-xl text-ardoise">{t('notFound.text')}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="bouton bouton-plein">
          {t('notFound.home')}
        </Link>
        <Link to="/boutique" className="bouton bouton-contour">
          {t('selection.browse')}
        </Link>
      </div>
    </div>
  );
}

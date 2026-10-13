import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { CATEGORIES, company, payments } from '../lib/company.js';
import { telHref } from '../lib/format.js';

function Column({ title, children }) {
  return (
    <div>
      <h2 className="text-[0.9375rem] font-bold">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-[0.9375rem] text-paper/75">{children}</ul>
    </div>
  );
}

const link = 'underline-offset-4 hover:text-paper hover:underline';

export default function Footer() {
  const { t } = useLang();
  const { stores } = useStores();

  return (
    <footer className="sur-noir bg-ink text-paper">
      <div className="wrap py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo className="h-10 w-auto" />
            <p className="mt-5 max-w-xs text-paper/75">{t('footer.tagline')}</p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            <Column title={t('footer.shop')}>
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link to={`/boutique?category=${category}`} className={link}>
                    {t(`cat.${category}`)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/boutique?sale=1" className={link}>
                  {t('shop.sale')}
                </Link>
              </li>
            </Column>

            <Column title={t('footer.stores')}>
              {stores.map((store) => (
                <li key={store.id}>
                  <Link to={`/magasins#${store.id}`} className={link}>
                    {store.name}
                  </Link>
                  <a href={telHref(store.phone)} className={`prix block font-normal ${link}`}>
                    {store.phoneDisplay}
                  </a>
                </li>
              ))}
            </Column>

            <Column title={t('footer.company')}>
              <li>
                <Link to="/a-propos" className={link}>
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={link}>
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <a href={company.youtube} target="_blank" rel="noreferrer" className={link}>
                  {t('footer.youtube')}
                </a>
              </li>
              <li className="pt-2">{t('footer.headOffice')}</li>
              <li>
                <a href={telHref(company.phone)} className={`prix font-normal ${link}`}>
                  {company.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className={`break-all ${link}`}>
                  {company.email}
                </a>
              </li>
            </Column>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/20 pt-6 text-[0.875rem] text-paper/75 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.rights', new Date().getFullYear())}</p>
          <p>{t('footer.payments', payments.join(', '))}</p>
        </div>
      </div>
    </footer>
  );
}

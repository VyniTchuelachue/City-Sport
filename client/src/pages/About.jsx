import { Link } from 'react-router-dom';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';
import { useApi } from '../lib/api.js';
import { payments, sisterStores } from '../lib/company.js';

export default function About() {
  const { t, pick } = useLang();
  const { data: meta } = useApi('/meta');
  usePageTitle(t('about.pageTitle'));

  return (
    <>
      <div className="wrap pb-16 pt-10 lg:pb-24 lg:pt-14">
        <h1 className="titre text-[clamp(2.75rem,8vw,5.5rem)]">{t('about.title')}</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-2xl leading-snug lg:text-[1.75rem]">{t('about.lead')}</p>
            <div className="mt-8 max-w-prose space-y-5 text-lg leading-relaxed text-ardoise">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
            </div>
            <Link to="/magasins" className="bouton bouton-plein mt-8">
              {t('about.cta')}
            </Link>
          </div>
          <div className="lg:col-span-6">
            <img
              src="/images/stores/akwa-facade.webp"
              alt={t('about.photoAlt')}
              width="1600"
              height="1200"
              className="aspect-[4/3] w-full bg-sol object-cover"
            />
          </div>
        </div>
      </div>

      <section className="bg-sol py-16 lg:py-24">
        <div className="wrap">
          <h2 className="titre text-[clamp(1.75rem,4vw,2.75rem)]">{t('about.groupTitle')}</h2>
          <dl className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {sisterStores.map((trade) => (
              <div key={trade.key} className="border-t border-ink pt-4">
                <dt className="text-ardoise">{t(`about.trades.${trade.key}`)}</dt>
                {trade.names.map((name) => (
                  <dd key={name} className="mt-1.5 text-xl font-semibold first-of-type:mt-3">
                    {name}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="wrap py-16 lg:py-24">
        <h2 className="titre text-[clamp(1.75rem,4vw,2.75rem)]">{t('about.brandsTitle')}</h2>
        <dl className="mt-10 grid gap-x-8 sm:grid-cols-2">
          {(meta?.brands ?? []).map((brand) => (
            <div key={brand.name} className="flex flex-col gap-1 border-t border-trait py-4 md:flex-row md:gap-6">
              <dt className="w-44 shrink-0 text-lg font-bold">{brand.name}</dt>
              <dd className="text-ardoise">{pick(brand.blurb)}</dd>
            </div>
          ))}
        </dl>

        <h2 className="titre mt-16 text-[clamp(1.75rem,4vw,2.75rem)]">{t('about.paymentsTitle')}</h2>
        <p className="mt-4 text-lg text-ardoise">{t('about.paymentsText')}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {payments.map((name) => (
            <li key={name} className="rounded-full border-[1.5px] border-trait px-4 py-2 font-medium">
              {name}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

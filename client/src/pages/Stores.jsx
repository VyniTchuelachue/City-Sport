import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OpenStatus from '../components/OpenStatus.jsx';
import { PhoneIcon, PinIcon } from '../components/Icons.jsx';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { payments } from '../lib/company.js';
import { telHref } from '../lib/format.js';
import { formatTime } from '../lib/hours.js';

// Weeks start on Monday here; the data is indexed Sunday-first.
const WEEK = [1, 2, 3, 4, 5, 6, 0];

function Hours({ store, today }) {
  const { t, lang } = useLang();
  return (
    <table className="w-full max-w-sm text-[0.9375rem]">
      <caption className="pb-2 text-left font-bold">{t('stores.hours')}</caption>
      <tbody>
        {WEEK.map((day) => {
          const slot = store.hours[day];
          const isToday = day === today;
          return (
            <tr key={day} className={isToday ? 'font-bold' : 'text-ardoise'}>
              <th scope="row" className="py-1 pr-4 text-left font-[inherit]">
                {t('days')[day]}
                {isToday && <span className="font-normal"> ({t('stores.today')})</span>}
              </th>
              <td className="prix py-1 text-right font-[inherit]">
                {slot
                  ? `${formatTime(slot[0], lang)} – ${formatTime(slot[1], lang)}`
                  : t('stores.closedDay')}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// The map loads only on request: it is heavy, and it sets third-party cookies.
function StoreMap({ store }) {
  const { t } = useLang();
  const [shown, setShown] = useState(false);
  const { lat, lng } = store.coords;

  if (!shown) {
    return (
      <button type="button" onClick={() => setShown(true)} className="bouton bouton-contour">
        <PinIcon className="size-4" />
        {t('stores.showMap')}
      </button>
    );
  }
  return (
    <iframe
      title={t('stores.mapTitle', store.name)}
      src={`https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="aspect-[4/3] w-full border-0 bg-sol"
    />
  );
}

function Store({ store, today }) {
  const { t, pick } = useLang();
  const [main, ...others] = store.images;

  return (
    <section
      id={store.id}
      aria-labelledby={`${store.id}-titre`}
      className="grid scroll-mt-32 gap-8 border-t border-ink py-12 lg:grid-cols-12 lg:gap-12 lg:py-16"
    >
      <div className="lg:col-span-7">
        <img
          src={main}
          alt={t('stores.photoAlt', store.name)}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full bg-sol object-cover"
        />
        {others.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {others.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full bg-sol object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-5">
        <p className="text-ardoise">
          {store.city}, {store.district}
        </p>
        <h2 id={`${store.id}-titre`} className="titre mt-1 text-[clamp(2rem,4vw,3rem)]">
          {store.name}
        </h2>
        <OpenStatus status={store.status} className="mt-4 text-lg font-medium" />
        <p className="mt-4 max-w-md leading-relaxed text-ardoise">{pick(store.note)}</p>

        <address className="mt-6 space-y-2 not-italic">
          <p className="flex gap-3">
            <PinIcon className="mt-0.5 size-5 shrink-0" />
            {store.address}
          </p>
          <p className="flex gap-3">
            <PhoneIcon className="mt-0.5 size-5 shrink-0" />
            <a href={telHref(store.phone)} className="prix text-lg underline-offset-4 hover:underline">
              {store.phoneDisplay}
            </a>
          </p>
        </address>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={store.mapsUrl} target="_blank" rel="noreferrer" className="bouton bouton-plein">
            {t('stores.directions')}
          </a>
          <a href={telHref(store.phone)} className="bouton bouton-contour">
            {t('stores.call')}
          </a>
        </div>

        <div className="mt-8">
          <Hours store={store} today={today} />
        </div>

        <div className="mt-8">
          <StoreMap store={store} />
        </div>

        <Link
          to={`/contact?magasin=${store.id}`}
          className="mt-6 inline-block font-semibold underline decoration-2 underline-offset-[6px] hover:decoration-enseigne"
        >
          {t('stores.write')}
        </Link>
      </div>
    </section>
  );
}

export default function Stores() {
  const { t } = useLang();
  const { stores, today, error, loading, retry } = useStores();
  const { hash } = useLocation();
  usePageTitle(t('stores.pageTitle'));

  // Links such as /magasins#akwa arrive before the list has loaded.
  useEffect(() => {
    if (!hash || !stores.length) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash, stores.length]);

  return (
    <div className="wrap pb-12 pt-10 lg:pt-14">
      <h1 className="titre text-[clamp(2.75rem,8vw,5.5rem)]">{t('stores.title')}</h1>
      <p className="mt-5 max-w-xl text-xl text-ardoise">{t('stores.intro')}</p>

      {error && (
        <div className="py-16">
          <p className="text-xl font-bold">{t('stores.error')}</p>
          <button type="button" onClick={retry} className="bouton bouton-plein mt-6">
            {t('shop.retry')}
          </button>
        </div>
      )}
      {loading && !stores.length && <div className="mt-12 h-96 bg-sol" aria-hidden="true" />}

      <div className="mt-12">
        {stores.map((store) => (
          <Store key={store.id} store={store} today={today} />
        ))}
      </div>

      {stores.length > 0 && (
        <p className="border-t border-trait py-8 text-ardoise">
          {t('footer.payments', payments.join(', '))}
        </p>
      )}
    </div>
  );
}

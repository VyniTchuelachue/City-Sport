import { Link } from 'react-router-dom';
import OpenStatus from '../components/OpenStatus.jsx';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { useApi } from '../lib/api.js';
import { GENDERS } from '../lib/company.js';
import { sized, telHref } from '../lib/format.js';

const unsplash = (id) => `https://images.unsplash.com/photo-${id}`;

// The photo is cut along an S, the stroke that splits "city" from "sport" in the wordmark.
function Hero() {
  const { t } = useLang();
  const lines = t('home.heroLines');

  return (
    <section className="relative overflow-hidden bg-enseigne">
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="courbe-s" clipPathUnits="objectBoundingBox">
            <path d="M0.50,0 C0.27,0.08 0.09,0.21 0.12,0.38 C0.15,0.54 0.37,0.58 0.36,0.74 C0.35,0.87 0.20,0.95 0.02,1 L1,1 L1,0 Z" />
          </clipPath>
          <clipPath id="courbe-s-couchee" clipPathUnits="objectBoundingBox">
            <path d="M0,0.15 C0.18,0.03 0.36,0 0.52,0.07 C0.68,0.14 0.84,0.13 1,0.02 L1,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="wrap relative z-10 pb-6 pt-12 sm:pt-16 lg:flex lg:min-h-[min(84svh,52rem)] lg:items-center lg:py-20">
        <div className="lg:w-[54%]">
          <h1 className="titre text-[clamp(3.25rem,14.5vw,5.5rem)] lg:text-[clamp(4.25rem,7.4vw,8rem)]">
            {lines.map((line, index) => (
              <span key={line} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
                <span className="block animate-monte" style={{ animationDelay: `${index * 90}ms` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[32rem] text-lg leading-relaxed lg:mt-8 lg:text-xl">
            {t('home.heroText')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/boutique" className="bouton bouton-plein">
              {t('home.heroShop')}
            </Link>
            <Link to="/magasins" className="bouton bouton-contour">
              {t('home.heroStores')}
            </Link>
          </div>
        </div>
      </div>

      <div className="relative h-[78vw] max-h-[34rem] animate-glisse [clip-path:url(#courbe-s-couchee)] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:max-h-none lg:w-[52%] lg:[clip-path:url(#courbe-s)]">
        <img
          src="/images/stores/bali-interior.webp"
          alt={t('home.heroAlt')}
          width="1200"
          height="1600"
          fetchPriority="high"
          className="size-full object-cover object-[60%_62%]"
        />
      </div>
    </section>
  );
}

function SectionHeading({ title, text, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div>
        <h2 className="titre text-[clamp(2.25rem,6vw,4rem)]">{title}</h2>
        {text && <p className="mt-4 max-w-xl text-lg text-ardoise">{text}</p>}
      </div>
      {action}
    </div>
  );
}

const textLink = 'font-semibold underline decoration-2 underline-offset-[6px] hover:decoration-enseigne';

function Aisles() {
  const { t } = useLang();
  const tiles = [
    { key: 'chaussures', src: sized(unsplash('1514989940723-e8e51635b782'), 1200, 800), span: 'lg:col-span-7' },
    { key: 'vetements', src: '/images/stores/akwa-interior.webp', span: 'lg:col-span-5', position: 'object-[50%_30%]' },
    { key: 'accessoires', src: sized(unsplash('1553062407-98eeb64c6a62'), 900, 700), span: 'lg:col-span-5' },
    { key: 'equipement', src: sized(unsplash('1546519638-68e109498ffc'), 1200, 700), span: 'lg:col-span-7' },
  ];

  return (
    <section className="wrap py-16 lg:py-24">
      <SectionHeading title={t('home.aisles')} text={t('home.aislesText')} />
      <ul className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
        {tiles.map((tile, index) => (
          <li key={tile.key} className={tile.span}>
            <Link to={`/boutique?category=${tile.key}`} className="group block">
              <div className={`overflow-hidden bg-sol ${index < 2 ? 'aspect-[4/3] lg:aspect-auto lg:h-[27rem]' : 'aspect-[4/3] lg:aspect-auto lg:h-[21rem]'}`}>
                <img
                  src={tile.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`size-full object-cover ${tile.position ?? ''}`}
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="titre text-2xl decoration-enseigne decoration-4 underline-offset-[6px] group-hover:underline lg:text-[1.75rem]">
                  {t(`cat.${tile.key}`)}
                </h3>
                <p className="text-right text-[0.9375rem] text-ardoise">{t(`catHint.${tile.key}`)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-12 flex flex-wrap gap-3">
        {GENDERS.map((gender) => (
          <li key={gender}>
            <Link to={`/boutique?gender=${gender}`} className="bouton bouton-contour min-w-32">
              {t(`gender.${gender}`)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Arrivals() {
  const { t } = useLang();
  const { data, loading, error } = useApi('/products?new=1&limit=8');
  if (error) return null;

  return (
    <section className="bg-sol py-16 lg:py-24">
      <div className="wrap">
        <SectionHeading
          title={t('home.arrivals')}
          action={
            <Link to="/boutique" className={textLink}>
              {t('home.arrivalsLink')}
            </Link>
          }
        />
      </div>
      {/* A swipeable rail on phones, a plain grid from tablet up. */}
      <div className="sans-barre mt-10 overflow-x-auto md:overflow-visible">
        <ul className="wrap flex w-max snap-x gap-4 md:grid md:w-full md:grid-cols-4 md:gap-x-5 md:gap-y-10">
          {loading && !data
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="w-[62vw] max-w-64 shrink-0 md:w-auto md:max-w-none">
                  <ProductCardSkeleton />
                </li>
              ))
            : data.items.map((product) => (
                <li key={product.slug} className="w-[62vw] max-w-64 shrink-0 snap-start md:w-auto md:max-w-none [&_.bg-sol]:bg-paper">
                  <ProductCard product={product} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}

function Brands() {
  const { t } = useLang();
  const { data } = useApi('/meta');

  return (
    <section className="sur-noir bg-ink py-16 text-paper lg:py-24">
      <div className="wrap">
        <h2 className="titre text-[clamp(2.25rem,6vw,4rem)]">{t('home.brands')}</h2>
        <p className="mt-4 max-w-xl text-lg text-paper/75">{t('home.brandsText')}</p>
        <ul className="titre mt-10 flex flex-wrap gap-x-[clamp(1.5rem,4vw,3.5rem)] gap-y-3 text-[clamp(1.625rem,4.6vw,3.5rem)] leading-[1.1]">
          {(data?.brands ?? []).map((brand) => (
            <li key={brand.name}>
              {brand.hasProducts ? (
                <Link
                  to={`/boutique?brand=${encodeURIComponent(brand.name)}`}
                  className="decoration-enseigne decoration-4 underline-offset-8 hover:underline"
                >
                  {brand.name}
                </Link>
              ) : (
                brand.name
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stores() {
  const { t } = useLang();
  const { stores } = useStores();
  if (!stores.length) return null;

  return (
    <section className="wrap py-16 lg:py-24">
      <SectionHeading
        title={t('home.storesTitle')}
        text={t('home.storesText')}
        action={
          <Link to="/magasins" className={textLink}>
            {t('home.storesLink')}
          </Link>
        }
      />
      <ul className="mt-10 grid gap-x-5 gap-y-12 md:grid-cols-3">
        {stores.map((store) => (
          <li key={store.id}>
            <Link to={`/magasins#${store.id}`} className="block overflow-hidden bg-sol" tabIndex={-1} aria-hidden="true">
              <img
                src={store.images[0]}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </Link>
            <p className="mt-4 text-[0.9375rem] text-ardoise">{store.city}</p>
            <h3 className="titre mt-1 text-2xl lg:text-[1.75rem]">
              <Link to={`/magasins#${store.id}`} className="decoration-enseigne decoration-4 underline-offset-[6px] hover:underline">
                {store.name}
              </Link>
            </h3>
            <OpenStatus status={store.status} className="mt-3 text-[0.9375rem] font-medium" />
            <address className="mt-2 not-italic leading-relaxed text-ardoise">{store.address}</address>
            <a href={telHref(store.phone)} className="prix mt-1 inline-block underline-offset-4 hover:underline">
              {store.phoneDisplay}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AboutTeaser() {
  const { t } = useLang();
  return (
    <section className="border-t border-trait">
      <div className="wrap grid gap-8 py-16 lg:grid-cols-12 lg:py-24">
        <h2 className="titre text-[clamp(2.25rem,6vw,4rem)] lg:col-span-5">{t('home.aboutTitle')}</h2>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="text-xl leading-relaxed">{t('home.aboutText')}</p>
          <Link to="/a-propos" className={`mt-6 inline-block ${textLink}`}>
            {t('home.aboutLink')}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLang();
  usePageTitle(t('home.pageTitle'));

  return (
    <>
      <Hero />
      <Aisles />
      <Arrivals />
      <Stores />
      <Brands />
      <AboutTeaser />
    </>
  );
}

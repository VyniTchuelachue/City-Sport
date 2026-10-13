import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark.jsx';
import { ArrowRightIcon, PhoneIcon, PinIcon } from '../components/Icons.jsx';
import OpenStatus from '../components/OpenStatus.jsx';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { useApi } from '../lib/api.js';
import { CATEGORIES } from '../lib/company.js';
import { sized, telHref } from '../lib/format.js';

// Lifestyle photography is stock for now (Unsplash). Swap these for City Sport's
// own campaign photos: put the files in client/public/images and use their paths.
const photo = (id) => `https://images.unsplash.com/photo-${id}`;
const HERO_PHOTO = photo('1606964212916-4d23bf4044cb');
const ABOUT_PHOTO = photo('1738495777011-95a2d5ee83a9');
const CATEGORY_PHOTOS = {
  chaussures: photo('1516478177764-9fe5bd7e9717'),
  vetements: photo('1560362540-4f67144a2a26'),
  accessoires: photo('1553062407-98eeb64c6a62'),
  equipement: photo('1519861531473-9200262188bf'),
};

function Hero() {
  const { t } = useLang();

  return (
    // One frame at every size: the words sit on the photo. On phones the photo fills
    // the lower part of the frame and fades upward behind the headline; on wide
    // screens it fills the right and fades toward the left.
    <section className="relative overflow-hidden bg-paper">
      <div className="absolute inset-x-0 bottom-0 h-[29rem] sm:h-[31rem] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[70%]">
        <img
          src={sized(HERO_PHOTO, 2000)}
          srcSet={`${sized(HERO_PHOTO, 900)} 900w, ${sized(HERO_PHOTO, 1400)} 1400w, ${sized(HERO_PHOTO, 2000)} 2000w`}
          sizes="100vw"
          alt={t('home.heroAlt')}
          fetchPriority="high"
          className="size-full object-cover object-[84%_70%] sm:object-[70%_70%]"
        />
        {/* Dissolves the photo's edge into the page so the text has a clear field. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,#fff_0%,rgb(255_255_255/0.8)_10%,rgb(255_255_255/0.3)_24%,rgb(255_255_255/0)_36%)] lg:bg-[linear-gradient(90deg,#fff_0%,rgb(255_255_255/0.85)_14%,rgb(255_255_255/0.35)_30%,rgb(255_255_255/0)_46%)]"
        />
      </div>

      <div className="wrap relative min-h-[41rem] sm:min-h-[43rem] lg:flex lg:min-h-[min(76svh,41rem)] lg:items-center">
        <div className="max-w-[36rem] pt-9 sm:pt-12 lg:w-[46%] lg:max-w-none lg:py-20">
          <h1 className="titre text-[clamp(2.75rem,12vw,4.5rem)] leading-[0.95] sm:whitespace-nowrap lg:text-[clamp(3.5rem,5.6vw,5.25rem)]">
            {t('home.heroLines').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block text-vert">{t('home.heroAccent')}</span>
          </h1>
          <p className="mt-6 max-w-[26rem] text-lg leading-relaxed text-ink/80 lg:mt-7 lg:text-xl">
            {t('home.heroText')}
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 lg:flex-row lg:flex-wrap">
            <Link to="/boutique?new=1" className="bouton bouton-plein">
              {t('home.heroShop')}
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link to="/magasins" className="bouton bouton-clair">
              <PinIcon className="size-4" />
              {t('home.heroStores')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandLink({ brand, className = '' }) {
  const mark = <BrandMark name={brand.name} />;
  if (!brand.hasProducts) return <span className={`block ${className}`}>{mark}</span>;
  return (
    <Link
      to={`/boutique?brand=${encodeURIComponent(brand.name)}`}
      className={`block transition-opacity hover:opacity-60 ${className}`}
    >
      {mark}
    </Link>
  );
}

function FeaturedBrands({ brands }) {
  const { t } = useLang();
  if (!brands.length) return null;

  return (
    <section aria-label={t('home.featured')} className="border-b border-trait">
      <div className="sans-barre overflow-x-auto">
        <div className="wrap flex w-max items-center gap-x-10 py-4 lg:w-full lg:gap-x-6">
          <p className="shrink-0 text-[0.9375rem] font-bold">{t('home.featured')}</p>
          <ul className="flex flex-1 items-center justify-between gap-x-10 lg:gap-x-6">
            {brands.slice(0, 8).map((brand) => (
              <li key={brand.name} className="shrink-0">
                <BrandLink brand={brand} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// Section title in two tones, with an optional line of text and a "view all" link.
function Heading({ title, text, link, dark = false }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div>
        <h2 className="titre text-[clamp(2rem,4.4vw,3.25rem)]">
          {title.lead} <span className={dark ? 'text-enseigne' : 'text-vert'}>{title.accent}</span>
        </h2>
        {text && (
          <p className={`mt-3 max-w-xl text-[1.0625rem] ${dark ? 'text-paper/75' : 'text-ardoise'}`}>{text}</p>
        )}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group inline-flex items-center gap-2 border-b-2 border-current pb-1 text-[0.9375rem] font-semibold"
        >
          {link.label}
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function Categories() {
  const { t } = useLang();

  return (
    <section className="bg-sol py-14 lg:py-20">
      <div className="wrap">
        <Heading
          title={t('home.categories')}
          text={t('home.categoriesText')}
          link={{ to: '/boutique', label: t('home.categoriesLink') }}
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <Link
                to={`/boutique?category=${category}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-ink"
              >
                <img
                  src={sized(CATEGORY_PHOTOS[category], 700, 875)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(0deg,rgb(0_0_0/0.82)_0%,rgb(0_0_0/0.25)_42%,rgb(0_0_0/0)_65%)]"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5 text-paper sm:p-5">
                  <div>
                    <h3 className="text-lg font-bold sm:text-xl">{t(`cat.${category}`)}</h3>
                    <p className="mt-0.5 hidden text-[0.8125rem] text-paper/85 sm:block">
                      {t(`catHint.${category}`)}
                    </p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-paper/80 transition-colors group-hover:bg-paper group-hover:text-ink">
                    <ArrowRightIcon className="size-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function NewIn() {
  const { t } = useLang();
  const { data, loading, error } = useApi('/products?new=1&limit=6');
  if (error) return null;

  return (
    <section className="wrap py-14 lg:py-20">
      <Heading
        title={t('home.newIn')}
        text={t('home.newInText')}
        link={{ to: '/boutique?new=1', label: t('home.newInLink') }}
      />
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-6">
        {loading && !data
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <ProductCardSkeleton />
              </li>
            ))
          : data.items.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  );
}

function Stores() {
  const { t } = useLang();
  const { stores } = useStores();
  if (!stores.length) return null;

  return (
    <section className="bg-sol py-14 lg:py-20">
      <div className="wrap">
        <Heading
          title={t('home.stores')}
          text={t('home.storesText')}
          link={{ to: '/magasins', label: t('home.storesLink') }}
        />
        <ul className="mt-8 grid gap-x-5 gap-y-10 md:grid-cols-3">
          {stores.map((store) => (
            <li key={store.id} className="flex flex-col">
              <Link
                to={`/magasins#${store.id}`}
                tabIndex={-1}
                aria-hidden="true"
                className="block overflow-hidden rounded-lg bg-trait"
              >
                <img
                  src={store.images[0]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover"
                />
              </Link>
              <p className="mt-4 text-[0.875rem] text-ardoise">{store.city}</p>
              <h3 className="mt-0.5 text-xl font-bold">
                <Link to={`/magasins#${store.id}`} className="underline-offset-4 hover:underline">
                  {store.name}
                </Link>
              </h3>
              <OpenStatus status={store.status} className="mt-2 text-[0.9375rem]" />
              <address className="mt-2 flex gap-2.5 text-[0.9375rem] not-italic leading-relaxed text-ardoise">
                <PinIcon className="mt-0.5 size-[1.125rem] shrink-0 text-vert" />
                {store.address}
              </address>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                <a href={telHref(store.phone)} className="prix flex items-center gap-2.5 underline-offset-4 hover:underline">
                  <PhoneIcon className="size-[1.125rem]" />
                  {store.phoneDisplay}
                </a>
                <a
                  href={store.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bouton bouton-clair bouton-pilule"
                >
                  {t('stores.directions')}
                  <ArrowRightIcon className="size-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Brands({ brands }) {
  const { t } = useLang();
  if (!brands.length) return null;

  return (
    <section className="sur-noir bg-ink py-14 text-paper lg:py-16">
      <div className="wrap">
        <Heading
          dark
          title={t('home.brands')}
          text={t('home.brandsText')}
          link={{ to: '/a-propos#marques', label: t('home.brandsLink') }}
        />
        <ul className="mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-8">
          {brands.map((brand) => (
            <li key={brand.name}>
              <BrandLink brand={brand} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BehindTheSign() {
  const { t } = useLang();
  const title = t('home.about');

  return (
    <section className="relative flex flex-col overflow-hidden bg-sol">
      <div className="relative order-2 lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:w-[48%]">
        <img
          src={sized(ABOUT_PHOTO, 1400)}
          alt={t('home.aboutAlt')}
          loading="lazy"
          decoding="async"
          className="h-[58vw] max-h-[24rem] w-full object-cover object-[60%_30%] lg:h-full lg:max-h-none"
        />
        {/* Fades the photo into the section instead of ending on a hard edge. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--color-sol)_0%,rgb(241_242_242/0)_38%)] lg:block"
        />
      </div>

      <div className="wrap relative grid gap-6 py-14 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <h2 className="titre text-[clamp(2rem,4.4vw,3.25rem)] lg:col-span-3">
          {title.lead} <span className="text-vert">{title.accent}</span>
        </h2>
        <div className="lg:col-span-4">
          <p className="text-[1.0625rem] leading-relaxed">{t('home.aboutText')}</p>
          <Link to="/a-propos" className="bouton bouton-clair bouton-pilule mt-6">
            {t('home.aboutLink')}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLang();
  const { data: meta } = useApi('/meta');
  const brands = meta?.brands ?? [];
  usePageTitle(t('home.pageTitle'));

  return (
    <>
      <Hero />
      <FeaturedBrands brands={brands} />
      <Categories />
      <NewIn />
      <Stores />
      <Brands brands={brands} />
      <BehindTheSign />
    </>
  );
}

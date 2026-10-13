import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OpenStatus from '../components/OpenStatus.jsx';
import ProductCard, { Badges, Price, ProductImage } from '../components/ProductCard.jsx';
import { CheckIcon } from '../components/Icons.jsx';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';
import { useSelection } from '../context/SelectionContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { useApi } from '../lib/api.js';
import { telHref } from '../lib/format.js';

function NotFound() {
  const { t } = useLang();
  return (
    <div className="wrap py-24">
      <h1 className="titre text-[clamp(2.5rem,7vw,4.5rem)]">{t('product.notFoundTitle')}</h1>
      <p className="mt-4 text-lg text-ardoise">{t('product.notFoundText')}</p>
      <Link to="/boutique" className="bouton bouton-plein mt-8">
        {t('product.backToShop')}
      </Link>
    </div>
  );
}

function Loading() {
  return (
    <div className="wrap grid gap-8 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14" aria-hidden="true">
      <div className="aspect-[4/5] bg-sol" />
      <div className="space-y-4 pt-4">
        <div className="h-4 w-24 bg-sol" />
        <div className="h-10 w-3/4 bg-sol" />
        <div className="h-6 w-32 bg-sol" />
      </div>
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const { t, pick } = useLang();
  const { add, open } = useSelection();
  const { stores } = useStores();
  const { data, loading, error, path } = useApi(`/products/${slug}`);

  const [size, setSize] = useState('');
  const [needsSize, setNeedsSize] = useState(false);
  const [added, setAdded] = useState(false);

  // The fetch hook keeps the previous article while the next one loads.
  const product = path === `/products/${slug}` ? data?.product : null;
  const oneSize = product?.sizes.length === 1;

  useEffect(() => {
    setSize('');
    setNeedsSize(false);
    setAdded(false);
  }, [slug]);

  usePageTitle(product ? `${product.brand} ${pick(product.name)}` : '');

  if (error?.status === 404) return <NotFound />;
  if (error) {
    return (
      <div className="wrap py-24">
        <p className="text-xl font-bold">{t('shop.error')}</p>
        <Link to="/boutique" className="bouton bouton-plein mt-6">
          {t('product.backToShop')}
        </Link>
      </div>
    );
  }
  if (loading || !product) return <Loading />;

  const name = pick(product.name);
  const chosen = oneSize ? product.sizes[0] : size;
  const sizeLabel = product.category === 'chaussures' ? t('product.shoeSize') : t('product.size');

  const addToSelection = () => {
    if (!chosen) {
      setNeedsSize(true);
      return;
    }
    add(product, chosen);
    setAdded(true);
  };

  return (
    <>
      <div className="wrap grid gap-8 pb-16 pt-6 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-10">
        <div className="relative lg:sticky lg:top-36 lg:self-start">
          <ProductImage
            product={product}
            width={900}
            alt={`${product.brand}, ${name}`}
            eager
            className="aspect-[4/5] w-full bg-sol"
          />
          <Badges product={product} className="absolute left-3 top-3" />
        </div>

        <div className="lg:pt-6">
          <nav aria-label={t('product.breadcrumb')} className="text-[0.9375rem] text-ardoise">
            <ol className="flex flex-wrap gap-x-2">
              <li>
                <Link to="/boutique" className="underline-offset-4 hover:text-ink hover:underline">
                  {t('nav.shop')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to={`/boutique?category=${product.category}`}
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  {t(`cat.${product.category}`)}
                </Link>
              </li>
            </ol>
          </nav>

          <p className="mt-6 font-semibold">{product.brand}</p>
          <h1 className="titre mt-2 text-[clamp(2rem,4.4vw,3.5rem)]">{name}</h1>
          <p className="mt-3 text-ardoise">
            {pick(product.type)}, {t(`gender.${product.gender}`).toLowerCase()}
          </p>
          <Price product={product} className="mt-6 text-3xl" />

          {!oneSize && (
            <fieldset className="mt-8">
              <legend className="font-medium">
                {sizeLabel}
                {size && <span className="font-normal text-ardoise"> {size}</span>}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <label key={option} className="cursor-pointer">
                    <input
                      type="radio"
                      name="taille"
                      value={option}
                      checked={size === option}
                      onChange={() => {
                        setSize(option);
                        setNeedsSize(false);
                        setAdded(false);
                      }}
                      className="peer sr-only"
                    />
                    <span className="prix grid h-12 min-w-14 place-items-center rounded-full border-[1.5px] border-trait px-4 font-medium hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              <p role="alert" className="mt-2 text-[0.9375rem] text-soldes empty:hidden">
                {needsSize ? t('product.chooseSize') : ''}
              </p>
            </fieldset>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={addToSelection} className="bouton bouton-plein min-w-64">
              {added && <CheckIcon className="size-4" />}
              {added ? t('product.added') : t('product.add')}
            </button>
            {added && (
              <button type="button" onClick={open} className="bouton bouton-contour">
                {t('product.viewSelection')}
              </button>
            )}
          </div>
          <p className="mt-4 text-[0.9375rem] text-ardoise">{t('product.notice')}</p>

          <p className="mt-10 max-w-prose border-t border-trait pt-8 text-lg leading-relaxed">
            {pick(product.description)}
          </p>

          <section className="mt-10 border-t border-trait pt-8">
            <h2 className="font-bold">{t('product.where')}</h2>
            <ul className="mt-2 divide-y divide-trait">
              {stores
                .filter((store) => product.stores.includes(store.id))
                .map((store) => (
                  <li key={store.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
                    <div>
                      <Link to={`/magasins#${store.id}`} className="font-medium underline-offset-4 hover:underline">
                        {store.name}
                      </Link>
                      <p className="mt-0.5 text-[0.875rem] text-ardoise">
                        <OpenStatus status={store.status} />
                      </p>
                    </div>
                    <a
                      href={telHref(store.phone)}
                      aria-label={`${t('product.call')} ${store.name}`}
                      className="prix underline-offset-4 hover:underline"
                    >
                      {store.phoneDisplay}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="bg-sol py-16 lg:py-20">
          <div className="wrap">
            <h2 className="titre text-[clamp(1.75rem,4vw,2.75rem)]">{t('product.related')}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-5 [&_.bg-sol]:bg-paper">
              {data.related.map((item) => (
                <li key={item.slug}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

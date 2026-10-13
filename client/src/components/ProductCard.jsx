import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartIcon, CheckIcon } from './Icons.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useSelection } from '../context/SelectionContext.jsx';
import { discountPercent, formatPrice, sized } from '../lib/format.js';

export function ProductImage({ product, width = 600, alt = '', eager = false, className = '' }) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);

  // If the photo is missing or the image host is unreachable, the brand name stands in.
  if (failed || !product.image) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-sol p-4 text-center ${className}`}>
        <span className="titre text-xl">{product.brand}</span>
        <span className="text-[0.8125rem] text-ardoise">{t('product.photoMissing')}</span>
      </div>
    );
  }

  const height = Math.round(width * 1.25);
  return (
    <img
      src={sized(product.image, width, height)}
      srcSet={`${sized(product.image, width, height)} 1x, ${sized(product.image, width * 2, height * 2)} 2x`}
      width={width}
      height={height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export function Price({ product, className = '' }) {
  const { t, lang } = useLang();
  const reduced = discountPercent(product.price, product.compareAt) > 0;

  if (!reduced) {
    return <p className={`prix ${className}`}>{formatPrice(product.price, lang)}</p>;
  }
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2.5 ${className}`}>
      <span className="sr-only">{t('product.now')}</span>
      <span className="prix text-soldes">{formatPrice(product.price, lang)}</span>
      <span className="sr-only">{t('product.was')}</span>
      <s className="prix text-[0.85em] font-normal text-ardoise">
        {formatPrice(product.compareAt, lang)}
      </s>
    </p>
  );
}

export function Badges({ product, className = '' }) {
  const { t } = useLang();
  const off = discountPercent(product.price, product.compareAt);
  if (!off && !product.isNew) return null;
  return (
    <div className={`flex flex-col items-start gap-1.5 ${className}`}>
      {product.isNew && (
        <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-paper">
          {t('product.new')}
        </span>
      )}
      {off > 0 && (
        <span className="prix rounded-full bg-soldes px-2.5 py-1 text-xs text-paper">-{off}&nbsp;%</span>
      )}
    </div>
  );
}

export default function ProductCard({ product, heading: Heading = 'h3', eager = false }) {
  const { t, pick } = useLang();
  const { add } = useSelection();
  const [choosing, setChoosing] = useState(false);
  const [added, setAdded] = useState(false);
  const card = useRef(null);

  const name = pick(product.name);
  const oneSize = product.sizes.length === 1;

  // The size picker closes on Escape or on a click anywhere outside the card.
  useEffect(() => {
    if (!choosing) return;
    const onPointer = (event) => {
      if (!card.current?.contains(event.target)) setChoosing(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setChoosing(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [choosing]);

  // The tick is a brief confirmation, then the button is ready again.
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);

  const addSize = (size) => {
    add(product, size);
    setChoosing(false);
    setAdded(true);
  };

  return (
    <article ref={card} className="relative flex h-full flex-col">
      <Link
        to={`/produit/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-sol"
      >
        <ProductImage product={product} eager={eager} className="size-full" />
        <Badges product={product} className="absolute left-2.5 top-2.5" />
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[0.8125rem] font-bold">{product.brand}</p>
        <Heading className="mt-0.5 text-[0.9375rem] leading-snug">
          <Link to={`/produit/${product.slug}`} className="underline-offset-4 hover:underline">
            {name}
          </Link>
        </Heading>
        <p className="mt-0.5 text-[0.8125rem] text-ardoise">
          {pick(product.type)}, {t(`gender.${product.gender}`).toLowerCase()}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <Price product={product} className="text-[1.0625rem]" />
          <button
            type="button"
            onClick={() => (oneSize ? addSize(product.sizes[0]) : setChoosing((value) => !value))}
            aria-label={t('product.quickAdd', name)}
            aria-expanded={oneSize ? undefined : choosing}
            className={`grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-[1.5px] transition-colors ${
              added
                ? 'border-vert bg-vert text-paper'
                : 'border-ink hover:bg-ink hover:text-paper'
            }`}
          >
            {added ? <CheckIcon className="size-[1.125rem]" /> : <CartIcon className="size-[1.125rem]" />}
          </button>
        </div>
        <span role="status" className="sr-only">
          {added ? t('product.added') : ''}
        </span>
      </div>

      {choosing && (
        <div
          role="group"
          aria-label={t('product.pickSize')}
          className="absolute inset-x-0 bottom-14 z-10 rounded-lg border border-trait bg-paper p-3 shadow-[0_10px_30px_rgb(0_0_0/0.14)]"
        >
          <p className="text-[0.8125rem] font-semibold">{t('product.pickSize')}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => addSize(size)}
                className="prix min-h-9 min-w-10 cursor-pointer rounded-full border-[1.5px] border-trait px-2.5 text-[0.875rem] font-medium hover:border-ink hover:bg-ink hover:text-paper"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/5] rounded-lg bg-sol" />
      <div className="mt-3 h-3 w-16 bg-sol" />
      <div className="mt-2 h-3 w-40 max-w-full bg-sol" />
      <div className="mt-4 h-5 w-24 bg-sol" />
    </div>
  );
}

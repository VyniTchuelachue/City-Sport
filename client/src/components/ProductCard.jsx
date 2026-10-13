import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
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
  const { pick } = useLang();
  return (
    <article>
      <Link to={`/produit/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-sol">
          <ProductImage product={product} eager={eager} className="size-full" />
          <Badges product={product} className="absolute left-2.5 top-2.5" />
        </div>
        <div className="pt-3">
          <p className="text-[0.8125rem] font-semibold">{product.brand}</p>
          <Heading className="mt-0.5 text-[0.9375rem] leading-snug text-ardoise underline-offset-4 group-hover:text-ink group-hover:underline">
            {pick(product.name)}
          </Heading>
          <Price product={product} className="mt-1.5 text-[1.0625rem]" />
        </div>
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/5] bg-sol" />
      <div className="mt-3 h-3 w-16 bg-sol" />
      <div className="mt-2 h-3 w-40 max-w-full bg-sol" />
      <div className="mt-2 h-4 w-24 bg-sol" />
    </div>
  );
}

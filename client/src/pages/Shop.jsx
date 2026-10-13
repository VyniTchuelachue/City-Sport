import { useSearchParams } from 'react-router-dom';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx';
import { CloseIcon } from '../components/Icons.jsx';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';
import { useApi } from '../lib/api.js';
import { CATEGORIES, GENDERS } from '../lib/company.js';

const FILTER_KEYS = ['category', 'gender', 'brand', 'sale', 'new', 'q', 'sort'];

function Pills({ label, value, options, onChange }) {
  return (
    <div role="group" aria-label={label} className="sans-barre -mx-[clamp(1.125rem,4vw,3.5rem)] flex gap-2 overflow-x-auto px-[clamp(1.125rem,4vw,3.5rem)] sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`min-h-10 shrink-0 cursor-pointer rounded-full border-[1.5px] px-4 text-[0.9375rem] font-medium transition-colors ${
              active
                ? 'border-ink bg-ink text-paper'
                : 'border-trait bg-paper hover:border-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Select({ id, label, value, onChange, children }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-[0.9375rem]">
      <span className="text-ardoise">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 cursor-pointer rounded-full border-[1.5px] border-trait bg-paper py-1 pl-4 pr-8 font-medium hover:border-ink focus:border-ink"
      >
        {children}
      </select>
    </label>
  );
}

export default function Shop() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();

  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? '']));
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value)
  ).toString();

  const { data, loading, error, retry } = useApi(`/products${query ? `?${query}` : ''}`);
  const { data: meta } = useApi('/meta');

  const heading = filters.category ? t(`cat.${filters.category}`) : t('shop.title');
  usePageTitle(filters.category ? t(`cat.${filters.category}`) : t('shop.pageTitle'));

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { preventScrollReset: true });
  };

  const hasFilters = FILTER_KEYS.some((key) => key !== 'sort' && filters[key]);

  return (
    <div className="wrap pb-20 pt-10 lg:pb-28 lg:pt-14">
      <h1 className="titre text-[clamp(2.75rem,8vw,5.5rem)]">{heading}</h1>

      {filters.q && (
        <p className="mt-5 flex flex-wrap items-center gap-3 text-lg">
          {t('shop.resultsFor', filters.q)}
          <button
            type="button"
            onClick={() => setFilter('q', '')}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-trait px-3 text-[0.875rem] font-medium hover:border-ink"
          >
            <CloseIcon className="size-3.5" />
            {t('shop.clearSearch')}
          </button>
        </p>
      )}

      <div className="mt-8 space-y-3">
        <Pills
          label={t('shop.category')}
          value={filters.category}
          onChange={(value) => setFilter('category', value)}
          options={[
            { value: '', label: t('shop.all') },
            ...CATEGORIES.map((category) => ({ value: category, label: t(`cat.${category}`) })),
          ]}
        />
        <Pills
          label={t('shop.gender')}
          value={filters.gender}
          onChange={(value) => setFilter('gender', value)}
          options={[
            { value: '', label: t('shop.everyone') },
            ...GENDERS.map((gender) => ({ value: gender, label: t(`gender.${gender}`) })),
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-trait py-3">
        <Select id="filtre-marque" label={t('shop.brand')} value={filters.brand} onChange={(value) => setFilter('brand', value)}>
          <option value="">{t('shop.allBrands')}</option>
          {(meta?.brands ?? []).map((brand) => (
            <option key={brand.name} value={brand.name}>
              {brand.name}
            </option>
          ))}
        </Select>
        <Select id="filtre-tri" label={t('shop.sort')} value={filters.sort} onChange={(value) => setFilter('sort', value)}>
          <option value="">{t('shop.sortNew')}</option>
          <option value="price-asc">{t('shop.sortAsc')}</option>
          <option value="price-desc">{t('shop.sortDesc')}</option>
        </Select>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[0.9375rem] font-medium">
          <input
            type="checkbox"
            checked={Boolean(filters.sale)}
            onChange={(event) => setFilter('sale', event.target.checked ? '1' : '')}
            className="size-[1.125rem] cursor-pointer accent-vert"
          />
          {t('shop.sale')}
        </label>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[0.9375rem] font-medium">
          <input
            type="checkbox"
            checked={Boolean(filters.new)}
            onChange={(event) => setFilter('new', event.target.checked ? '1' : '')}
            className="size-[1.125rem] cursor-pointer accent-vert"
          />
          {t('shop.newOnly')}
        </label>
        <p className="ml-auto text-[0.9375rem] text-ardoise" aria-live="polite">
          {data ? t('shop.count', data.total) : ' '}
        </p>
      </div>

      {error ? (
        <div className="py-20">
          <p className="text-xl font-bold">{t('shop.error')}</p>
          <button type="button" onClick={retry} className="bouton bouton-plein mt-6">
            {t('shop.retry')}
          </button>
        </div>
      ) : data && data.total === 0 ? (
        <div className="py-20">
          <p className="text-xl font-bold">{t('shop.emptyTitle')}</p>
          <p className="mt-2 text-ardoise">{t('shop.emptyText')}</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setParams({}, { preventScrollReset: true })}
              className="bouton bouton-plein mt-6"
            >
              {t('shop.reset')}
            </button>
          )}
        </div>
      ) : (
        <ul
          className={`mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 ${
            loading && data ? 'opacity-60' : ''
          }`}
        >
          {data
            ? data.items.map((product, index) => (
                <li key={product.slug}>
                  <ProductCard product={product} heading="h2" eager={index < 4} />
                </li>
              ))
            : Array.from({ length: 8 }, (_, i) => (
                <li key={i}>
                  <ProductCardSkeleton />
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}

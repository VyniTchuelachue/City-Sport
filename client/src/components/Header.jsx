import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import OpenStatus from './OpenStatus.jsx';
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from './Icons.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useSelection } from '../context/SelectionContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { CATEGORIES } from '../lib/company.js';

function StoreStrip() {
  const { t, toggle } = useLang();
  const { stores } = useStores();
  const openCount = stores.filter((store) => store.status.open).length;

  return (
    <div className="sur-noir bg-ink text-paper">
      <div className="wrap flex min-h-9 items-center justify-between gap-4 text-[0.8125rem]">
        {/* Phones get one summary line; wider screens list each store. */}
        <Link to="/magasins" className="py-2 hover:underline lg:hidden">
          {stores.length ? t('status.openCount', openCount) : t('nav.stores')}
        </Link>
        <ul className="hidden items-center gap-x-8 lg:flex">
          {stores.map((store) => (
            <li key={store.id}>
              <Link to={`/magasins#${store.id}`} className="flex items-center gap-2 py-2 hover:underline">
                <span className="font-semibold">{store.shortName}</span>
                <OpenStatus status={store.status} className="text-paper/80" />
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={toggle}
          aria-label={t('nav.switchLangLabel')}
          className="cursor-pointer py-2 font-semibold underline-offset-4 hover:underline"
        >
          {t('nav.switchLang')}
        </button>
      </div>
    </div>
  );
}

function SearchForm({ id, onDone, autoFocus = false, className = '' }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/boutique?q=${encodeURIComponent(q)}` : '/boutique');
    setQuery('');
    onDone?.();
  };

  return (
    <form role="search" onSubmit={submit} className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {t('nav.searchLabel')}
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('nav.searchPlaceholder')}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-11 w-full rounded-full border-[1.5px] border-trait bg-paper pl-4 pr-11 text-[0.9375rem] placeholder:text-ardoise hover:border-ardoise focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        aria-label={t('nav.search')}
        className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full hover:bg-sol"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

const navLinkClass = ({ isActive }) =>
  `relative py-2 text-[0.9375rem] font-medium underline-offset-[6px] decoration-2 hover:underline ${
    isActive ? 'underline' : ''
  }`;

export default function Header() {
  const { t } = useLang();
  const { count, open } = useSelection();
  const { stores } = useStores();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButton = useRef(null);

  // Any navigation closes the overlays.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Category links are "active" only when that exact category is being browsed.
  const activeCategory =
    location.pathname === '/boutique' ? new URLSearchParams(location.search).get('category') : null;

  return (
    <header className="sticky top-0 z-40 bg-paper">
      <StoreStrip />
      <div className="border-b border-trait">
        <div className="wrap flex h-16 items-center gap-4 lg:h-[4.5rem] lg:gap-8">
          <Link to="/" aria-label={t('nav.home')} className="shrink-0">
            <Logo className="h-7 w-auto lg:h-8" />
          </Link>

          <nav aria-label={t('nav.main')} className="hidden flex-1 lg:block">
            <ul className="flex items-center gap-x-6 xl:gap-x-8">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    to={`/boutique?category=${category}`}
                    aria-current={activeCategory === category ? 'page' : undefined}
                    className={navLinkClass({ isActive: activeCategory === category })}
                  >
                    {t(`cat.${category}`)}
                  </Link>
                </li>
              ))}
              <li aria-hidden="true" className="h-5 w-px bg-trait" />
              <li>
                <NavLink to="/magasins" className={navLinkClass}>
                  {t('nav.stores')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/a-propos" className={navLinkClass}>
                  {t('nav.about')}
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:gap-3">
            <SearchForm id="recherche" className="hidden w-56 xl:block xl:w-64" />
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-expanded={searchOpen}
              aria-controls="recherche-mobile"
              aria-label={t('nav.search')}
              className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-sol xl:hidden"
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
            </button>
            <button
              type="button"
              onClick={open}
              aria-label={t('nav.selectionCount', count)}
              className="relative flex h-11 cursor-pointer items-center gap-2 rounded-full px-3 hover:bg-sol"
            >
              <BagIcon />
              <span className="hidden text-[0.9375rem] font-medium sm:inline">{t('nav.selection')}</span>
              {count > 0 && (
                <span className="prix grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-xs text-paper">
                  {count}
                </span>
              )}
            </button>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={t('nav.openMenu')}
              className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-sol lg:hidden"
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div id="recherche-mobile" className="wrap pb-4 xl:hidden">
            <SearchForm id="recherche-m" autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}
      </div>

      {menuOpen && (
        <div
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.main')}
          className="fixed inset-0 z-50 flex animate-voile flex-col overflow-y-auto bg-paper lg:hidden"
        >
          <div className="wrap flex h-16 shrink-0 items-center justify-between border-b border-trait">
            <Logo className="h-7 w-auto" />
            <button
              type="button"
              autoFocus
              onClick={() => {
                setMenuOpen(false);
                menuButton.current?.focus();
              }}
              aria-label={t('nav.closeMenu')}
              className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-sol"
            >
              <CloseIcon />
            </button>
          </div>
          <nav aria-label={t('nav.main')} className="wrap flex-1 py-8">
            <ul className="titre space-y-3 text-[clamp(2rem,9vw,3rem)]">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link to={`/boutique?category=${category}`} className="block py-1">
                    {t(`cat.${category}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-8 space-y-1 border-t border-trait pt-6 text-lg font-medium">
              {[
                ['/boutique', 'nav.shop'],
                ['/magasins', 'nav.stores'],
                ['/a-propos', 'nav.about'],
                ['/contact', 'nav.contact'],
              ].map(([to, key]) => (
                <li key={to}>
                  <Link to={to} className="block py-2">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-3 border-t border-trait pt-6 text-[0.9375rem]">
              {stores.map((store) => (
                <li key={store.id}>
                  <Link to={`/magasins#${store.id}`} className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-semibold">{store.name}</span>
                    <OpenStatus status={store.status} className="text-ardoise" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

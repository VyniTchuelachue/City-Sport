import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import OpenStatus from './OpenStatus.jsx';
import { CartIcon, CloseIcon, MenuIcon, PinIcon, SearchIcon } from './Icons.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useSelection } from '../context/SelectionContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { CATEGORIES } from '../lib/company.js';

// Thin black bar above the header: tagline, how many stores are open right now,
// and a few shortcuts. Phones keep only the live status and the language switch.
function TopStrip() {
  const { t, toggle } = useLang();
  const { stores } = useStores();
  const openCount = stores.filter((store) => store.status.open).length;

  return (
    <div className="sur-noir bg-ink text-paper">
      <div className="wrap flex min-h-9 items-center justify-between gap-6 text-[0.8125rem]">
        <p className="hidden items-center gap-2 lg:flex">
          <PinIcon className="size-4 text-enseigne" />
          {t('strip.tagline')}
        </p>
        <Link to="/magasins" className="flex items-center gap-2 py-2 hover:underline">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${openCount ? 'bg-enseigne' : 'border-[1.5px] border-current opacity-60'}`}
          />
          {stores.length ? t('status.openCount', openCount) : t('nav.stores')}
        </Link>
        <ul className="flex items-center divide-x divide-paper/30">
          <li className="hidden pr-4 md:block">
            <Link to="/a-propos#marques" className="hover:underline">
              {t('strip.brands')}
            </Link>
          </li>
          <li className="hidden px-4 md:block">
            <Link to="/magasins" className="hover:underline">
              {t('strip.visit')}
            </Link>
          </li>
          <li className="md:pl-4">
            <button
              type="button"
              onClick={toggle}
              aria-label={t('nav.switchLangLabel')}
              className="cursor-pointer py-2 font-semibold underline-offset-4 hover:underline"
            >
              {t('nav.switchLang')}
            </button>
          </li>
        </ul>
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
      <button
        type="submit"
        aria-label={t('nav.search')}
        className="absolute left-1 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-md hover:bg-trait"
      >
        <SearchIcon />
      </button>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('nav.searchPlaceholder')}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-11 w-full rounded-lg border-[1.5px] border-transparent bg-sol pl-11 pr-4 text-[0.9375rem] placeholder:text-ardoise hover:border-trait focus:border-ink focus:bg-paper focus:outline-none"
      />
    </form>
  );
}

const navLinkClass = ({ isActive }) =>
  `relative whitespace-nowrap py-2 text-[0.9375rem] font-semibold underline-offset-[6px] decoration-2 decoration-vert hover:underline ${
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
      <TopStrip />
      <div className="border-b border-trait">
        <div className="wrap flex h-16 items-center gap-4 lg:h-[4.5rem] lg:gap-8">
          <Link to="/" aria-label={t('nav.home')} className="shrink-0">
            <Logo className="h-7 w-auto lg:h-9" />
          </Link>

          <nav aria-label={t('nav.main')} className="hidden lg:block">
            <ul className="flex items-center gap-x-5 xl:gap-x-8">
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

          <div className="ml-auto flex items-center gap-1 xl:flex-1 xl:justify-end xl:gap-4">
            <SearchForm id="recherche" className="hidden max-w-md flex-1 xl:block" />
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-expanded={searchOpen}
              aria-controls="recherche-mobile"
              aria-label={t('nav.search')}
              className="grid size-11 cursor-pointer place-items-center rounded-lg hover:bg-sol xl:hidden"
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
            </button>
            <button
              type="button"
              onClick={open}
              aria-label={t('nav.selectionCount', count)}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 hover:bg-sol"
            >
              <span className="relative">
                <CartIcon className="size-6" />
                {count > 0 && (
                  <span className="prix absolute -right-2 -top-2 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-vert px-1 text-[0.6875rem] text-paper">
                    {count}
                  </span>
                )}
              </span>
              <span className="hidden whitespace-nowrap text-[0.9375rem] font-semibold sm:inline lg:hidden xl:inline">
                {t('nav.selection')}
              </span>
            </button>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={t('nav.openMenu')}
              className="grid size-11 cursor-pointer place-items-center rounded-lg hover:bg-sol lg:hidden"
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
              className="grid size-11 cursor-pointer place-items-center rounded-lg hover:bg-sol"
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

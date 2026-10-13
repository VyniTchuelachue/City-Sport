import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { describeFailure, isEmail } from './Field.jsx';
import { ArrowRightIcon, CheckIcon, PhoneIcon, YoutubeIcon } from './Icons.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { api } from '../lib/api.js';
import { CATEGORIES, company, payments } from '../lib/company.js';
import { telHref } from '../lib/format.js';

const link = 'underline-offset-4 hover:text-paper hover:underline';

function Column({ title, children, className = '' }) {
  return (
    <div className={className}>
      <h2 className="text-[0.9375rem] font-bold">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-[0.9375rem] text-paper/75">{children}</ul>
    </div>
  );
}

function Newsletter() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setDone(false);
    if (!isEmail(email.trim())) return setError(t('errors.email'));
    if (!consent) return setError(t('errors.consent'));
    setError('');
    setSending(true);
    try {
      await api('/newsletter', { method: 'POST', body: { email, consent, website } });
      setDone(true);
      setEmail('');
      setConsent(false);
    } catch (err) {
      const failure = describeFailure(err, t, {
        email: () => t('errors.email'),
        consent: () => t('errors.consent'),
      });
      setError(failure.fields.email ?? failure.fields.consent ?? failure.summary);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-[0.9375rem] font-bold">{t('footer.newsletterTitle')}</h2>
      <p className="mt-4 text-[0.9375rem] text-paper/75">{t('footer.newsletterText')}</p>
      <div className="relative mt-4">
        <label htmlFor="newsletter-email" className="sr-only">
          {t('footer.emailLabel')}
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('footer.emailLabel')}
          autoComplete="email"
          maxLength={120}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby="newsletter-message"
          className="h-12 w-full rounded-full bg-paper pl-5 pr-14 text-[0.9375rem] text-ink placeholder:text-ardoise focus:outline-2 focus:outline-offset-2 focus:outline-paper"
        />
        <button
          type="submit"
          disabled={sending}
          aria-label={t('footer.subscribe')}
          className="absolute right-1.5 top-1.5 grid size-9 cursor-pointer place-items-center rounded-full bg-ink text-paper hover:bg-vert disabled:opacity-50"
        >
          <ArrowRightIcon className="size-4" />
        </button>
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[0.8125rem] text-paper/75">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-enseigne"
        />
        {t('footer.consent')}
      </label>
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="newsletter-website">Website</label>
        <input
          id="newsletter-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      <p id="newsletter-message" role="status" className="mt-3 text-[0.875rem] empty:hidden">
        {error ? (
          <span className="text-[#ff9aa5]">{error}</span>
        ) : done ? (
          <span className="inline-flex items-center gap-2 text-enseigne">
            <CheckIcon className="size-4" />
            {t('footer.subscribed')}
          </span>
        ) : null}
      </p>
    </form>
  );
}

export default function Footer() {
  const { t } = useLang();
  const { stores } = useStores();

  return (
    <footer className="sur-noir bg-ink text-paper">
      <div className="wrap py-14 lg:py-16">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-3">
            <Logo className="h-10 w-auto" />
            <p className="mt-5 max-w-xs text-[0.9375rem] text-paper/75">{t('footer.tagline')}</p>
            <p className="mt-4 text-[0.9375rem] text-paper/75">
              <a href={telHref(company.phone)} className={`prix font-normal ${link}`}>
                {company.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${company.email}`} className={link}>
                {company.email}
              </a>
            </p>
            <a
              href={company.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label={t('footer.youtube')}
              className="mt-6 inline-grid size-10 place-items-center rounded-full border border-paper/30 hover:border-paper"
            >
              <YoutubeIcon />
            </a>
          </div>

          <Column title={t('footer.shop')} className="lg:col-span-2">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link to={`/boutique?category=${category}`} className={link}>
                  {t(`cat.${category}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/boutique?new=1" className={link}>
                {t('shop.newOnly')}
              </Link>
            </li>
            <li>
              <Link to="/boutique?sale=1" className={link}>
                {t('shop.sale')}
              </Link>
            </li>
          </Column>

          <Column title={t('footer.stores')} className="lg:col-span-2">
            {stores.map((store) => (
              <li key={store.id} className="pb-1">
                <Link to={`/magasins#${store.id}`} className={link}>
                  {store.name}
                </Link>
                <a href={telHref(store.phone)} className={`prix mt-1 flex items-center gap-2 font-normal ${link}`}>
                  <PhoneIcon className="size-4 text-enseigne" />
                  {store.phoneDisplay}
                </a>
              </li>
            ))}
          </Column>

          <Column title={t('footer.company')} className="lg:col-span-2">
            <li>
              <Link to="/a-propos" className={link}>
                {t('footer.aboutLink')}
              </Link>
            </li>
            <li>
              <Link to="/a-propos#marques" className={link}>
                {t('strip.brands')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className={link}>
                {t('nav.contact')}
              </Link>
            </li>
          </Column>

          <div className="sm:col-span-2 lg:col-span-3">
            <Newsletter />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/20 pt-6 text-[0.8125rem] text-paper/70 lg:flex-row lg:items-center lg:justify-between">
          <p>{t('footer.rights', new Date().getFullYear())}</p>
          <p>{t('footer.payments', payments.join(', '))}</p>
          <p>{t('footer.group')}</p>
        </div>
      </div>
    </footer>
  );
}

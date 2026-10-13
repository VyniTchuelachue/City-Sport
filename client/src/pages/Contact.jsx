import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Field, { describeFailure, isEmail, isPhone } from '../components/Field.jsx';
import { CheckIcon, MailIcon, PhoneIcon } from '../components/Icons.jsx';
import OpenStatus from '../components/OpenStatus.jsx';
import { useLang, usePageTitle } from '../context/LanguageContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { api } from '../lib/api.js';
import { company } from '../lib/company.js';
import { telHref } from '../lib/format.js';

export default function Contact() {
  const { t } = useLang();
  const { stores } = useStores();
  const [params] = useSearchParams();
  usePageTitle(t('contact.pageTitle'));

  const blank = {
    name: '',
    email: '',
    phone: '',
    storeId: params.get('magasin') ?? '',
    subject: '',
    message: '',
    website: '',
  };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const found = {};
    if (form.name.trim().length < 2) found.name = t('errors.name');
    if (!email && !phone) found.email = t('errors.contactRequired');
    else if (email && !isEmail(email)) found.email = t('errors.email');
    if (phone && !isPhone(phone)) found.phone = t('errors.phone');
    if (form.message.trim().length < 10) found.message = t('errors.message');
    setErrors(found);
    setSummary('');
    if (Object.keys(found).length) {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSending(true);
    try {
      await api('/contact', { method: 'POST', body: form });
      setSent(true);
      setForm({ ...blank, storeId: '' });
    } catch (err) {
      const failure = describeFailure(err, t, {
        name: () => t('errors.name'),
        email: (code) => t(code === 'contact_required' ? 'errors.contactRequired' : 'errors.email'),
        phone: () => t('errors.phone'),
        message: () => t('errors.message'),
        storeId: () => t('errors.store'),
      });
      setErrors(failure.fields);
      setSummary(failure.summary);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="wrap pb-20 pt-10 lg:pb-28 lg:pt-14">
      <h1 className="titre text-[clamp(2.75rem,8vw,5.5rem)]">{t('contact.title')}</h1>
      <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ardoise">{t('contact.intro')}</p>

      <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {sent ? (
            <div role="status" className="border-t border-ink pt-8">
              <span className="grid size-12 place-items-center rounded-full bg-enseigne">
                <CheckIcon className="size-6" />
              </span>
              <h2 className="titre mt-5 text-3xl">{t('contact.sentTitle')}</h2>
              <p className="mt-3 text-lg text-ardoise">{t('contact.sentText')}</p>
              <button type="button" onClick={() => setSent(false)} className="bouton bouton-contour mt-8">
                {t('contact.another')}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5 border-t border-ink pt-8">
              <Field id="contact-name" label={t('contact.name')} error={errors.name}>
                {(props) => (
                  <input {...props} className="champ" value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
                )}
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="contact-email" label={t('contact.email')} error={errors.email}>
                  {(props) => (
                    <input {...props} className="champ" type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={120} />
                  )}
                </Field>
                <Field id="contact-phone" label={t('contact.phone')} error={errors.phone}>
                  {(props) => (
                    <input {...props} className="champ" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={30} />
                  )}
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="contact-storeId" label={t('contact.store')} error={errors.storeId}>
                  {(props) => (
                    <select {...props} className="champ" value={form.storeId} onChange={set('storeId')}>
                      <option value="">{t('contact.anyStore')}</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field id="contact-subject" label={t('contact.subject')} optional={t('contact.optional')}>
                  {(props) => (
                    <input {...props} className="champ" value={form.subject} onChange={set('subject')} maxLength={120} />
                  )}
                </Field>
              </div>
              <Field id="contact-message" label={t('contact.message')} error={errors.message}>
                {(props) => (
                  <textarea {...props} className="champ" rows={6} value={form.message} onChange={set('message')} maxLength={2000} />
                )}
              </Field>
              {/* Honeypot: hidden from people, tempting for bots. */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </div>
              <p role="alert" className="text-soldes empty:hidden">
                {summary}
              </p>
              <button type="submit" disabled={sending} className="bouton bouton-plein min-w-56">
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          )}
        </div>

        <aside className="lg:col-span-5">
          <div className="border-t border-ink pt-8">
            <h2 className="text-lg font-bold">{t('contact.headOffice')}</h2>
            <p className="mt-2 text-ardoise">
              {company.legalName}, {t('contact.headOfficeAddress')}
            </p>
            <p className="mt-4 flex items-center gap-3">
              <PhoneIcon className="size-5 shrink-0" />
              <a href={telHref(company.phone)} className="prix text-lg underline-offset-4 hover:underline">
                {company.phoneDisplay}
              </a>
            </p>
            <p className="mt-2 flex items-center gap-3">
              <MailIcon className="size-5 shrink-0" />
              <a href={`mailto:${company.email}`} className="break-all underline-offset-4 hover:underline">
                {company.email}
              </a>
            </p>
          </div>

          <div className="mt-10 border-t border-ink pt-8">
            <h2 className="text-lg font-bold">{t('contact.storesTitle')}</h2>
            <ul className="mt-2 divide-y divide-trait">
              {stores.map((store) => (
                <li key={store.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
                  <div>
                    <p className="font-medium">{store.name}</p>
                    <p className="mt-0.5 text-[0.875rem] text-ardoise">
                        <OpenStatus status={store.status} />
                      </p>
                  </div>
                  <a href={telHref(store.phone)} className="prix text-lg underline-offset-4 hover:underline">
                    {store.phoneDisplay}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

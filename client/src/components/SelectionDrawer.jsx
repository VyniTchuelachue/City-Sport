import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Field, { describeFailure, isPhone } from './Field.jsx';
import { ProductImage } from './ProductCard.jsx';
import { CheckIcon, CloseIcon, MinusIcon, PlusIcon } from './Icons.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useSelection } from '../context/SelectionContext.jsx';
import { useStores } from '../context/StoresContext.jsx';
import { api } from '../lib/api.js';
import { formatPrice } from '../lib/format.js';

const emptyForm = { name: '', phone: '', storeId: '', note: '', website: '' };

function Line({ item }) {
  const { t, pick, lang } = useLang();
  const { setQuantity, remove, maxQuantity, close } = useSelection();
  const name = pick(item.name);

  return (
    <li className="flex gap-4 py-4">
      <Link to={`/produit/${item.slug}`} onClick={close} className="w-20 shrink-0" tabIndex={-1} aria-hidden="true">
        <ProductImage product={item} width={160} className="aspect-[4/5] w-full" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] font-semibold">{item.brand}</p>
        <Link to={`/produit/${item.slug}`} onClick={close} className="block text-[0.9375rem] leading-snug hover:underline">
          {name}
        </Link>
        <p className="mt-0.5 text-[0.875rem] text-ardoise">
          {item.size === 'TU' ? t('product.oneSize') : `${t('product.size')} ${item.size}`}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-full border-[1.5px] border-trait">
            <button
              type="button"
              onClick={() => setQuantity(item.key, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label={t('selection.decrease')}
              className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-sol disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MinusIcon className="size-4" />
            </button>
            <span className="prix min-w-6 text-center text-[0.9375rem]" aria-label={`${t('selection.quantity')} ${item.quantity}`}>
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.key, item.quantity + 1)}
              disabled={item.quantity >= maxQuantity}
              aria-label={t('selection.increase')}
              className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-sol disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
          <p className="prix">{formatPrice(item.price * item.quantity, lang)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => remove(item.key)}
        aria-label={t('selection.remove', name)}
        className="-mr-2 -mt-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-ardoise hover:bg-sol hover:text-ink"
      >
        <CloseIcon className="size-4" />
      </button>
    </li>
  );
}

function RequestForm({ onSent }) {
  const { t } = useLang();
  const { items } = useSelection();
  const { stores } = useStores();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState('');
  const [sending, setSending] = useState(false);

  const set = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = t('errors.name');
    if (!isPhone(form.phone.trim())) found.phone = t('errors.phone');
    if (!form.storeId) found.storeId = t('errors.store');
    setErrors(found);
    setSummary('');
    if (Object.keys(found).length) {
      document.getElementById(`demande-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSending(true);
    try {
      const result = await api('/requests', {
        method: 'POST',
        body: {
          ...form,
          items: items.map(({ slug, size, quantity }) => ({ slug, size, quantity })),
        },
      });
      const store = stores.find((s) => s.id === form.storeId);
      onSent({ reference: result.reference, store: store?.name ?? '' });
    } catch (err) {
      const failure = describeFailure(err, t, {
        name: () => t('errors.name'),
        phone: () => t('errors.phone'),
        storeId: () => t('errors.store'),
        items: () => t('errors.items'),
      });
      setErrors(failure.fields);
      setSummary(failure.fields.items ?? failure.summary);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <h3 className="text-lg font-bold">{t('selection.formTitle')}</h3>
        <p className="mt-1 text-[0.9375rem] text-ardoise">{t('selection.formText')}</p>
      </div>
      <Field id="demande-name" label={t('selection.name')} error={errors.name}>
        {(props) => (
          <input {...props} className="champ" value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
        )}
      </Field>
      <Field id="demande-phone" label={t('selection.phone')} error={errors.phone}>
        {(props) => (
          <input {...props} className="champ" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={30} />
        )}
      </Field>
      <Field id="demande-storeId" label={t('selection.store')} error={errors.storeId}>
        {(props) => (
          <select {...props} className="champ" value={form.storeId} onChange={set('storeId')}>
            <option value="">{t('selection.chooseStore')}</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.city})
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="demande-note" label={t('selection.note')} optional={t('selection.optional')}>
        {(props) => (
          <textarea {...props} className="champ" rows={2} value={form.note} onChange={set('note')} maxLength={500} />
        )}
      </Field>
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="demande-website">Website</label>
        <input id="demande-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>
      <p role="alert" className="text-[0.9375rem] text-soldes empty:hidden">
        {summary}
      </p>
      <button type="submit" disabled={sending} className="bouton bouton-plein w-full">
        {sending ? t('selection.sending') : t('selection.send')}
      </button>
    </form>
  );
}

export default function SelectionDrawer() {
  const { t, lang } = useLang();
  const { items, total, isOpen, close, clear } = useSelection();
  const [sent, setSent] = useState(null);
  const panel = useRef(null);
  const closeButton = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      // Keep keyboard focus inside the drawer while it is open.
      const focusable = panel.current.querySelectorAll(
        'a[href]:not([tabindex="-1"]), button:not(:disabled), input:not([tabindex="-1"]), select, textarea'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [isOpen, close]);

  // A confirmation belongs to one visit of the drawer.
  useEffect(() => {
    if (!isOpen) setSent(null);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-voile bg-ink/50" onClick={close} />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="selection-titre"
        className="absolute inset-y-0 right-0 flex w-full max-w-[28rem] animate-tiroir flex-col bg-paper"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-trait px-5">
          <h2 id="selection-titre" className="titre text-xl">
            {t('selection.title')}
          </h2>
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            aria-label={t('selection.close')}
            className="-mr-2 grid size-11 cursor-pointer place-items-center rounded-full hover:bg-sol"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          {sent ? (
            <div className="py-10" role="status">
              <span className="grid size-12 place-items-center rounded-full bg-enseigne">
                <CheckIcon className="size-6" />
              </span>
              <h3 className="titre mt-5 text-2xl">{t('selection.sentTitle')}</h3>
              <p className="mt-3 leading-relaxed text-ardoise">
                {t('selection.sentText', sent.reference, sent.store)}
              </p>
              <button type="button" onClick={close} className="bouton bouton-plein mt-8">
                {t('selection.done')}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10">
              <h3 className="text-lg font-bold">{t('selection.emptyTitle')}</h3>
              <p className="mt-2 leading-relaxed text-ardoise">{t('selection.emptyText')}</p>
              <Link to="/boutique" onClick={close} className="bouton bouton-plein mt-6">
                {t('selection.browse')}
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-trait">
                {items.map((item) => (
                  <Line key={item.key} item={item} />
                ))}
              </ul>
              <div className="border-t border-ink py-4">
                <p className="flex items-baseline justify-between">
                  <span className="font-medium">{t('selection.total')}</span>
                  <span className="prix text-xl">{formatPrice(total, lang)}</span>
                </p>
                <p className="mt-1 text-[0.875rem] text-ardoise">{t('product.notice')}</p>
              </div>
              <div className="border-t border-trait py-6">
                <RequestForm
                  onSent={(result) => {
                    setSent(result);
                    clear();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

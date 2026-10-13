import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getProducts, getStores } from '../lib/db.js';
import { deliver, DeliveryError } from '../lib/deliver.js';
import { rateLimit } from '../lib/rateLimit.js';

const router = Router();
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 6 });

const clean = (value, max) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
const cleanText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts local (6 XX XX XX XX) and international (+237…) formats.
const isPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  return /^[+\d\s().-]+$/.test(value) && digits.length >= 8 && digits.length <= 15;
};
const findStore = (id) => getStores().find((store) => store.id === id);

const money = new Intl.NumberFormat('fr-FR');
const fcfa = (amount) => `${money.format(amount).replace(/\s/g, ' ')} FCFA`;
const receivedAt = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'full', timeStyle: 'short' });

// Lines whose value is empty are left out of the e-mail.
const lines = (pairs) =>
  pairs
    .filter(([, value]) => value)
    .map(([label, value]) => `${label} : ${value}`)
    .join('\n');

function fail(res, err, next) {
  if (err instanceof DeliveryError) return res.status(503).json({ error: err.code });
  next(err);
}

router.post('/contact', limiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    // Honeypot: real visitors never see or fill this field.
    if (body.website) return res.status(201).json({ ok: true });

    const record = {
      name: clean(body.name, 80),
      email: clean(body.email, 120),
      phone: clean(body.phone, 30),
      subject: clean(body.subject, 120),
      message: cleanText(body.message, 2000),
      storeId: clean(body.storeId, 20),
    };

    const fields = {};
    if (record.name.length < 2) fields.name = 'required';
    if (!record.email && !record.phone) fields.email = 'contact_required';
    if (record.email && !EMAIL.test(record.email)) fields.email = 'invalid';
    if (record.phone && !isPhone(record.phone)) fields.phone = 'invalid';
    if (record.message.length < 10) fields.message = 'too_short';
    if (record.storeId && !findStore(record.storeId)) fields.storeId = 'invalid';
    if (Object.keys(fields).length) return res.status(422).json({ error: 'validation', fields });

    const saved = { id: randomUUID(), receivedAt: new Date().toISOString(), ...record };
    await deliver({
      kind: 'contact',
      file: 'messages.json',
      record: saved,
      email: {
        subject: `Message de ${record.name}${record.subject ? ` : ${record.subject}` : ''}`,
        replyTo: record.email,
        text: [
          lines([
            ['Nom', record.name],
            ['E-mail', record.email],
            ['Téléphone', record.phone],
            ['Magasin concerné', findStore(record.storeId)?.name],
            ['Objet', record.subject],
          ]),
          record.message,
          `Reçu le ${receivedAt(saved.receivedAt)} (heure du Cameroun)`,
        ].join('\n\n'),
      },
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    fail(res, err, next);
  }
});

router.post('/requests', limiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (body.website) return res.status(201).json({ ok: true });

    const record = {
      name: clean(body.name, 80),
      phone: clean(body.phone, 30),
      storeId: clean(body.storeId, 20),
      note: cleanText(body.note, 500),
    };
    const store = findStore(record.storeId);

    const fields = {};
    if (record.name.length < 2) fields.name = 'required';
    if (!isPhone(record.phone)) fields.phone = 'invalid';
    if (!store) fields.storeId = 'invalid';

    // Prices and names are read from the catalogue, never trusted from the browser.
    const items = [];
    const products = getProducts();
    if (Array.isArray(body.items)) {
      for (const raw of body.items.slice(0, 30)) {
        const product = products.find((p) => p.slug === raw?.slug);
        if (!product) continue;
        const size = clean(String(raw.size ?? ''), 12);
        items.push({
          slug: product.slug,
          brand: product.brand,
          name: product.name.fr,
          size: product.sizes.includes(size) ? size : '',
          quantity: Math.min(Math.max(Number.parseInt(raw.quantity, 10) || 1, 1), 10),
          price: product.price,
        });
      }
    }
    if (!items.length) fields.items = 'empty';
    if (Object.keys(fields).length) return res.status(422).json({ error: 'validation', fields });

    const reference = 'CS-' + randomUUID().slice(0, 6).toUpperCase();
    const saved = { reference, receivedAt: new Date().toISOString(), ...record, items };
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await deliver({
      kind: 'request',
      file: 'requests.json',
      record: saved,
      email: {
        subject: `Demande de disponibilité ${reference}, ${store.name}`,
        text: [
          lines([
            ['Référence', reference],
            ['Magasin', store.name],
            ['Client', record.name],
            ['Téléphone', record.phone],
            ['Précision', record.note],
          ]),
          'Articles :\n' +
            items
              .map(
                (item) =>
                  `- ${item.quantity} x ${item.brand}, ${item.name}` +
                  `${item.size && item.size !== 'TU' ? ` (taille ${item.size})` : ''}, ${fcfa(item.price)} l'unité`
              )
              .join('\n'),
          `Total estimé : ${fcfa(total)}`,
          `Reçu le ${receivedAt(saved.receivedAt)} (heure du Cameroun)`,
        ].join('\n\n'),
      },
    });
    res.status(201).json({ ok: true, reference });
  } catch (err) {
    fail(res, err, next);
  }
});

router.post('/newsletter', limiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (body.website) return res.status(201).json({ ok: true });

    const email = clean(body.email, 120).toLowerCase();
    const fields = {};
    if (!EMAIL.test(email)) fields.email = 'invalid';
    // Marketing e-mail needs an explicit yes; a missing or false value is a no.
    if (body.consent !== true) fields.consent = 'required';
    if (Object.keys(fields).length) return res.status(422).json({ error: 'validation', fields });

    const saved = { email, subscribedAt: new Date().toISOString() };
    await deliver({
      kind: 'newsletter',
      file: 'subscribers.json',
      record: saved,
      email: {
        subject: `Inscription à la newsletter : ${email}`,
        text: [
          lines([['E-mail', email]]),
          'Cette personne a coché la case acceptant de recevoir les communications de City Sport.',
          `Reçu le ${receivedAt(saved.subscribedAt)} (heure du Cameroun)`,
        ].join('\n\n'),
      },
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    fail(res, err, next);
  }
});

export default router;

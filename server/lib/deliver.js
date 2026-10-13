import { appendRecord } from './db.js';

const RESEND_URL = 'https://api.resend.com/emails';
const TIMEOUT_MS = 8000;

export class DeliveryError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function emailSettings() {
  const { RESEND_API_KEY, NOTIFY_EMAIL, NOTIFY_FROM } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return null;
  return {
    key: RESEND_API_KEY,
    to: NOTIFY_EMAIL.split(',').map((address) => address.trim()).filter(Boolean),
    // Resend's shared sender works without a verified domain, but only delivers
    // to the address the Resend account was opened with.
    from: NOTIFY_FROM || 'City Sport <onboarding@resend.dev>',
  };
}

async function sendEmail(settings, { subject, text, replyTo }) {
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: settings.from,
      to: settings.to,
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`e-mail provider answered ${res.status}`);
}

async function postWebhook(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`webhook answered ${res.status}`);
}

// Sends a form submission everywhere it is configured to go:
//  - a JSON file in server/data, when the server has a disk it can write to
//  - an e-mail through Resend, when RESEND_API_KEY and NOTIFY_EMAIL are set
//  - a webhook (Make, Zapier, Google Apps Script…), when FORMS_WEBHOOK_URL is set
// Vercel functions have no writable disk, so there e-mail or the webhook must be
// set up. With no destination at all the visitor is told the form is unavailable,
// which is better than a confirmation for a message nobody will read.
export async function deliver({ kind, file, record, email }) {
  const jobs = [];
  if (!process.env.VERCEL) jobs.push(appendRecord(file, record));

  const settings = emailSettings();
  if (settings) jobs.push(sendEmail(settings, email));

  const webhook = process.env.FORMS_WEBHOOK_URL;
  if (webhook) jobs.push(postWebhook(webhook, { kind, ...record }));

  if (!jobs.length) throw new DeliveryError('not_configured');

  const results = await Promise.allSettled(jobs);
  const failures = results.filter((result) => result.status === 'rejected');
  // Log the reason only: submissions hold names and phone numbers.
  for (const failure of failures) {
    console.error(`[forms] ${kind} delivery failed: ${failure.reason?.message}`);
  }
  if (failures.length === results.length) throw new DeliveryError('delivery_failed');
}

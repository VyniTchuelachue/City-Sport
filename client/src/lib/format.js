const formatters = {
  fr: new Intl.NumberFormat('fr-FR'),
  en: new Intl.NumberFormat('en-GB'),
};

export function formatPrice(amount, lang = 'fr') {
  return `${formatters[lang].format(amount)} FCFA`;
}

export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

// Product photos come from a CDN that resizes on request; local files pass through.
export function sized(url, width, height) {
  if (!url || !url.includes('images.unsplash.com')) return url;
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', q: '72', w: String(width) });
  if (height) params.set('h', String(height));
  return `${url}?${params}`;
}

export function telHref(phone) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}

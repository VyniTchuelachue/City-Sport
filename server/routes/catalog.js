import { Router } from 'express';
import { getProducts, getBrands } from '../lib/db.js';

const router = Router();

const CATEGORIES = ['chaussures', 'vetements', 'accessoires', 'equipement'];
const GENDERS = ['homme', 'femme', 'enfant'];

const fold = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const one = (v) => (Array.isArray(v) ? v[0] : v);

router.get('/products', (req, res) => {
  const category = one(req.query.category);
  const gender = one(req.query.gender);
  const brand = one(req.query.brand);
  const q = one(req.query.q);
  const sort = one(req.query.sort);
  const limit = Number.parseInt(one(req.query.limit), 10);

  let items = getProducts();
  if (category) items = items.filter((p) => p.category === category);
  // Unisex items show up under both Homme and Femme.
  if (gender) {
    items = items.filter(
      (p) => p.gender === gender || (p.gender === 'mixte' && gender !== 'enfant')
    );
  }
  if (brand) items = items.filter((p) => fold(p.brand) === fold(brand));
  if (req.query.sale) items = items.filter((p) => p.compareAt);
  if (req.query.new) items = items.filter((p) => p.isNew);
  if (q && q.trim()) {
    const terms = fold(q).split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const haystack = fold(
        [p.brand, p.name.fr, p.name.en, p.type.fr, p.type.en, p.category, p.gender].join(' ')
      );
      return terms.every((t) => haystack.includes(t));
    });
  }

  items = [...items];
  if (sort === 'price-asc') items.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
  else items.sort((a, b) => Number(b.isNew) - Number(a.isNew));

  const total = items.length;
  if (limit > 0) items = items.slice(0, limit);
  res.json({ items, total });
});

router.get('/products/:slug', (req, res) => {
  const products = getProducts();
  const product = products.find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: 'not_found' });
  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .sort((a, b) => Number(b.brand === product.brand) - Number(a.brand === product.brand))
    .slice(0, 4);
  res.json({ product, related });
});

router.get('/meta', (req, res) => {
  const stocked = new Set(getProducts().map((p) => p.brand));
  res.json({
    categories: CATEGORIES,
    genders: GENDERS,
    brands: getBrands().map((b) => ({ ...b, hasProducts: stocked.has(b.name) })),
  });
});

export default router;

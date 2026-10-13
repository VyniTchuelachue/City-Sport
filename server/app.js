import express from 'express';
import helmet from 'helmet';
import path from 'node:path';

import catalogRoutes from './routes/catalog.js';
import storeRoutes from './routes/stores.js';
import formRoutes from './routes/forms.js';

// Builds the Express app. Two things use it:
//  - server/index.js, which also serves the built React app from `staticDir`
//  - api/index.js, the Vercel function, where the CDN serves the React app
//    and only /api requests reach Express
export function createApp({ staticDir } = {}) {
  const app = express();
  app.disable('x-powered-by');
  // Behind a reverse proxy (Vercel, Nginx, Render…) this makes req.ip the visitor's address.
  app.set('trust proxy', 1);

  // vercel.json repeats this policy for the pages the CDN serves; keep the two in step.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", 'data:'],
          frameSrc: ['https://www.google.com', 'https://maps.google.com'],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(express.json({ limit: '20kb' }));

  app.use('/api', catalogRoutes);
  app.use('/api', storeRoutes);
  app.use('/api', formRoutes);
  app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

  if (staticDir) {
    app.use(express.static(staticDir, { maxAge: '1h' }));
    // Page URLs (/boutique, /produit/…) are routed in the browser, so they all get
    // the app shell. A missing file with an extension is a real 404.
    app.use((req, res, next) => {
      if (req.method !== 'GET' || path.extname(req.path)) return next();
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use((req, res) => res.status(404).type('text').send('Not found'));

  app.use((err, req, res, _next) => {
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'too_large' });
    if (err instanceof SyntaxError) return res.status(400).json({ error: 'invalid_json' });
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  });

  return app;
}

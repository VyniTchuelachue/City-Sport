import express from 'express';
import helmet from 'helmet';
import path from 'node:path';

import catalogRoutes from './routes/catalog.js';
import storeRoutes from './routes/stores.js';
import formRoutes from './routes/forms.js';

// Builds the Express app. Two things use it:
//  - server/index.js, the Node server, which also serves the built React app
//    from `staticDir`
//  - Vercel, which runs the default export at the bottom of this file as the
//    "server" service and sends it only /api requests (see vercel.json)
export function createApp({ staticDir } = {}) {
  const app = express();
  app.disable('x-powered-by');
  // Behind a reverse proxy (Vercel, Nginx, Render…) this makes req.ip the visitor's address.
  app.set('trust proxy', 1);

  // client/vite.config.js writes the same policy into the built pages; keep the two in step.
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
          // Left out so the site also works over plain http on a local network
          // (testing from a phone, for instance). Vercel serves https regardless.
          upgradeInsecureRequests: null,
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

// Vercel's entry point: an app with the API only. Vercel passes the path through
// unchanged, so /api/products arrives here as /api/products.
export default createApp();

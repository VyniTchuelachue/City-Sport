// Vercel runs this file as a serverless function. vercel.json sends every
// /api/* request here; the pages themselves are served from client/dist.
import { createApp } from '../server/app.js';

export default createApp();

// Entry point for running on your own machine or server (npm run dev / npm start).
// On Vercel, the default export of app.js runs instead (see vercel.json).
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Optional settings (form notifications, see .env.example) are read from a .env file.
const envFile = path.join(root, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

// The dev script pins the port with --port so the Vite proxy always finds the API,
// whatever PORT the surrounding tooling exports. Hosts set PORT in production.
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const PORT = portArg ? Number(portArg.split('=')[1]) : process.env.PORT || 4000;

// Once the React app has been built, the same server delivers it.
const clientDist = path.join(root, 'client', 'dist');
const app = createApp({ staticDir: existsSync(clientDist) ? clientDist : null });

app.listen(PORT, () => {
  console.log(`City Sport API on http://localhost:${PORT}`);
});

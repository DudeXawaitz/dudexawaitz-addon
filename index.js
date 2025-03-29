import { createServer } from 'http';
import { startAddon } from './addon.js';
import { startWebServer } from './server.js';

// Start everything
const PORT = process.env.PORT || 5000;
const server = createServer();

// Start the addon
startAddon(server);

// Start the web server
startWebServer(server);

// Listen on the port
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Addon active on port ${PORT}`);
  console.log(`https://dudexawaitz.org/manifest.json`);
  console.log(`HTTP addon accessible at: http://127.0.0.1:${PORT}/manifest.json`);
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

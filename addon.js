import { addonBuilder } from 'stremio-addon-sdk';
import { getCatalog } from './lib/catalog.js';
import { getMetadata } from './lib/metadata.js';
import { getStreams } from './lib/stream.js';
import { getUserState, updateWatchProgress, getContinueWatching } from './lib/userState.js';

// Create a new addon builder
const builder = new addonBuilder({
  id: 'org.dudexawaitz',
  version: '1.0.0',
  name: 'DudeXawaitz',
  description: 'Premium Malayalam and English Movies & TV Series',
  resources: ['catalog', 'stream', 'meta'],
  types: ['movie', 'series'],
  idPrefixes: ['tt', 'ml'],
  logo: 'https://dudexawaitz.org/logo.svg',
  background: 'https://dudexawaitz.org/background.svg',
  catalogs: [
    { type: 'movie', id: 'dudexawaitz-malayalam-movies' },
    { type: 'series', id: 'dudexawaitz-malayalam-series' },
    { type: 'movie', id: 'dudexawaitz-english-movies' },
    { type: 'series', id: 'dudexawaitz-english-series' }
  ]
});

// Define the catalog handler
builder.defineCatalogHandler(async (args) => {
  console.log('Catalog request:', args);
  return await getCatalog(args);
});

// Define the stream handler
builder.defineStreamHandler(async (args) => {
  console.log('Stream request:', args);
  return await getStreams(args);
});

// Define the meta handler
builder.defineMetaHandler(async (args) => {
  console.log('Meta request:', args);
  return await getMetadata(args);
});

// Export the addon
export async function startAddon(server) {
  const addonInterface = builder.getInterface();
  addonInterface.bindToHTTPServer(server);
  return addonInterface;
}

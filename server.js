import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getUserState, updateWatchProgress, getContinueWatching, getRecommendations } from './lib/userState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function startWebServer(server) {
  const app = express();
  
  // Set up middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.static(join(__dirname, 'static')));
  app.set('view engine', 'ejs');
  app.set('views', join(__dirname, 'views'));
  
  // Main route - landing page
  app.get('/', (req, res) => {
    res.render('index', {
      addonName: 'DudeXawaitz',
      addonDescription: 'Premium Malayalam and English Movies & TV Series',
      manifestUrl: 'https://dudexawaitz.org/manifest.json'
    });
  });

  // API route for updating watch progress
  app.post('/api/watch-progress', async (req, res) => {
    try {
      const { userId, itemId, itemType, season, episode, position, duration } = req.body;
      const result = await updateWatchProgress(userId, itemId, itemType, season, episode, position, duration);
      res.json(result);
    } catch (error) {
      console.error('Error updating watch progress:', error);
      res.status(500).json({ error: 'Failed to update watch progress' });
    }
  });

  // API route for getting continue watching
  app.get('/api/continue-watching', (req, res) => {
    try {
      const { userId, limit } = req.query;
      const continueWatching = getContinueWatching(userId, parseInt(limit) || 20);
      res.json(continueWatching);
    } catch (error) {
      console.error('Error getting continue watching:', error);
      res.status(500).json({ error: 'Failed to get continue watching items' });
    }
  });

  // API route for getting recommendations
  app.get('/api/recommendations', async (req, res) => {
    try {
      const { userId } = req.query;
      const recommendations = await getRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  });

  // Attach to the existing server
  server.on('request', app);
  
  return app;
}

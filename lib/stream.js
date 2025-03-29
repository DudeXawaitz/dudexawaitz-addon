import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

/**
 * Gets streams for a specific content
 */
async function getStreams(args) {
  const { id, type } = args;
  
  console.log(`Getting streams for id: ${id}, type: ${type}`);
  
  // Get the season and episode for series
  let season = null;
  let episode = null;
  
  if (type === 'series' && args.extra && args.extra.video) {
    const videoId = args.extra.video || '';
    const match = videoId.match(/^se(\d+)ep(\d+)$/);
    
    if (match) {
      season = parseInt(match[1]);
      episode = parseInt(match[2]);
      console.log(`Series request for season ${season}, episode ${episode}`);
    }
  }
  
  // Check if it's a Malayalam content (ml prefix)
  if (id.startsWith('ml')) {
    return await getMalayalamStreams(id, type, season, episode);
  } else {
    return await getEnglishStreams(id, type, season, episode);
  }
}

/**
 * Gets streams for Malayalam content
 */
async function getMalayalamStreams(id, type, season, episode) {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return { streams: [] };
  }

  try {
    // Remove the 'ml' prefix from the ID
    const tmdbId = id.substring(2);
    
    // Prepare sample streams with different quality options
    const qualities = [
      { quality: '4K', resolution: '2160p', size: '4-8 GB', bandwidth: 16000 },
      { quality: 'FHD', resolution: '1080p', size: '2-4 GB', bandwidth: 8000 },
      { quality: 'HD', resolution: '720p', size: '1-2 GB', bandwidth: 4000 },
      { quality: 'SD', resolution: '480p', size: '600-800 MB', bandwidth: 2000 }
    ];
    
    // Generate streams for movies
    if (type === 'movie') {
      // Try to get the movie details for the title
      const response = await fetch(`${TMDB_API_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      
      if (data.success === false) {
        console.error('Movie not found:', tmdbId);
        return { streams: [] };
      }
      
      const title = data.title;
      const year = data.release_date ? data.release_date.substring(0, 4) : '';
      
      // Create streams for different qualities
      const streams = qualities.map(quality => ({
        name: `DudeXawaitz ${quality.quality}`,
        title: `${title} (${year}) - ${quality.resolution}`,
        url: `https://dudexawaitz.org/stream/ml/${tmdbId}/movie/${quality.resolution}`,
        description: `Premium ${quality.resolution} Quality - Size: ${quality.size}`,
        subtitles: [
          { url: 'https://dudexawaitz.org/static/subtitles/en.vtt', lang: 'en', id: 'en', label: 'English' },
          { url: 'https://dudexawaitz.org/static/subtitles/ml.vtt', lang: 'ml', id: 'ml', label: 'Malayalam' },
          { url: 'https://dudexawaitz.org/static/subtitles/es.vtt', lang: 'es', id: 'es', label: 'Spanish' },
          { url: 'https://dudexawaitz.org/static/subtitles/fr.vtt', lang: 'fr', id: 'fr', label: 'French' },
          { url: 'https://dudexawaitz.org/static/subtitles/de.vtt', lang: 'de', id: 'de', label: 'German' }
        ],
        behaviorHints: {
          bingeGroup: `dudexawaitz-ml-${tmdbId}`,
          notWebReady: false,
          quality: quality.resolution,
          defaultSubtitleId: 'ml'
        }
      }));
      
      return { streams };
    } 
    // Generate streams for series episodes
    else if (type === 'series' && season !== null && episode !== null) {
      // Try to get the series and episode details
      const seriesResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
      const seriesData = await seriesResponse.json();
      
      if (seriesData.success === false) {
        console.error('Series not found:', tmdbId);
        return { streams: [] };
      }
      
      const seriesTitle = seriesData.name;
      
      // Get episode details
      const episodeResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`);
      const episodeData = await episodeResponse.json();
      
      if (episodeData.success === false) {
        console.error(`Episode S${season}E${episode} not found for series ${tmdbId}`);
        return { streams: [] };
      }
      
      const episodeTitle = episodeData.name;
      
      // Create streams for different qualities
      const streams = qualities.map(quality => ({
        name: `DudeXawaitz ${quality.quality}`,
        title: `${seriesTitle} S${season}E${episode} - ${episodeTitle} - ${quality.resolution}`,
        url: `https://dudexawaitz.org/stream/ml/${tmdbId}/series/${season}/${episode}/${quality.resolution}`,
        description: `Premium ${quality.resolution} Quality - Size: ${quality.size}`,
        subtitles: [
          { url: 'https://dudexawaitz.org/static/subtitles/en.vtt', lang: 'en', id: 'en', label: 'English' },
          { url: 'https://dudexawaitz.org/static/subtitles/ml.vtt', lang: 'ml', id: 'ml', label: 'Malayalam' },
          { url: 'https://dudexawaitz.org/static/subtitles/es.vtt', lang: 'es', id: 'es', label: 'Spanish' },
          { url: 'https://dudexawaitz.org/static/subtitles/fr.vtt', lang: 'fr', id: 'fr', label: 'French' },
          { url: 'https://dudexawaitz.org/static/subtitles/de.vtt', lang: 'de', id: 'de', label: 'German' }
        ],
        behaviorHints: {
          bingeGroup: `dudexawaitz-ml-${tmdbId}-s${season}`,
          notWebReady: false,
          quality: quality.resolution,
          defaultSubtitleId: 'ml'
        }
      }));
      
      return { streams };
    }
    
    return { streams: [] };
  } catch (error) {
    console.error('Error fetching Malayalam streams:', error);
    return { streams: [] };
  }
}

/**
 * Gets streams for English content
 */
async function getEnglishStreams(id, type, season, episode) {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return { streams: [] };
  }

  try {
    // Prepare sample streams with different quality options
    const qualities = [
      { quality: '4K', resolution: '2160p', size: '4-8 GB', bandwidth: 16000 },
      { quality: 'FHD', resolution: '1080p', size: '2-4 GB', bandwidth: 8000 },
      { quality: 'HD', resolution: '720p', size: '1-2 GB', bandwidth: 4000 },
      { quality: 'SD', resolution: '480p', size: '600-800 MB', bandwidth: 2000 }
    ];
    
    // Find the TMDB ID for the content
    let tmdbId;
    const mediaType = type === 'movie' ? 'movie' : 'tv';
    
    if (id.startsWith('tt')) {
      // Search for the TMDB ID using IMDb ID
      const searchResponse = await fetch(`${TMDB_API_BASE}/find/${id}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
      const searchData = await searchResponse.json();
      
      const results = searchData[`${mediaType}_results`];
      if (results && results.length > 0) {
        tmdbId = results[0].id;
      } else {
        console.error('No TMDB match found for IMDb ID:', id);
        return { streams: [] };
      }
    } else {
      tmdbId = id;
    }
    
    // Generate streams for movies
    if (type === 'movie') {
      // Try to get the movie details
      const response = await fetch(`${TMDB_API_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      
      if (data.success === false) {
        console.error('Movie not found:', tmdbId);
        return { streams: [] };
      }
      
      const title = data.title;
      const year = data.release_date ? data.release_date.substring(0, 4) : '';
      
      // Create streams for different qualities
      const streams = qualities.map(quality => ({
        name: `DudeXawaitz ${quality.quality}`,
        title: `${title} (${year}) - ${quality.resolution}`,
        url: `https://dudexawaitz.org/stream/en/${tmdbId}/movie/${quality.resolution}`,
        description: `Premium ${quality.resolution} Quality - Size: ${quality.size}`,
        subtitles: [
          { url: 'https://dudexawaitz.org/static/subtitles/en.vtt', lang: 'en', id: 'en', label: 'English' },
          { url: 'https://dudexawaitz.org/static/subtitles/es.vtt', lang: 'es', id: 'es', label: 'Spanish' },
          { url: 'https://dudexawaitz.org/static/subtitles/fr.vtt', lang: 'fr', id: 'fr', label: 'French' },
          { url: 'https://dudexawaitz.org/static/subtitles/de.vtt', lang: 'de', id: 'de', label: 'German' },
          { url: 'https://dudexawaitz.org/static/subtitles/ml.vtt', lang: 'ml', id: 'ml', label: 'Malayalam' }
        ],
        behaviorHints: {
          bingeGroup: `dudexawaitz-en-${tmdbId}`,
          notWebReady: false,
          quality: quality.resolution,
          defaultSubtitleId: 'en'
        }
      }));
      
      return { streams };
    } 
    // Generate streams for series episodes
    else if (type === 'series' && season !== null && episode !== null) {
      // Try to get the series and episode details
      const seriesResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
      const seriesData = await seriesResponse.json();
      
      if (seriesData.success === false) {
        console.error('Series not found:', tmdbId);
        return { streams: [] };
      }
      
      const seriesTitle = seriesData.name;
      
      // Get episode details
      const episodeResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`);
      const episodeData = await episodeResponse.json();
      
      if (episodeData.success === false) {
        console.error(`Episode S${season}E${episode} not found for series ${tmdbId}`);
        return { streams: [] };
      }
      
      const episodeTitle = episodeData.name;
      
      // Create streams for different qualities
      const streams = qualities.map(quality => ({
        name: `DudeXawaitz ${quality.quality}`,
        title: `${seriesTitle} S${season}E${episode} - ${episodeTitle} - ${quality.resolution}`,
        url: `https://dudexawaitz.org/stream/en/${tmdbId}/series/${season}/${episode}/${quality.resolution}`,
        description: `Premium ${quality.resolution} Quality - Size: ${quality.size}`,
        subtitles: [
          { url: 'https://dudexawaitz.org/static/subtitles/en.vtt', lang: 'en', id: 'en', label: 'English' },
          { url: 'https://dudexawaitz.org/static/subtitles/es.vtt', lang: 'es', id: 'es', label: 'Spanish' },
          { url: 'https://dudexawaitz.org/static/subtitles/fr.vtt', lang: 'fr', id: 'fr', label: 'French' },
          { url: 'https://dudexawaitz.org/static/subtitles/de.vtt', lang: 'de', id: 'de', label: 'German' },
          { url: 'https://dudexawaitz.org/static/subtitles/ml.vtt', lang: 'ml', id: 'ml', label: 'Malayalam' }
        ],
        behaviorHints: {
          bingeGroup: `dudexawaitz-en-${tmdbId}-s${season}`,
          notWebReady: false,
          quality: quality.resolution,
          defaultSubtitleId: 'en'
        }
      }));
      
      return { streams };
    }
    
    return { streams: [] };
  } catch (error) {
    console.error('Error fetching English streams:', error);
    return { streams: [] };
  }
}

export { getStreams };

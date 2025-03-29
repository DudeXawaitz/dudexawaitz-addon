/**
 * Stream module for the Stremio addon
 */

// Import required modules
import fetch from 'node-fetch';

// TMDB API key from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

/**
 * Gets streams for a specific content
 * @param {Object} args - The request arguments
 * @returns {Promise<Array>} - Array of stream objects
 */
async function getStreams(args) {
  console.log('Stream request:', args);
  const { type, id } = args;
  
  try {
    // Extract season and episode for series
    let season = null;
    let episode = null;
    
    if (args.extra && args.extra.season && args.extra.episode) {
      season = parseInt(args.extra.season);
      episode = parseInt(args.extra.episode);
    }
    
    // Handle Malayalam content (with ml- prefix)
    if (id.startsWith('ml-')) {
      return await getMalayalamStreams(id.replace('ml-', ''), type, season, episode);
    }
    
    // Handle IMDB IDs for English content
    return await getEnglishStreams(id, type, season, episode);
  } catch (error) {
    console.error('Error getting streams:', error);
    throw error;
  }
}

/**
 * Gets streams for Malayalam content
 * @param {string} id - The content ID
 * @param {string} type - The content type
 * @param {number|null} season - The season number (for series)
 * @param {number|null} episode - The episode number (for series)
 * @returns {Promise<Array>} - Array of stream objects
 */
async function getMalayalamStreams(id, type, season, episode) {
  try {
    // Get content details from TMDB to construct better stream titles
    const tmdbType = type === 'series' ? 'tv' : 'movie';
    let url = `${TMDB_API_URL}/${tmdbType}/${id}?api_key=${TMDB_API_KEY}&language=en-US`;
    
    if (type === 'series' && season !== null && episode !== null) {
      url = `${TMDB_API_URL}/${tmdbType}/${id}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}&language=en-US`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    const title = data.title || data.name || 'Unknown';
    const year = (data.release_date || data.first_air_date || '').substring(0, 4);
    const episodeTitle = data.episode_name || '';
    
    // Construct stream title
    let streamTitle = `${title} (${year})`;
    if (type === 'series' && season !== null && episode !== null) {
      streamTitle = `${title} - S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}${episodeTitle ? ' - ' + episodeTitle : ''}`;
    }
    
    // Create streams with different quality options
    const streams = [
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 4K Ultra HD`,
        url: `https://dudexawaitz.org/stream/${type}/${id}${type === 'series' ? `/${season}/${episode}` : ''}/4k.mp4`,
        description: 'Premium 4K Ultra HD stream with Dolby Vision and Dolby Atmos audio.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["2160p"],
          languages: ["Malayalam"],
          subtitles: ["English", "Malayalam", "Hindi"]
        }
      },
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 1080p Full HD`,
        url: `https://dudexawaitz.org/stream/${type}/${id}${type === 'series' ? `/${season}/${episode}` : ''}/1080p.mp4`,
        description: 'Premium 1080p Full HD stream with 5.1 surround sound.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["1080p"],
          languages: ["Malayalam"],
          subtitles: ["English", "Malayalam"]
        }
      },
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 720p HD`,
        url: `https://dudexawaitz.org/stream/${type}/${id}${type === 'series' ? `/${season}/${episode}` : ''}/720p.mp4`,
        description: 'Premium 720p HD stream for faster loading on slower connections.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["720p"],
          languages: ["Malayalam"],
          subtitles: ["English", "Malayalam"]
        }
      },
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 480p`,
        url: `https://dudexawaitz.org/stream/${type}/${id}${type === 'series' ? `/${season}/${episode}` : ''}/480p.mp4`,
        description: 'Premium 480p stream for minimal data usage.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["480p"],
          languages: ["Malayalam"],
          subtitles: ["English", "Malayalam"]
        }
      }
    ];
    
    // Add subtitles
    streams.forEach(stream => {
      stream.subtitles = [
        {
          url: '/static/subtitles/ml.vtt',
          lang: 'Malayalam',
          id: 'ml'
        },
        {
          url: '/static/subtitles/en.vtt',
          lang: 'English',
          id: 'en'
        },
        {
          url: '/static/subtitles/es.vtt',
          lang: 'Spanish',
          id: 'es'
        },
        {
          url: '/static/subtitles/fr.vtt',
          lang: 'French',
          id: 'fr'
        },
        {
          url: '/static/subtitles/de.vtt',
          lang: 'German',
          id: 'de'
        }
      ];
    });
    
    return streams;
  } catch (error) {
    console.error(`Error getting Malayalam ${type} streams for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Gets streams for English content
 * @param {string} id - The content ID (IMDB ID)
 * @param {string} type - The content type
 * @param {number|null} season - The season number (for series)
 * @param {number|null} episode - The episode number (for series)
 * @returns {Promise<Array>} - Array of stream objects
 */
async function getEnglishStreams(id, type, season, episode) {
  try {
    // First, search TMDB for the IMDB ID to get the TMDB ID
    let tmdbId;
    const tmdbType = type === 'series' ? 'tv' : 'movie';
    
    try {
      // Find the TMDB ID using the IMDB ID
      const findUrl = `${TMDB_API_URL}/find/${id}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
      const findResponse = await fetch(findUrl);
      const findData = await findResponse.json();
      
      // Get the first result
      const results = findData[`${tmdbType}_results`];
      if (!results || results.length === 0) {
        throw new Error(`No TMDB data found for IMDB ID: ${id}`);
      }
      
      tmdbId = results[0].id;
    } catch (error) {
      console.error(`Error finding TMDB ID for IMDB ID ${id}:`, error);
      // If we can't find the TMDB ID, try to use the IMDB ID without the 'tt' prefix
      tmdbId = id.replace('tt', '');
    }
    
    // Get content details from TMDB to construct better stream titles
    let url = `${TMDB_API_URL}/${tmdbType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;
    
    if (type === 'series' && season !== null && episode !== null) {
      url = `${TMDB_API_URL}/${tmdbType}/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}&language=en-US`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    const title = data.title || data.name || 'Unknown';
    const year = (data.release_date || data.first_air_date || '').substring(0, 4);
    const episodeTitle = data.episode_name || '';
    
    // Construct stream title
    let streamTitle = `${title} (${year})`;
    if (type === 'series' && season !== null && episode !== null) {
      streamTitle = `${title} - S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}${episodeTitle ? ' - ' + episodeTitle : ''}`;
    }
    
    // Create streams with different quality options
    const streams = [
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 4K Ultra HD`,
        url: `https://dudexawaitz.org/stream/${type}/${id.replace('tt', '')}${type === 'series' ? `/${season}/${episode}` : ''}/4k.mp4`,
        description: 'Premium 4K Ultra HD stream with Dolby Vision and Dolby Atmos audio.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["2160p"],
          languages: ["English"],
          subtitles: ["English", "Spanish", "French", "German"]
        }
      },
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 1080p Full HD`,
        url: `https://dudexawaitz.org/stream/${type}/${id.replace('tt', '')}${type === 'series' ? `/${season}/${episode}` : ''}/1080p.mp4`,
        description: 'Premium 1080p Full HD stream with 5.1 surround sound.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["1080p"],
          languages: ["English"],
          subtitles: ["English", "Spanish", "French", "German"]
        }
      },
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 720p HD`,
        url: `https://dudexawaitz.org/stream/${type}/${id.replace('tt', '')}${type === 'series' ? `/${season}/${episode}` : ''}/720p.mp4`,
        description: 'Premium 720p HD stream for faster loading on slower connections.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["720p"],
          languages: ["English"],
          subtitles: ["English", "Spanish", "French"]
        }
      },
      {
        name: 'DudeXawaitz',
        title: `${streamTitle} | 480p`,
        url: `https://dudexawaitz.org/stream/${type}/${id.replace('tt', '')}${type === 'series' ? `/${season}/${episode}` : ''}/480p.mp4`,
        description: 'Premium 480p stream for minimal data usage.',
        behaviorHints: {
          bingeGroup: `dudexawaitz-${type}-${id}`,
          notWebReady: false,
          qualities: ["480p"],
          languages: ["English"],
          subtitles: ["English"]
        }
      }
    ];
    
    // Add subtitles
    streams.forEach(stream => {
      stream.subtitles = [
        {
          url: '/static/subtitles/en.vtt',
          lang: 'English',
          id: 'en'
        },
        {
          url: '/static/subtitles/es.vtt',
          lang: 'Spanish',
          id: 'es'
        },
        {
          url: '/static/subtitles/fr.vtt',
          lang: 'French',
          id: 'fr'
        },
        {
          url: '/static/subtitles/de.vtt',
          lang: 'German',
          id: 'de'
        }
      ];
    });
    
    return streams;
  } catch (error) {
    console.error(`Error getting English ${type} streams for ID ${id}:`, error);
    throw error;
  }
}

export { getStreams };

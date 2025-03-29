/**
 * Metadata module for the Stremio addon
 */

// Import required modules
import fetch from 'node-fetch';

// TMDB API key from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

/**
 * Gets metadata for a specific content
 * @param {Object} args - The request arguments
 * @returns {Promise<Object>} - The metadata object
 */
async function getMetadata(args) {
  console.log('Metadata request:', args);
  const { type, id } = args;

  try {
    // Handle Malayalam content (with ml- prefix)
    if (id.startsWith('ml-')) {
      return await getMalayalamMetadata(id.replace('ml-', ''), type);
    }
    
    // Handle IMDB IDs for English content
    return await getTMDBMetadata(id, type);
  } catch (error) {
    console.error('Error getting metadata:', error);
    throw error;
  }
}

/**
 * Gets metadata for Malayalam content using TMDB
 * @param {string} id - The content ID (ml-prefixed TMDB ID or IMDB ID)
 * @param {string} type - The content type (movie or series)
 * @returns {Promise<Object>} - The metadata object
 */
async function getMalayalamMetadata(id, type) {
  const tmdbType = type === 'series' ? 'tv' : 'movie';
  const url = `${TMDB_API_URL}/${tmdbType}/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,images`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.status_message);
    }
    
    // Create Stremio metadata format
    return {
      id: `ml-${id}`,
      type,
      name: data.title || data.name,
      description: data.overview,
      releaseInfo: type === 'movie' 
        ? data.release_date?.substring(0, 4) 
        : `${data.first_air_date?.substring(0, 4)}–${data.last_air_date?.substring(0, 4)}`,
      runtime: type === 'movie' 
        ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` 
        : `${Math.floor((data.episode_run_time?.[0] || 0) / 60)}h ${(data.episode_run_time?.[0] || 0) % 60}m`,
      genres: data.genres?.map(g => g.name),
      posterShape: 'poster',
      background: data.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` 
        : null,
      logo: data.images?.logos?.[0] 
        ? `https://image.tmdb.org/t/p/original${data.images.logos[0].file_path}` 
        : null,
      poster: data.poster_path 
        ? `https://image.tmdb.org/t/p/original${data.poster_path}` 
        : null,
      imdbRating: data.vote_average?.toFixed(1),
      language: 'Malayalam',
      country: 'India',
      videos: data.videos?.results?.filter(v => v.site === 'YouTube').map(v => ({
        id: v.id,
        title: v.name,
        released: v.published_at?.substring(0, 10),
        thumbnail: `https://img.youtube.com/vi/${v.key}/maxresdefault.jpg`,
        streams: [{ ytId: v.key }]
      })) || [],
      directors: data.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name) || [],
      cast: data.credits?.cast?.slice(0, 10).map(a => a.name) || [],
      awards: 'Highly Rated Malayalam Content',
      website: data.homepage || null,
      behaviorHints: {
        defaultVideoId: 'default',
        hasScheduledVideos: false
      }
    };
  } catch (error) {
    console.error(`Error getting Malayalam ${type} metadata for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Gets metadata from TMDB for English content
 * @param {string} id - The content ID (IMDB ID)
 * @param {string} type - The content type (movie or series)
 * @returns {Promise<Object>} - The metadata object
 */
async function getTMDBMetadata(id, type) {
  // First, search TMDB for the IMDB ID
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
    
    // Get detailed metadata from TMDB
    const detailUrl = `${TMDB_API_URL}/${tmdbType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,images`;
    const detailResponse = await fetch(detailUrl);
    const data = await detailResponse.json();
    
    if (data.success === false) {
      throw new Error(data.status_message);
    }
    
    // Create Stremio metadata format
    return {
      id,
      type,
      name: data.title || data.name,
      description: data.overview,
      releaseInfo: type === 'movie' 
        ? data.release_date?.substring(0, 4) 
        : `${data.first_air_date?.substring(0, 4)}–${data.last_air_date?.substring(0, 4)}`,
      runtime: type === 'movie' 
        ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` 
        : `${Math.floor((data.episode_run_time?.[0] || 0) / 60)}h ${(data.episode_run_time?.[0] || 0) % 60}m`,
      genres: data.genres?.map(g => g.name),
      posterShape: 'poster',
      background: data.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` 
        : null,
      logo: data.images?.logos?.[0] 
        ? `https://image.tmdb.org/t/p/original${data.images.logos[0].file_path}` 
        : null,
      poster: data.poster_path 
        ? `https://image.tmdb.org/t/p/original${data.poster_path}` 
        : null,
      imdbRating: data.vote_average?.toFixed(1),
      language: 'English',
      videos: data.videos?.results?.filter(v => v.site === 'YouTube').map(v => ({
        id: v.id,
        title: v.name,
        released: v.published_at?.substring(0, 10),
        thumbnail: `https://img.youtube.com/vi/${v.key}/maxresdefault.jpg`,
        streams: [{ ytId: v.key }]
      })) || [],
      directors: data.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name) || [],
      cast: data.credits?.cast?.slice(0, 10).map(a => a.name) || [],
      awards: data.vote_count > 1000 ? 'Highly Rated Content' : null,
      website: data.homepage || null,
      behaviorHints: {
        defaultVideoId: 'default',
        hasScheduledVideos: false
      }
    };
  } catch (error) {
    console.error(`Error getting English ${type} metadata for ID ${id}:`, error);
    throw error;
  }
}

export { getMetadata };

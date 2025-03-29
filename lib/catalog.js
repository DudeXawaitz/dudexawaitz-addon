/**
 * Catalog module for the Stremio addon
 */

// Import required modules
import fetch from 'node-fetch';

// TMDB API key from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

/**
 * Gets a specific catalog
 * @param {Object} args - The request arguments
 * @returns {Promise<Object>} - The catalog object
 */
async function getCatalog(args) {
  console.log('Catalog request:', args);
  const { type, id, extra } = args;
  
  try {
    // Get skip value for pagination or default to 0
    const skip = (extra && extra.skip) ? parseInt(extra.skip) : 0;
    
    // Get genre filter if present
    const genre = (extra && extra.genre) ? extra.genre : null;
    
    // Handle different catalog types
    if (id === 'dudexawaitz-malayalam-movies' && type === 'movie') {
      return await getMalayalamCatalog('movie', genre, skip);
    } else if (id === 'dudexawaitz-malayalam-series' && type === 'series') {
      return await getMalayalamCatalog('series', genre, skip);
    } else if (id === 'dudexawaitz-english-movies' && type === 'movie') {
      return await getEnglishMoviesCatalog(genre, skip);
    } else if (id === 'dudexawaitz-english-series' && type === 'series') {
      return await getEnglishSeriesCatalog(genre, skip);
    } else {
      throw new Error(`Unsupported catalog: ${type}/${id}`);
    }
  } catch (error) {
    console.error('Error getting catalog:', error);
    throw error;
  }
}

/**
 * Gets Malayalam content catalog from TMDB
 * @param {string} type - The content type (movie or series)
 * @param {string|null} genre - Optional genre filter
 * @param {number} skip - Number of items to skip
 * @returns {Promise<Array>} - Array of catalog items
 */
async function getMalayalamCatalog(type, genre, skip) {
  try {
    const tmdbType = type === 'series' ? 'tv' : 'movie';
    const page = Math.floor(skip / 20) + 1;
    
    // Build URL
    let url = `${TMDB_API_URL}/discover/${tmdbType}?api_key=${TMDB_API_KEY}&language=en&sort_by=popularity.desc&page=${page}&with_original_language=ml`;
    
    // Add genre filter if provided
    if (genre) {
      // Map genre to TMDB genre ID
      const genreId = getGenreId(genre, type);
      if (genreId) {
        url += `&with_genres=${genreId}`;
      }
    }
    
    // Fetch from TMDB
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return { metas: [] };
    }
    
    // Map TMDB results to Stremio format
    const metas = data.results.map(item => ({
      id: `ml-${item.id}`,
      type: type,
      name: item.title || item.name,
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
      releaseInfo: (item.release_date || item.first_air_date || '').substring(0, 4),
      imdbRating: item.vote_average ? item.vote_average.toFixed(1) : null,
      description: item.overview,
      language: 'Malayalam',
      country: 'India'
    }));
    
    return { metas };
  } catch (error) {
    console.error(`Error getting Malayalam ${type} catalog:`, error);
    throw error;
  }
}

/**
 * Gets English movies catalog from TMDB
 * @param {string|null} genre - Optional genre filter
 * @param {number} skip - Number of items to skip
 * @returns {Promise<Array>} - Array of catalog items
 */
async function getEnglishMoviesCatalog(genre, skip) {
  try {
    const page = Math.floor(skip / 20) + 1;
    
    // Build URL
    let url = `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en&sort_by=popularity.desc&page=${page}&with_original_language=en`;
    
    // Add genre filter if provided
    if (genre) {
      // Map genre to TMDB genre ID
      const genreId = getGenreId(genre, 'movie');
      if (genreId) {
        url += `&with_genres=${genreId}`;
      }
    }
    
    // Fetch from TMDB
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return { metas: [] };
    }
    
    // Map TMDB results to Stremio format
    const metas = await Promise.all(data.results.map(async (item) => {
      // Get IMDB ID for each movie
      const imdbId = await getImdbId(item.id, 'movie');
      
      return {
        id: imdbId || `tt${item.id}`, // Use IMDB ID if available, otherwise create a fake one
        type: 'movie',
        name: item.title,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        releaseInfo: item.release_date ? item.release_date.substring(0, 4) : null,
        imdbRating: item.vote_average ? item.vote_average.toFixed(1) : null,
        description: item.overview,
        language: 'English'
      };
    }));
    
    return { metas };
  } catch (error) {
    console.error('Error getting English movies catalog:', error);
    throw error;
  }
}

/**
 * Gets English TV series catalog from TMDB
 * @param {string|null} genre - Optional genre filter
 * @param {number} skip - Number of items to skip
 * @returns {Promise<Array>} - Array of catalog items
 */
async function getEnglishSeriesCatalog(genre, skip) {
  try {
    const page = Math.floor(skip / 20) + 1;
    
    // Build URL
    let url = `${TMDB_API_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en&sort_by=popularity.desc&page=${page}&with_original_language=en`;
    
    // Add genre filter if provided
    if (genre) {
      // Map genre to TMDB genre ID
      const genreId = getGenreId(genre, 'series');
      if (genreId) {
        url += `&with_genres=${genreId}`;
      }
    }
    
    // Fetch from TMDB
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return { metas: [] };
    }
    
    // Map TMDB results to Stremio format
    const metas = await Promise.all(data.results.map(async (item) => {
      // Get IMDB ID for each series
      const imdbId = await getImdbId(item.id, 'tv');
      
      return {
        id: imdbId || `tt${item.id}`, // Use IMDB ID if available, otherwise create a fake one
        type: 'series',
        name: item.name,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        releaseInfo: item.first_air_date ? item.first_air_date.substring(0, 4) : null,
        imdbRating: item.vote_average ? item.vote_average.toFixed(1) : null,
        description: item.overview,
        language: 'English'
      };
    }));
    
    return { metas };
  } catch (error) {
    console.error('Error getting English series catalog:', error);
    throw error;
  }
}

/**
 * Gets IMDB ID from TMDB ID
 * @param {number} tmdbId - TMDB ID
 * @param {string} type - Content type (movie or tv)
 * @returns {Promise<string|null>} - IMDB ID or null if not found
 */
async function getImdbId(tmdbId, type) {
  try {
    const url = `${TMDB_API_URL}/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.imdb_id || null;
  } catch (error) {
    console.error(`Error getting IMDB ID for TMDB ID ${tmdbId}:`, error);
    return null;
  }
}

/**
 * Maps genre name to TMDB genre ID
 * @param {string} genreName - Genre name
 * @param {string} type - Content type (movie or series)
 * @returns {number|null} - TMDB genre ID or null if not found
 */
function getGenreId(genreName, type) {
  const movieGenres = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'history': 36,
    'horror': 27,
    'music': 10402,
    'mystery': 9648,
    'romance': 10749,
    'science-fiction': 878,
    'thriller': 53,
    'war': 10752,
    'western': 37
  };
  
  const tvGenres = {
    'action': 10759,
    'adventure': 10759,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'kids': 10762,
    'mystery': 9648,
    'news': 10763,
    'reality': 10764,
    'sci-fi': 10765,
    'soap': 10766,
    'talk': 10767,
    'war': 10768,
    'western': 37
  };
  
  const normalizedGenre = genreName.toLowerCase();
  
  return type === 'movie' || type === 'movie' 
    ? movieGenres[normalizedGenre] || null
    : tvGenres[normalizedGenre] || null;
}

export { getCatalog };

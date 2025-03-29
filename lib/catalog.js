import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

/**
 * Gets catalog data based on the request
 */
async function getCatalog(args) {
  const { type, id, extra } = args;
  const skip = extra && extra.skip ? parseInt(extra.skip) : 0;
  const genre = extra && extra.genre ? extra.genre : null;
  
  console.log(`Getting catalog for type: ${type}, id: ${id}, skip: ${skip}, genre: ${genre}`);
  
  // Determine which catalog to get based on the id
  if (id === 'dudexawaitz-malayalam-movies' || id === 'dudexawaitz-malayalam-series') {
    return {
      metas: await getMalayalamCatalog(type, genre, skip)
    };
  } else if (id === 'dudexawaitz-english-movies') {
    return {
      metas: await getEnglishMoviesCatalog(genre, skip)
    };
  } else if (id === 'dudexawaitz-english-series') {
    return {
      metas: await getEnglishSeriesCatalog(genre, skip)
    };
  }
  
  return { metas: [] };
}

/**
 * Gets Malayalam content catalog from TMDB
 */
async function getMalayalamCatalog(type, genre, skip) {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return [];
  }

  try {
    const mediaType = type === 'movie' ? 'movie' : 'tv';
    let url = `${TMDB_API_BASE}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=ml&page=${Math.floor(skip / 20) + 1}`;
    
    if (genre) {
      const genreMap = {
        'action': 28,
        'comedy': 35,
        'drama': 18,
        'thriller': 53,
        'romance': 10749,
        'family': 10751
      };
      
      if (genreMap[genre.toLowerCase()]) {
        url += `&with_genres=${genreMap[genre.toLowerCase()]}`;
      }
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results) {
      console.error('Invalid TMDB response:', data);
      return [];
    }
    
    return data.results.map(item => {
      return {
        id: `ml${item.id}`,
        type: type,
        name: item.title || item.name,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        releaseInfo: item.release_date || item.first_air_date ? (item.release_date || item.first_air_date).substring(0, 4) : '',
        description: item.overview,
        imdbRating: item.vote_average ? (item.vote_average / 2).toFixed(1) : null
      };
    });
  } catch (error) {
    console.error('Error fetching Malayalam catalog:', error);
    return [];
  }
}

/**
 * Gets English movies catalog from TMDB
 */
async function getEnglishMoviesCatalog(genre, skip) {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return [];
  }

  try {
    let url = `${TMDB_API_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&page=${Math.floor(skip / 20) + 1}&sort_by=popularity.desc`;
    
    if (genre) {
      const genreMap = {
        'action': 28,
        'comedy': 35,
        'drama': 18,
        'thriller': 53,
        'horror': 27,
        'romance': 10749,
        'sci-fi': 878,
        'family': 10751
      };
      
      if (genreMap[genre.toLowerCase()]) {
        url += `&with_genres=${genreMap[genre.toLowerCase()]}`;
      }
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results) {
      console.error('Invalid TMDB response:', data);
      return [];
    }
    
    return data.results.map(item => {
      return {
        id: item.imdb_id || `tt${Math.floor(1000000 + Math.random() * 9000000)}`,
        type: 'movie',
        name: item.title,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        releaseInfo: item.release_date ? item.release_date.substring(0, 4) : '',
        description: item.overview,
        imdbRating: item.vote_average ? (item.vote_average / 2).toFixed(1) : null
      };
    });
  } catch (error) {
    console.error('Error fetching English movies catalog:', error);
    return [];
  }
}

/**
 * Gets English TV series catalog from TMDB
 */
async function getEnglishSeriesCatalog(genre, skip) {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return [];
  }

  try {
    let url = `${TMDB_API_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=en&page=${Math.floor(skip / 20) + 1}&sort_by=popularity.desc`;
    
    if (genre) {
      const genreMap = {
        'action': 10759,
        'comedy': 35,
        'drama': 18,
        'crime': 80,
        'documentary': 99,
        'family': 10751,
        'mystery': 9648,
        'sci-fi': 10765
      };
      
      if (genreMap[genre.toLowerCase()]) {
        url += `&with_genres=${genreMap[genre.toLowerCase()]}`;
      }
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results) {
      console.error('Invalid TMDB response:', data);
      return [];
    }
    
    return data.results.map(item => {
      return {
        id: item.imdb_id || `tt${Math.floor(1000000 + Math.random() * 9000000)}`,
        type: 'series',
        name: item.name,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        releaseInfo: item.first_air_date ? item.first_air_date.substring(0, 4) : '',
        description: item.overview,
        imdbRating: item.vote_average ? (item.vote_average / 2).toFixed(1) : null
      };
    });
  } catch (error) {
    console.error('Error fetching English series catalog:', error);
    return [];
  }
}

export { getCatalog };

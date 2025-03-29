import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

// In-memory storage for user state
const userStates = {};

/**
 * Get or create a user state
 */
function getUserState(userId) {
  if (!userStates[userId]) {
    userStates[userId] = {
      watchProgress: {},
      watchHistory: []
    };
  }
  
  return userStates[userId];
}

/**
 * Update user watch progress
 */
async function updateWatchProgress(userId, itemId, itemType, season, episode, position, duration) {
  const userState = getUserState(userId);
  const watchKey = createWatchKey(itemId, itemType, season, episode);
  
  // Create or update the watch item
  const timestamp = Date.now();
  const percentWatched = Math.round((position / duration) * 100);
  
  const watchItem = {
    key: watchKey,
    itemId,
    itemType,
    season,
    episode,
    position,
    duration,
    percentWatched,
    timestamp,
    title: '', // Will be updated later
    poster: '' // Will be updated later
  };
  
  // Try to get metadata for the item
  try {
    let tmdbId;
    let metadata;
    const mediaType = itemType === 'movie' ? 'movie' : 'tv';
    
    // Extract TMDB ID
    if (itemId.startsWith('ml')) {
      tmdbId = itemId.substring(2);
      
      // Get metadata from TMDB
      const response = await fetch(`${TMDB_API_BASE}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}`);
      metadata = await response.json();
      
      if (metadata) {
        watchItem.title = metadata.title || metadata.name || '';
        watchItem.poster = metadata.poster_path ? `https://image.tmdb.org/t/p/w300${metadata.poster_path}` : '';
        
        // Add episode title for series
        if (itemType === 'series' && season && episode) {
          try {
            const episodeResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`);
            const episodeData = await episodeResponse.json();
            
            if (episodeData) {
              watchItem.episodeTitle = episodeData.name || '';
              watchItem.thumbnail = episodeData.still_path ? `https://image.tmdb.org/t/p/w300${episodeData.still_path}` : '';
            }
          } catch (error) {
            console.error('Error fetching episode data:', error);
          }
        }
      }
    } else if (itemId.startsWith('tt')) {
      // Find TMDB ID from IMDb ID
      const findResponse = await fetch(`${TMDB_API_BASE}/find/${itemId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
      const findData = await findResponse.json();
      
      const results = findData[`${mediaType}_results`];
      if (results && results.length > 0) {
        tmdbId = results[0].id;
        
        // Get metadata from TMDB
        const response = await fetch(`${TMDB_API_BASE}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}`);
        metadata = await response.json();
        
        if (metadata) {
          watchItem.title = metadata.title || metadata.name || '';
          watchItem.poster = metadata.poster_path ? `https://image.tmdb.org/t/p/w300${metadata.poster_path}` : '';
          
          // Add episode title for series
          if (itemType === 'series' && season && episode) {
            try {
              const episodeResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`);
              const episodeData = await episodeResponse.json();
              
              if (episodeData) {
                watchItem.episodeTitle = episodeData.name || '';
                watchItem.thumbnail = episodeData.still_path ? `https://image.tmdb.org/t/p/w300${episodeData.still_path}` : '';
              }
            } catch (error) {
              console.error('Error fetching episode data:', error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching metadata for watch item:', error);
  }
  
  // Update the watch progress
  userState.watchProgress[watchKey] = watchItem;
  
  // Add to watch history if not already present
  if (!userState.watchHistory.includes(watchKey)) {
    userState.watchHistory.push(watchKey);
  }
  // If already in history, move it to the front
  else {
    const index = userState.watchHistory.indexOf(watchKey);
    userState.watchHistory.splice(index, 1);
    userState.watchHistory.unshift(watchKey);
  }
  
  return watchItem;
}

/**
 * Get continue watching items for a user
 */
function getContinueWatching(userId, limit = 20) {
  const userState = getUserState(userId);
  
  // Get the most recent watch keys from history
  const recentKeys = userState.watchHistory.slice(0, limit);
  
  // Get the watch items for these keys
  const continueWatching = recentKeys
    .map(key => userState.watchProgress[key])
    .filter(item => item && item.percentWatched > 0 && item.percentWatched < 90) // Only show items not finished
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first
  
  return continueWatching;
}

/**
 * Create a unique key for a watch item
 */
function createWatchKey(itemId, itemType, season, episode) {
  if (itemType === 'movie') {
    return `${itemId}:movie`;
  } else {
    return `${itemId}:series:s${season}e${episode}`;
  }
}

/**
 * Get next episodes for series
 */
async function getNextEpisodes(itemId, season, episode) {
  try {
    let tmdbId;
    const nextEpisodes = [];
    
    // Extract TMDB ID
    if (itemId.startsWith('ml')) {
      tmdbId = itemId.substring(2);
    } else if (itemId.startsWith('tt')) {
      // Find TMDB ID from IMDb ID
      const findResponse = await fetch(`${TMDB_API_BASE}/find/${itemId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
      const findData = await findResponse.json();
      
      const results = findData['tv_results'];
      if (results && results.length > 0) {
        tmdbId = results[0].id;
      } else {
        return [];
      }
    } else {
      tmdbId = itemId;
    }
    
    // Get the current season episodes
    const seasonResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}/season/${season}?api_key=${TMDB_API_KEY}`);
    const seasonData = await seasonResponse.json();
    
    if (seasonData.episodes) {
      // Get episodes after the current one in this season
      const nextEpisodesInSeason = seasonData.episodes
        .filter(ep => ep.episode_number > episode)
        .map(ep => ({
          id: `se${season}ep${ep.episode_number}`,
          title: ep.name,
          episode: ep.episode_number,
          season: season,
          released: ep.air_date,
          overview: ep.overview,
          thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null
        }));
      
      nextEpisodes.push(...nextEpisodesInSeason);
    }
    
    // If there are no more episodes in the current season, check the next season
    if (nextEpisodes.length === 0) {
      try {
        const nextSeasonResponse = await fetch(`${TMDB_API_BASE}/tv/${tmdbId}/season/${season + 1}?api_key=${TMDB_API_KEY}`);
        const nextSeasonData = await nextSeasonResponse.json();
        
        if (nextSeasonData.episodes) {
          // Get the first episodes of the next season
          const firstEpisodesNextSeason = nextSeasonData.episodes
            .slice(0, 3) // Just get the first 3 episodes
            .map(ep => ({
              id: `se${season + 1}ep${ep.episode_number}`,
              title: ep.name,
              episode: ep.episode_number,
              season: season + 1,
              released: ep.air_date,
              overview: ep.overview,
              thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null
            }));
          
          nextEpisodes.push(...firstEpisodesNextSeason);
        }
      } catch (error) {
        console.error('Error fetching next season:', error);
      }
    }
    
    return nextEpisodes;
  } catch (error) {
    console.error('Error fetching next episodes:', error);
    return [];
  }
}

/**
 * Get user recommendations based on watch history
 */
async function getRecommendations(userId) {
  const userState = getUserState(userId);
  const recommendations = [];
  
  // Get the most recent watch keys from history (up to 5)
  const recentKeys = userState.watchHistory.slice(0, 5);
  
  // Get recommendations for each recent item
  for (const key of recentKeys) {
    const watchItem = userState.watchProgress[key];
    
    if (watchItem) {
      try {
        let tmdbId;
        const mediaType = watchItem.itemType === 'movie' ? 'movie' : 'tv';
        
        // Extract TMDB ID
        if (watchItem.itemId.startsWith('ml')) {
          tmdbId = watchItem.itemId.substring(2);
        } else if (watchItem.itemId.startsWith('tt')) {
          // Find TMDB ID from IMDb ID
          const findResponse = await fetch(`${TMDB_API_BASE}/find/${watchItem.itemId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
          const findData = await findResponse.json();
          
          const results = findData[`${mediaType}_results`];
          if (results && results.length > 0) {
            tmdbId = results[0].id;
          } else {
            continue;
          }
        } else {
          tmdbId = watchItem.itemId;
        }
        
        // Get recommendations from TMDB
        const recommendResponse = await fetch(`${TMDB_API_BASE}/${mediaType}/${tmdbId}/recommendations?api_key=${TMDB_API_KEY}`);
        const recommendData = await recommendResponse.json();
        
        if (recommendData.results) {
          // Format the recommendations
          const itemRecommendations = recommendData.results
            .slice(0, 5) // Just get the first 5 recommendations
            .map(item => {
              const type = item.title ? 'movie' : 'series';
              
              return {
                id: type === 'movie' ? item.id.toString() : `tt${Math.floor(1000000 + Math.random() * 9000000)}`,
                type: type,
                name: item.title || item.name,
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
                releaseInfo: item.release_date || item.first_air_date ? (item.release_date || item.first_air_date).substring(0, 4) : '',
                description: item.overview,
                imdbRating: item.vote_average ? (item.vote_average / 2).toFixed(1) : null
              };
            });
          
          recommendations.push(...itemRecommendations);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }
  }
  
  // Remove duplicates and return the recommendations
  const uniqueRecommendations = [];
  const seenIds = new Set();
  
  for (const item of recommendations) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueRecommendations.push(item);
    }
  }
  
  return uniqueRecommendations.slice(0, 20); // Return at most 20 recommendations
}

export { getUserState, updateWatchProgress, getContinueWatching, getNextEpisodes, getRecommendations };

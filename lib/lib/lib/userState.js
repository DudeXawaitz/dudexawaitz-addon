/**
 * User state module for maintaining watch progress and user preferences
 */

// In-memory database for user state
// In a production environment, this would be a real database
const userStateDb = new Map();

/**
 * Get or create a user state
 * @param {string} userId - The user ID
 * @returns {Object} - The user state object
 */
function getUserState(userId) {
  if (!userStateDb.has(userId)) {
    userStateDb.set(userId, {
      watchProgress: {},
      preferences: {
        defaultQuality: '1080p',
        defaultLanguage: 'original',
        defaultSubtitles: 'en',
        autoplayNext: true
      }
    });
  }
  
  return userStateDb.get(userId);
}

/**
 * Update user watch progress
 * @param {string} userId - The user ID
 * @param {string} itemId - The content item ID
 * @param {string} itemType - The content type (movie or series)
 * @param {number|null} season - The season number (for series)
 * @param {number|null} episode - The episode number (for series)
 * @param {number} position - The playback position in seconds
 * @param {number} duration - The total duration in seconds
 * @returns {Object} - The updated watch progress
 */
async function updateWatchProgress(userId, itemId, itemType, season, episode, position, duration) {
  // Get the user's state
  const userState = getUserState(userId);
  
  // Create a unique key for this content
  const watchKey = createWatchKey(itemId, itemType, season, episode);
  
  // Update the watch progress
  const now = new Date().toISOString();
  const progress = position / duration;
  
  userState.watchProgress[watchKey] = {
    itemId,
    itemType,
    season,
    episode,
    position,
    duration,
    progress,
    lastWatched: now,
    isFinished: progress > 0.9 // Consider it finished if more than 90% watched
  };
  
  // If this is a series and the episode is finished, prepare next episode data
  if (itemType === 'series' && progress > 0.9) {
    const nextEpisodes = await getNextEpisodes(itemId, season, episode);
    if (nextEpisodes.length > 0) {
      userState.watchProgress[watchKey].nextEpisode = nextEpisodes[0];
    }
  }
  
  return userState.watchProgress[watchKey];
}

/**
 * Get continue watching items for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} - Array of continue watching items
 */
function getContinueWatching(userId, limit = 20) {
  // Get the user's state
  const userState = getUserState(userId);
  
  // Get all watch progress items
  const watchItems = Object.values(userState.watchProgress);
  
  // Filter and sort items
  const continueItems = watchItems
    .filter(item => !item.isFinished) // Only include unfinished items
    .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched)) // Sort by most recently watched
    .slice(0, limit); // Limit results
  
  return continueItems;
}

/**
 * Create a unique key for a watch item
 * @param {string} itemId - The content item ID
 * @param {string} itemType - The content type
 * @param {number|null} season - The season number
 * @param {number|null} episode - The episode number
 * @returns {string} - A unique watch key
 */
function createWatchKey(itemId, itemType, season, episode) {
  if (itemType === 'series' && season !== null && episode !== null) {
    return `${itemId}:${itemType}:s${season}e${episode}`;
  }
  return `${itemId}:${itemType}`;
}

/**
 * Get next episodes for series
 * @param {string} itemId - The series ID
 * @param {number} season - Current season
 * @param {number} episode - Current episode
 * @returns {Promise<Array>} - Array of next episodes
 */
async function getNextEpisodes(itemId, season, episode) {
  // This is a simplified implementation
  // In a real implementation, you would fetch actual episode data from a database or API
  
  const nextEpisodes = [];
  
  // Add next episode in same season
  nextEpisodes.push({
    itemId,
    itemType: 'series',
    season: season,
    episode: episode + 1,
    title: `Season ${season}, Episode ${episode + 1}`
  });
  
  // If last episode of season, add first episode of next season
  if (episode >= 10) { // Assuming 10 episodes per season for simplicity
    nextEpisodes.push({
      itemId,
      itemType: 'series',
      season: season + 1,
      episode: 1,
      title: `Season ${season + 1}, Episode 1`
    });
  }
  
  return nextEpisodes;
}

/**
 * Get user recommendations based on watch history
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of recommended items
 */
async function getRecommendations(userId) {
  // Get the user's state
  const userState = getUserState(userId);
  
  // Get all watch progress items
  const watchItems = Object.values(userState.watchProgress);
  
  // This would be a more sophisticated algorithm in a real implementation
  // For now, simply return the user's most watched genres/types
  
  // Count item types (movie vs series)
  const typeCounts = watchItems.reduce((counts, item) => {
    counts[item.itemType] = (counts[item.itemType] || 0) + 1;
    return counts;
  }, {});
  
  // Determine user's preference
  const preferredType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'movie';
  
  // Generate mock recommendations
  // In a real implementation, this would fetch tailored content from an API
  return [
    {
      id: preferredType === 'movie' ? 'tt1234567' : 'tt7654321',
      type: preferredType,
      name: `Recommended ${preferredType === 'movie' ? 'Movie' : 'Series'} 1`,
      posterUrl: 'https://example.com/poster1.jpg',
      reason: 'Based on your watch history'
    },
    {
      id: preferredType === 'movie' ? 'tt2345678' : 'tt8765432',
      type: preferredType,
      name: `Recommended ${preferredType === 'movie' ? 'Movie' : 'Series'} 2`,
      posterUrl: 'https://example.com/poster2.jpg',
      reason: 'Popular in your region'
    }
  ];
}

export { getUserState, updateWatchProgress, getContinueWatching, getNextEpisodes, getRecommendations };

/**
 * DudeXawaitz - Premium Filters Engine
 * Advanced filtering system for quality, language, and subtitles
 */

(function() {
  // Filter state
  const filterState = {
    quality: [],
    language: [],
    subtitles: []
  };
  
  /**
   * Sets up the filter UI and controls
   */
  function initializeFilters() {
    // Create filter UI container
    const filterPanel = document.createElement('div');
    filterPanel.className = 'filter-panel';
    filterPanel.innerHTML = `
      <div class="filter-header">
        <h3>Premium Filters</h3>
        <span class="filter-badge">0</span>
        <button class="filter-close">&times;</button>
      </div>
      <div class="filter-body">
        <div class="filter-section">
          <h4>Quality</h4>
          <div class="filter-options" id="qualityOptions">
            <label class="filter-option"><input type="checkbox" value="4k"> 4K Ultra HD</label>
            <label class="filter-option"><input type="checkbox" value="1080p"> 1080p Full HD</label>
            <label class="filter-option"><input type="checkbox" value="720p"> 720p HD</label>
            <label class="filter-option"><input type="checkbox" value="480p"> 480p SD</label>
          </div>
        </div>
        <div class="filter-section">
          <h4>Audio Language</h4>
          <div class="filter-options" id="languageOptions">
            <label class="filter-option"><input type="checkbox" value="english"> English</label>
            <label class="filter-option"><input type="checkbox" value="malayalam"> Malayalam</label>
            <label class="filter-option"><input type="checkbox" value="hindi"> Hindi</label>
            <label class="filter-option"><input type="checkbox" value="tamil"> Tamil</label>
          </div>
        </div>
        <div class="filter-section">
          <h4>Subtitles</h4>
          <div class="filter-options" id="subtitleOptions">
            <label class="filter-option"><input type="checkbox" value="english"> English</label>
            <label class="filter-option"><input type="checkbox" value="malayalam"> Malayalam</label>
            <label class="filter-option"><input type="checkbox" value="spanish"> Spanish</label>
            <label class="filter-option"><input type="checkbox" value="french"> French</label>
            <label class="filter-option"><input type="checkbox" value="german"> German</label>
          </div>
        </div>
      </div>
      <div class="filter-footer">
        <button class="filter-reset">Reset</button>
        <button class="filter-apply">Apply</button>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(filterPanel);
    
    // Set up event listeners
    setupFilterEventListeners();
  }
  
  /**
   * Set up event listeners for the filter controls
   */
  function setupFilterEventListeners() {
    // Toggle filter panel
    const filterButton = document.createElement('button');
    filterButton.className = 'filter-toggle-button';
    filterButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
      <span class="filter-toggle-badge">0</span>
    `;
    
    document.body.appendChild(filterButton);
    
    filterButton.addEventListener('click', () => {
      const filterPanel = document.querySelector('.filter-panel');
      filterPanel.classList.toggle('show');
    });
    
    // Close panel
    document.querySelector('.filter-close').addEventListener('click', () => {
      document.querySelector('.filter-panel').classList.remove('show');
    });
    
    // Reset filters
    document.querySelector('.filter-reset').addEventListener('click', () => {
      // Uncheck all checkboxes
      document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Clear filter state
      Object.keys(filterState).forEach(key => {
        filterState[key] = [];
      });
      
      // Update badge
      updateFilterBadge();
    });
    
    // Apply filters
    document.querySelector('.filter-apply').addEventListener('click', () => {
      // Update filter state
      filterState.quality = Array.from(document.querySelectorAll('#qualityOptions input:checked')).map(cb => cb.value);
      filterState.language = Array.from(document.querySelectorAll('#languageOptions input:checked')).map(cb => cb.value);
      filterState.subtitles = Array.from(document.querySelectorAll('#subtitleOptions input:checked')).map(cb => cb.value);
      
      // Apply filters
      applyFilters();
      
      // Update badge
      updateFilterBadge();
      
      // Close panel
      document.querySelector('.filter-panel').classList.remove('show');
    });
  }
  
  /**
   * Apply selected filters to the content
   */
  function applyFilters() {
    // This would connect to the stream selection in a real implementation
    console.log('Filters applied:', filterState);
    
    // In a real implementation, this would filter the streams
    // For demo purposes, just log the filter state
    const totalFilters = Object.values(filterState).reduce((total, filters) => total + filters.length, 0);
    if (totalFilters > 0) {
      console.log(`Applied ${totalFilters} filters to content`);
      
      // Apply to player if it exists
      applyFiltersToPlayer();
    }
  }
  
  /**
   * Apply filters to the player
   */
  function applyFiltersToPlayer() {
    // In a real implementation, this would connect to the video player
    // For demo purposes, just create a notification
    
    const notification = document.createElement('div');
    notification.className = 'filter-notification';
    
    // Build message based on applied filters
    let message = 'Filters applied: ';
    const appliedFilters = [];
    
    if (filterState.quality.length > 0) {
      appliedFilters.push(`Quality (${filterState.quality.map(q => q.toUpperCase()).join(', ')})`);
    }
    
    if (filterState.language.length > 0) {
      appliedFilters.push(`Language (${filterState.language.map(capitalizeFirstLetter).join(', ')})`);
    }
    
    if (filterState.subtitles.length > 0) {
      appliedFilters.push(`Subtitles (${filterState.subtitles.map(capitalizeFirstLetter).join(', ')})`);
    }
    
    message += appliedFilters.join(' | ');
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after a delay
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }
  
  /**
   * Update the filter badge with the count of active filters
   */
  function updateFilterBadge() {
    const totalFilters = Object.values(filterState).reduce((total, filters) => total + filters.length, 0);
    
    // Update panel badge
    const filterBadge = document.querySelector('.filter-badge');
    filterBadge.textContent = totalFilters;
    
    // Update toggle button badge
    const toggleBadge = document.querySelector('.filter-toggle-badge');
    toggleBadge.textContent = totalFilters;
    
    if (totalFilters > 0) {
      filterBadge.classList.add('active');
      toggleBadge.classList.add('active');
    } else {
      filterBadge.classList.remove('active');
      toggleBadge.classList.remove('active');
    }
  }
  
  /**
   * Helper function to capitalize the first letter of a string
   */
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  /**
   * Updates the filter panel based on stream metadata
   * @param {Object} metadata - The stream metadata
   */
  function updateStreamFilters(metadata) {
    // In a real implementation, this would update the filter options
    // based on the available streams for the current content
    if (!metadata) return;
    
    // For demo purposes, just log that we would update based on metadata
    console.log('Would update filters based on stream metadata:', metadata);
  }
  
  // Initialize filters when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFilters);
  } else {
    initializeFilters();
  }
  
  // Expose functions to global scope
  window.dudeXawaitzFilters = {
    updateStreamFilters,
    applyFilters
  };
})();

/**
 * DudeXawaitz - Premium Entertainment Experience
 * Custom JavaScript for UI interactions and animations
 */

/**
 * Handles scroll-based animations for elements
 */
function animateOnScroll() {
  const featureCards = document.querySelectorAll('.feature-card');
  const contentCards = document.querySelectorAll('.content-card');
  
  const options = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  featureCards.forEach(card => {
    observer.observe(card);
    // Set random delay for staggered animation
    const delay = Math.random() * 0.5;
    card.style.transitionDelay = `${delay}s`;
  });
  
  contentCards.forEach(card => {
    observer.observe(card);
    // Set random delay for staggered animation
    const delay = Math.random() * 0.5;
    card.style.transitionDelay = `${delay}s`;
  });
  
  function checkElementsInView(elements) {
    elements.forEach(element => {
      const position = element.getBoundingClientRect();
      if (position.top < window.innerHeight && position.bottom >= 0) {
        element.classList.add('visible');
      }
    });
  }
  
  // Initial check on page load
  checkElementsInView(featureCards);
  checkElementsInView(contentCards);
}

/**
 * Creates parallax effect for the logo and other elements
 */
function setupParallaxEffect() {
  const logo = document.querySelector('.logo');
  const heroSection = document.querySelector('.hero-section');
  
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    
    if (scrollPosition < window.innerHeight) {
      const translateY = scrollPosition * 0.3;
      const scale = 1 - (scrollPosition * 0.0005);
      const opacity = 1 - (scrollPosition * 0.002);
      
      logo.style.transform = `translateY(${translateY}px) scale(${scale})`;
      logo.style.opacity = opacity;
      
      heroSection.style.backgroundPositionY = `${scrollPosition * 0.4}px`;
    }
  });
}

/**
 * Initializes the addon installation modal
 */
function initializeInstallModal() {
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.querySelector('.modal');
    if (modal && e.target === modal) {
      modal.remove();
    }
  });
  
  // Handle escape key press
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal');
      if (modal) {
        modal.remove();
      }
    }
  });
}

/**
 * Shows the installation modal with addon URL
 * @param {string} addonUrl - The addon manifest URL
 */
function showInstallModal(addonUrl) {
  // Remove existing modal if present
  const existingModal = document.querySelector('.modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  createModal(addonUrl);
}

/**
 * Creates the modal HTML structure and adds it to the document
 * @param {string} addonUrl - The addon manifest URL
 */
function createModal(addonUrl) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Add logo
  const logoImg = document.createElement('img');
  logoImg.src = '/static/logo.svg';
  logoImg.alt = 'DudeXawaitz Logo';
  logoImg.className = 'modal-logo';
  
  // Add title
  const title = document.createElement('h2');
  title.textContent = 'Install DudeXawaitz Addon';
  title.className = 'modal-title';
  
  // Add steps
  const steps = document.createElement('div');
  steps.className = 'install-steps';
  
  steps.innerHTML = `
    <div class="step">
      <div class="step-number">1</div>
      <div class="step-text">
        <h3>Open Stremio App</h3>
        <p>Make sure you have Stremio installed and open it.</p>
      </div>
    </div>
    <div class="step">
      <div class="step-number">2</div>
      <div class="step-text">
        <h3>Copy Addon URL</h3>
        <div class="addon-url-container">
          <input type="text" value="${addonUrl}" readonly class="addon-url" id="addonUrl">
          <button class="copy-button" id="copyButton">Copy</button>
        </div>
      </div>
    </div>
    <div class="step">
      <div class="step-number">3</div>
      <div class="step-text">
        <h3>Add to Stremio</h3>
        <p>Go to the addons section in Stremio, click 'Add Addon', paste the URL and enjoy!</p>
      </div>
    </div>
  `;
  
  // Add direct install button
  const directInstallButton = document.createElement('a');
  directInstallButton.href = `stremio://${addonUrl}`;
  directInstallButton.className = 'direct-install-button';
  directInstallButton.textContent = 'Install Directly';
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    modal.remove();
  });
  
  // Assemble modal
  modalContent.appendChild(logoImg);
  modalContent.appendChild(title);
  modalContent.appendChild(steps);
  modalContent.appendChild(directInstallButton);
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  
  // Add to document
  document.body.appendChild(modal);
  
  // Set up copy button functionality
  const copyButton = document.getElementById('copyButton');
  const addonUrlInput = document.getElementById('addonUrl');
  
  copyButton.addEventListener('click', () => {
    addonUrlInput.select();
    document.execCommand('copy');
    
    // Show success feedback
    copyButton.textContent = 'Copied!';
    copyButton.classList.add('copied');
    
    setTimeout(() => {
      copyButton.textContent = 'Copy';
      copyButton.classList.remove('copied');
    }, 2000);
  });
  
  // Animation entrance
  setTimeout(() => {
    modalContent.classList.add('show');
  }, 10);
}

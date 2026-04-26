/**
 * Portfolio Main Script
 * Handles navigation, smooth scrolling, and scroll reveal animations.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Mobile Navigation Toggle ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-item');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Close mobile menu when a link is clicked
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  });

  // --- 2. Sticky Navbar ---
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    // Add shadow to navbar when scrolled
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // --- Hero About Animation ---
    const hero = document.getElementById('home');
    if (hero) {
      // Toggle about card when user scrolls down
      if (window.scrollY > 30) {
        hero.classList.add('show-about');
      } else {
        hero.classList.remove('show-about');
      }
    }
  });

  // --- 3. Scroll Reveal Animation ---
  function reveal() {
    const reveals = document.querySelectorAll('.reveal');

    for (let i = 0; i < reveals.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = reveals[i].getBoundingClientRect().top;
      const elementVisible = 100; // Trigger distance

      if (elementTop < windowHeight - elementVisible) {
        reveals[i].classList.add('active');
      }
    }
  }

  window.addEventListener('scroll', reveal);
  // Trigger once on load
  reveal();

  // --- 4. Smooth Scrolling for Anchor Links ---
  // (Mostly handled by CSS scroll-behavior: smooth, but this ensures consistency)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
      }
    });
  });

  // --- 5. Project Modals ---
  const projectCards = document.querySelectorAll('.project-card');
  const modals = document.querySelectorAll('.modal');
  const closeBtns = document.querySelectorAll('.close-modal');

  // Open modal
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      if (targetId) {
        const targetModal = document.getElementById(targetId);
        if (targetModal) {
          targetModal.style.display = 'block';
          document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
      }
    });
  });

  // Close modal via close button
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Restore scrolling
    });
  });

  // Close modal via clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // --- 6. Lightbox for Images ---
  const clickableImages = document.querySelectorAll('.clickable-image');
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightbox = document.querySelector('.close-lightbox');

  clickableImages.forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent modal from closing or doing other things
      lightbox.classList.add('active');
      lightboxImg.src = img.src;
    });
  });

  if (closeLightbox) {
    closeLightbox.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
  }

  // Close lightbox clicking outside image
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
  }

  // --- 7. Fetch Documentation from GitHub Issues ---
  const docsContainer = document.getElementById('docs-container');
  if (docsContainer) {
    const repoUrl = 'https://api.github.com/repos/Tvissouarn1/docs/issues';
    
    fetch(repoUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur HTTP ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        docsContainer.innerHTML = ''; // Remove loader
        
        // Filter only issues (exclude pull requests)
        const issues = data.filter(item => !item.pull_request);
        
        if (issues.length === 0) {
          docsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">Aucun document trouvé dans les Issues du dépôt.</p>';
          return;
        }

        const docModal = document.getElementById('doc-modal');
        const docModalTitle = document.getElementById('doc-modal-title');
        const docModalBody = document.getElementById('doc-modal-body');
        const closeDocModal = document.querySelector('.close-doc-modal');

        if (closeDocModal) {
          closeDocModal.addEventListener('click', () => {
            docModal.style.display = 'none';
            document.body.style.overflow = 'auto';
          });
        }

        issues.forEach(issue => {
          const card = document.createElement('div');
          card.className = 'doc-card reveal active'; // pre-reveal since it's loaded asynchronously
          card.style.cursor = 'pointer';
          
          card.innerHTML = `
            <div class="doc-icon"><i class="fa-brands fa-markdown"></i></div>
            <div class="doc-info">
              <h3>${issue.title}</h3>
              <p>Par ${issue.user.login} - ${new Date(issue.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          `;
          
          card.addEventListener('click', () => {
            if (docModal && typeof marked !== 'undefined') {
              docModalTitle.textContent = issue.title;
              docModalBody.innerHTML = marked.parse(issue.body || '*Aucun contenu*');
              docModal.style.display = 'block';
              document.body.style.overflow = 'hidden';
            }
          });
          
          docsContainer.appendChild(card);
        });
      })
      .catch(error => {
        docsContainer.innerHTML = `<div class="api-error"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de charger la documentation depuis GitHub.<br><small>${error.message}</small></div>`;
      });
  }

  // --- 8. Handle Local PDF Modals ---
  const localPdfCards = document.querySelectorAll('.local-pdf-card');
  if (localPdfCards.length > 0) {
    const docModal = document.getElementById('doc-modal');
    const docModalTitle = document.getElementById('doc-modal-title');
    const docModalBody = document.getElementById('doc-modal-body');
    const closeDocModal = document.querySelector('.close-doc-modal');

    // Add close listener just in case it wasn't added by the GitHub fetch logic yet
    if (closeDocModal && !closeDocModal.dataset.listenerAdded) {
      closeDocModal.addEventListener('click', () => {
        docModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        docModalBody.innerHTML = ''; // Clear iframe to stop resources
      });
      closeDocModal.dataset.listenerAdded = 'true';
    }

    localPdfCards.forEach(card => {
      card.addEventListener('click', () => {
        if (docModal) {
          docModalTitle.textContent = card.getAttribute('data-title');
          // Use an iframe to display the PDF natively
          docModalBody.innerHTML = `<iframe src="${card.getAttribute('data-pdf')}" width="100%" height="70vh" style="min-height: 500px; border:none; border-radius: 4px; background: #fff;"></iframe>`;
          docModal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }

});

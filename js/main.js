document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initLightbox();
  initNavTracking();
  initMobileMenu();
  loadWorks();
  loadExhibitions();
  loadMedia();
});

/* ===== Banner Slider ===== */
function initSlider() {
  const container = document.getElementById('ps_container');
  if (!container) return;
  const wrapper = container.querySelector('.ps_image_wrapper');
  const img = wrapper.querySelector('img');
  const dots = container.querySelectorAll('.ps_dot');
  const prevBtn = container.querySelector('.ps_prev');
  const nextBtn = container.querySelector('.ps_next');
  const total = dots.length;
  let current = Math.floor(Math.random() * total);

  function show(idx) {
    current = ((idx % total) + total) % total;
    img.classList.add('fade-out');
    setTimeout(() => {
      img.src = dots[current].dataset.full;
      img.classList.remove('fade-out');
    }, 300);
    dots.forEach(d => d.classList.remove('selected'));
    dots[current].classList.add('selected');
  }

  // Show initial random image
  img.src = dots[current].dataset.full;
  dots.forEach(d => d.classList.remove('selected'));
  dots[current].classList.add('selected');

  // Auto-rotate every 3 seconds; stop permanently on any user interaction
  let autoplay = setInterval(() => show(current + 1), 3000);
  function stopAutoplay() { clearInterval(autoplay); }

  prevBtn.addEventListener('click', () => { stopAutoplay(); show(current - 1); });
  nextBtn.addEventListener('click', () => { stopAutoplay(); show(current + 1); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAutoplay(); show(i); }));
}

/* ===== Lightbox ===== */
function initLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">&times;</button>
    <button class="lb-prev" aria-label="Previous image">&lsaquo;</button>
    <button class="lb-next" aria-label="Next image">&rsaquo;</button>
    <img class="lb-img" src="" alt="Artwork">
    <div class="lb-info"><span class="lb-counter"></span><span class="lb-title"></span></div>
  `;
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector('.lb-img');
  const lbCounter = overlay.querySelector('.lb-counter');
  const lbTitle = overlay.querySelector('.lb-title');
  let group = [];
  let idx = 0;

  function open(trigger) {
    const grp = trigger.dataset.group;
    group = [...document.querySelectorAll(`a.lightbox[data-group="${grp}"]`)];
    idx = group.indexOf(trigger);
    showCurrent();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showCurrent() {
    const link = group[idx];
    lbImg.src = link.href;
    lbCounter.textContent = `Image ${idx + 1} / ${group.length}`;
    lbTitle.textContent = link.dataset.title || '';
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function next() { idx = (idx + 1) % group.length; showCurrent(); }
  function prev() { idx = (idx - 1 + group.length) % group.length; showCurrent(); }

  overlay.querySelector('.lb-close').addEventListener('click', close);
  overlay.querySelector('.lb-prev').addEventListener('click', prev);
  overlay.querySelector('.lb-next').addEventListener('click', next);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Touch swipe support
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prev(); else next();
    }
  }, { passive: true });

  // Bind all lightbox triggers (delegated)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('a.lightbox');
    if (trigger) {
      e.preventDefault();
      open(trigger);
    }
  });
}

/* ===== Active Nav Tracking ===== */
function initNavTracking() {
  const navLinks = document.querySelectorAll('nav ul li a');
  const navItems = document.querySelectorAll('nav ul li');

  function setActive(id) {
    navItems.forEach(li => li.classList.remove('active'));
    const link = document.querySelector(`nav a[href="#${id}"]`);
    if (link) link.parentElement.classList.add('active');
  }

  // Map nav hrefs to their target section IDs (skip #top)
  const sectionIds = [...navLinks].map(a => a.getAttribute('href').slice(1));

  // On click: immediately activate the clicked nav item
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      setActive(link.getAttribute('href').slice(1));
    });
  });

  // On scroll: find which section is currently in view
  function updateOnScroll() {
    const scrollY = window.scrollY + 150; // offset to trigger slightly after passing section top
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;

    // If at bottom of page, activate last section (contact)
    if (docHeight - winHeight - window.scrollY < 50) {
      setActive('contact');
      return;
    }

    // Find the last section whose top is above our scroll position
    let currentId = sectionIds[0];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) {
        currentId = id;
      }
    }
    setActive(currentId);
  }

  window.addEventListener('scroll', updateOnScroll, { passive: true });

  // On load: handle hash in URL or set initial state
  const hash = window.location.hash.slice(1);
  if (hash && sectionIds.includes(hash)) {
    setActive(hash);
  } else {
    updateOnScroll();
  }
}

/* ===== Mobile Menu ===== */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===== Load Works from JSON ===== */
function loadWorks() {
  const container = document.getElementById('work-categories');
  if (!container) return;

  fetch('data/works.json')
    .then(r => r.json())
    .then(categories => {
      container.innerHTML = categories.map(cat => {
        const imagesHtml = cat.images.map(img => {
          const fullPath = `images/categories/${cat.folder}/full/${img.file}`;
          const thumbPath = `images/categories/${cat.folder}/thumbs/${img.file}`;
          const title = (img.title || cat.name).replace(/"/g, '&quot;');
          return `<li><figure><a href="${fullPath}" class="lightbox" data-group="${cat.id}" data-title="${title}"><img src="${thumbPath}" alt="${cat.name} artwork" loading="lazy"></a></figure></li>`;
        }).join('');

        return `<details class="category">
          <summary><h3>${cat.name}</h3></summary>
          <ul class="projects list">${imagesHtml}</ul>
        </details>`;
      }).join('');
    })
    .catch(err => console.error('Failed to load works:', err));
}

/* ===== Load Exhibitions from JSON ===== */
function loadExhibitions() {
  const container = document.getElementById('exhibitions-list');
  const recentGrid = document.getElementById('recent-exhibitions');

  fetch('data/exhibitions.json')
    .then(r => r.json())
    .then(data => {
      // Populate exhibitions list
      if (container) {
        container.innerHTML = data.map(ex => {
          // Build info text
          let info = ex.type;
          if (ex.title) {
            if (ex.titleLink) {
              info += `, <a href="${ex.titleLink}" target="_blank" rel="noopener">"${ex.title}"</a>`;
            } else {
              info += `, "${ex.title}"`;
            }
          }
          if (ex.venue) {
            if (ex.venueLink) {
              info += `, <a href="${ex.venueLink}" target="_blank" rel="noopener">${ex.venue}</a>`;
            } else {
              info += `, ${ex.venue}`;
            }
          }
          if (ex.location) {
            info += `, ${ex.location}`;
          }
          if (ex.note) {
            info += ` &ndash; ${ex.note}`;
          }

          // Build icon
          let icon = '';
          if (ex.image) {
            icon = `<a href="${ex.image}" class="lightbox exhibition-photo" data-group="exhibition" data-title="${(ex.type + (ex.title ? ', ' + ex.title : '') + (ex.location ? ', ' + ex.location : '')).replace(/"/g, '&quot;')}"><img src="images/icon_magnify.gif" alt="View" loading="lazy"></a>`;
          }

          return `<div class="exhibition-entry">
            <span class="year">${ex.year}</span>
            <span class="info">${info}</span>
            <span>${icon}</span>
          </div>`;
        }).join('');
      }

      // Populate recent/featured exhibitions on home page
      if (recentGrid) {
        const featured = data.filter(ex => ex.featured);
        recentGrid.innerHTML = featured.map(ex => {
          const title = (ex.title || ex.type).replace(/"/g, '&quot;');
          const thumb = ex.thumbnail || ex.image;
          return `<div class="two-column">
            <figure>
              <a href="${ex.image}" class="lightbox" data-group="recent_work" data-title="${title}"><img src="${thumb}" alt="${title}" loading="lazy"></a>
            </figure>
          </div>`;
        }).join('');
      }
    })
    .catch(err => console.error('Failed to load exhibitions:', err));
}

/* ===== Load Media from JSON ===== */
function loadMedia() {
  const container = document.getElementById('media-list');
  if (!container) return;

  fetch('data/media.json')
    .then(r => r.json())
    .then(data => {
      container.innerHTML = data.map(entry => {
        // Build text + links
        let info = entry.text;
        if (entry.links && entry.links.length) {
          info += ' ' + entry.links.map(l =>
            `<a href="${l.url}" target="_blank" rel="noopener">${l.text}</a>`
          ).join(' ');
        }

        // Build optional image icon
        let icon = '';
        if (entry.image) {
          const title = (entry.imageTitle || '').replace(/"/g, '&quot;');
          icon = `<a href="${entry.image}" class="lightbox media-photo" data-group="media" data-title="${title}"><img src="images/icon_magnify.gif" alt="View" loading="lazy"></a>`;
        }

        return `<div class="media-entry">
          <span class="info">${info.trim()}</span>
          <span>${icon}</span>
        </div>`;
      }).join('');
    })
    .catch(err => console.error('Failed to load media:', err));
}

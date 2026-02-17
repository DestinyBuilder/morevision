/* ═══════════════════════════════════════════════════════════
   MORE VISION & EVENT PRODUCTION — Main JavaScript
   Features: Navbar, ScrollReveal, CountUp, Gallery Filter,
             Form Validation, Mobile Menu, Lightbox
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────
     1. NAVBAR: scroll + mobile menu
  ──────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    // Close mobile nav when a link is clicked
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Highlight active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link, .nav-mobile .navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });


  /* ────────────────────────────────
     2. SCROLL REVEAL
  ──────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }


  /* ────────────────────────────────
     3. COUNT-UP ANIMATION for stats
  ──────────────────────────────── */
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const numEl   = entry.target.querySelector('.stat-num');
        const sufEl   = entry.target.querySelector('.stat-suffix');
        if (!numEl) return;

        // Extract the raw number text (everything before suffix child)
        const rawText = numEl.childNodes[0]?.nodeValue?.trim() || '';
        const target  = parseInt(rawText.replace(/\D/g, ''), 10);
        if (!target) return;

        let startTime = null;
        const duration = 1600;

        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
          const current  = Math.floor(eased * target);
          numEl.childNodes[0].nodeValue = current.toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
          else numEl.childNodes[0].nodeValue = target.toLocaleString();
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    statCards.forEach(card => counterObserver.observe(card));
  }


  /* ────────────────────────────────
     4. GALLERY FILTER
  ──────────────────────────────── */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.filter;
        galleryItems.forEach(item => {
          const match = cat === 'all' || item.dataset.category === cat;
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          if (match) {
            item.style.opacity   = '1';
            item.style.transform = 'scale(1)';
            item.style.display   = '';
          } else {
            item.style.opacity   = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
              if (item.style.opacity === '0') item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }


  /* ────────────────────────────────
     5. FORM VALIDATION
  ──────────────────────────────── */
  const forms = document.querySelectorAll('[data-validate]');

  forms.forEach(form => {
    const fields = form.querySelectorAll('[data-required]');

    // Real-time validation
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      fields.forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (isValid) {
        const submitBtn = form.querySelector('[type="submit"]');
        const successMsg = form.querySelector('.form-success');

        if (submitBtn) {
          const original = submitBtn.textContent;
          submitBtn.textContent = 'Sending…';
          submitBtn.disabled = true;

          setTimeout(() => {
            submitBtn.textContent = '✓ Sent!';
            if (successMsg) successMsg.classList.add('show');
            form.reset();
            setTimeout(() => {
              submitBtn.textContent = original;
              submitBtn.disabled = false;
              if (successMsg) successMsg.classList.remove('show');
            }, 5000);
          }, 1200);
        }
      }
    });
  });

  function validateField(field) {
    const errorEl = field.parentElement.querySelector('.form-error');
    const val     = field.value.trim();
    let   msg     = '';

    if (field.dataset.required !== undefined && !val) {
      msg = 'This field is required.';
    } else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email address.';
    } else if (field.type === 'tel' && val && !/^[\d\s\+\-\(\)]{7,15}$/.test(val)) {
      msg = 'Please enter a valid phone number.';
    } else if (field.tagName === 'TEXTAREA' && field.dataset.minlength && val.length < parseInt(field.dataset.minlength)) {
      msg = `Please enter at least ${field.dataset.minlength} characters.`;
    } else if (field.tagName === 'SELECT' && !val) {
      msg = 'Please select an option.';
    }

    if (msg) {
      field.classList.add('error');
      if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('show'); }
      return false;
    } else {
      field.classList.remove('error');
      if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('show'); }
      return true;
    }
  }


  /* ────────────────────────────────
     6. SMOOTH ANCHOR SCROLLING
  ──────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ────────────────────────────────
     7. GALLERY LIGHTBOX (simple)
  ──────────────────────────────── */
  const galleryImgs = document.querySelectorAll('.gallery-item img');
  if (galleryImgs.length) {
    // Create overlay
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
      <div id="lightbox-backdrop"></div>
      <div id="lightbox-inner">
        <button id="lightbox-close" aria-label="Close">✕</button>
        <img id="lightbox-img" src="" alt="Gallery image" />
        <p id="lightbox-cap"></p>
      </div>`;
    document.body.appendChild(lightbox);

    // Lightbox styles (injected dynamically so they don't bloat the CSS)
    const style = document.createElement('style');
    style.textContent = `
      #lightbox { position:fixed; inset:0; z-index:9999; display:none; align-items:center; justify-content:center; }
      #lightbox.open { display:flex; }
      #lightbox-backdrop { position:absolute; inset:0; background:rgba(4,5,8,0.94); backdrop-filter:blur(8px); }
      #lightbox-inner { position:relative; z-index:2; max-width:90vw; max-height:90vh; text-align:center; }
      #lightbox-img { max-width:90vw; max-height:80vh; border-radius:14px; box-shadow:0 30px 80px rgba(0,0,0,0.8); object-fit:contain; }
      #lightbox-cap { margin-top:0.8rem; font-size:0.85rem; color:#7a7f96; font-style:italic; }
      #lightbox-close { position:absolute; top:-44px; right:0; background:rgba(255,92,0,0.15); border:1px solid rgba(255,92,0,0.3); color:#ff8c38; width:36px; height:36px; border-radius:50%; font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
      #lightbox-close:hover { background:rgba(255,92,0,0.3); }
    `;
    document.head.appendChild(style);

    const lbImg  = document.getElementById('lightbox-img');
    const lbCap  = document.getElementById('lightbox-cap');
    const lbClose = document.getElementById('lightbox-close');
    const lbBackdrop = document.getElementById('lightbox-backdrop');

    galleryImgs.forEach(img => {
      img.parentElement.style.cursor = 'pointer';
      img.parentElement.addEventListener('click', () => {
        lbImg.src = img.src;
        lbCap.textContent = img.alt || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };
    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }


  /* ────────────────────────────────
     8. FLOATING CARDS ANIMATION
  ──────────────────────────────── */
  document.querySelectorAll('.float-animate').forEach((el, i) => {
    el.style.animation = `float-card ${6 + i}s ease-in-out ${i * 2}s infinite`;
  });

});

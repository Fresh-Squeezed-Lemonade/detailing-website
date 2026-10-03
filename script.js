/* =========================================================
   Jordan Clark's Car Detailing — script.js
   • Sticky nav scroll behaviour
   • Mobile nav toggle (with focus return + outside-click close)
   • Smooth scroll via CSS scroll-margin-top (JS only closes mobile menu)
   • Footer year
   • Contact form (mailto, honest success state, button stays available)
   • Lightbox (focus trap, debounced transitions, touch swipe)
   ========================================================= */

'use strict';

// ── FOOTER YEAR ──────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();


// ── STICKY NAV ───────────────────────────────────────────
const nav = document.getElementById('nav');

const handleScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
};

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();


// ── MOBILE NAV TOGGLE ────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

const openNav = () => {
  navLinks.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close menu');
  // Use a class on <body> instead of inline overflow so the lightbox
  // can manage its own scroll lock independently
  document.body.classList.add('nav-open');
};

const closeNav = (returnFocus = true) => {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('nav-open');
  // Return focus to the toggle button (skip when user clicked a link —
  // the browser will move focus to the destination instead)
  if (returnFocus) navToggle.focus();
};

navToggle.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeNav() : openNav();
});

// Close on link click — don't steal focus from the scroll destination
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => closeNav(false));
});

// Close on Escape — return focus to toggle
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav(true);
});

// Close when clicking outside the open menu
document.addEventListener('click', e => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !navToggle.contains(e.target)
  ) {
    closeNav(false);
  }
});


// ── SMOOTH SCROLL ────────────────────────────────────────
// Offset is handled by scroll-padding-top / scroll-margin-top in CSS.
// JS only prevents the default jump on '#' hrefs so the CSS smooth
// scroll and offset take effect cleanly.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') { e.preventDefault(); return; }
    // All other anchors: let the browser handle smooth scroll via CSS.
    // No manual scrollTo needed.
  });
});


// ── CONTACT FORM ─────────────────────────────────────────
const contactForm    = document.getElementById('contactForm');
const contactSubmit  = document.getElementById('contactSubmit');
const contactSuccess = document.getElementById('contactSuccess');

const contactValidators = {
  contactName:    v => v.trim().length < 2  ? 'Please enter your name.'                          : '',
  contactEmail:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.',
  contactSubject: v => v.trim().length < 2  ? 'Please enter a subject.'                          : '',
  contactMessage: v => v.trim().length < 10 ? 'Please write a message (at least 10 characters).' : '',
};

const showContactError = (id, msg) => {
  const field = document.getElementById(id);
  const err   = document.getElementById(id + 'Error');
  if (!field || !err) return;
  field.classList.toggle('error', !!msg);
  err.textContent = msg;
};

Object.keys(contactValidators).forEach(id => {
  const field = document.getElementById(id);
  if (!field) return;
  field.addEventListener('blur',  () => showContactError(id, contactValidators[id](field.value)));
  field.addEventListener('input', () => {
    if (field.classList.contains('error'))
      showContactError(id, contactValidators[id](field.value));
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let hasError = false;

    Object.keys(contactValidators).forEach(id => {
      const field = document.getElementById(id);
      const msg   = contactValidators[id](field ? field.value : '');
      showContactError(id, msg);
      if (msg) hasError = true;
    });

    if (hasError) return;

    const name    = document.getElementById('contactName').value.trim();
    const email   = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    const body   = `Hi Jordan,%0A%0A${encodeURIComponent(message)}%0A%0A— ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
    const mailto = `mailto:122otoj@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailto;

    // Show an honest status — the email hasn't been sent yet, just prepared.
    // Leave the button available so the user can retry if their email app
    // didn't open.
    contactSuccess.textContent =
      '✓ Your email app should open with your message ready — just review and hit Send there.';
    contactSuccess.hidden = false;
  });
}


// ── LIGHTBOX ─────────────────────────────────────────────
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Image viewer');
lightbox.innerHTML = `
  <button class="lightbox__close" aria-label="Close image">&times;</button>
  <button class="lightbox__prev" aria-label="Previous image">&#8249;</button>
  <button class="lightbox__next" aria-label="Next image">&#8250;</button>
  <div class="lightbox__inner">
    <img class="lightbox__img" src="" alt="" />
    <p class="lightbox__caption"></p>
  </div>
`;
document.body.appendChild(lightbox);

const lightboxImg     = lightbox.querySelector('.lightbox__img');
const lightboxCaption = lightbox.querySelector('.lightbox__caption');
const lightboxClose   = lightbox.querySelector('.lightbox__close');
const lightboxPrev    = lightbox.querySelector('.lightbox__prev');
const lightboxNext    = lightbox.querySelector('.lightbox__next');

// All focusable elements inside the lightbox (for focus trapping)
const lightboxFocusable = [lightboxClose, lightboxPrev, lightboxNext];

const galleryImages = Array.from(document.querySelectorAll('.before-after__panel img'));
let currentIndex  = 0;
let lastFocused   = null; // element that had focus before lightbox opened
let transitionPending = false; // debounce rapid arrow presses

const updateNavButtons = () => {
  const show = galleryImages.length > 1;
  lightboxPrev.style.display = show ? '' : 'none';
  lightboxNext.style.display = show ? '' : 'none';
};

const openLightbox = index => {
  lastFocused  = document.activeElement;
  currentIndex = index;
  const img = galleryImages[currentIndex];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  lightbox.classList.add('active');
  // Use a class so this doesn't conflict with the nav scroll lock
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
  updateNavButtons();
};

const closeLightbox = () => {
  lightbox.classList.remove('active');
  document.body.classList.remove('lightbox-open');
  // Return focus to wherever it was before opening
  if (lastFocused) lastFocused.focus();
};

const showImage = index => {
  if (transitionPending) return; // ignore rapid key/button presses
  transitionPending = true;
  currentIndex = (index + galleryImages.length) % galleryImages.length;
  const img = galleryImages[currentIndex];

  lightboxImg.classList.add('lightbox__img--fade');
  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightboxImg.classList.remove('lightbox__img--fade');
    transitionPending = false;
  }, 150);

  updateNavButtons();
};

// Make gallery images clickable
galleryImages.forEach((img, index) => {
  img.style.cursor = 'zoom-in';
  img.setAttribute('tabindex', '0');
  img.addEventListener('click', () => openLightbox(index));
  img.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });
});

// Controls
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));

// Click backdrop to close
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard: Escape, arrows, and focus trap (Tab stays inside lightbox)
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;

  if (e.key === 'Escape')     { closeLightbox(); return; }
  if (e.key === 'ArrowLeft')  { showImage(currentIndex - 1); return; }
  if (e.key === 'ArrowRight') { showImage(currentIndex + 1); return; }

  // Focus trap — keep Tab cycling within the lightbox buttons
  if (e.key === 'Tab') {
    const visible = lightboxFocusable.filter(el => el.style.display !== 'none');
    if (visible.length === 0) { e.preventDefault(); return; }
    const first = visible[0];
    const last  = visible[visible.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }
});

// Touch swipe support for mobile
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 40) { // 40px threshold
    diff > 0 ? showImage(currentIndex + 1) : showImage(currentIndex - 1);
  }
}, { passive: true });
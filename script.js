/* =========================================================
   Jordan Clark's Car Detailing — script.js
   • Sticky nav scroll behaviour
   • Mobile nav toggle (with focus return + outside-click close)
   • Smooth scroll via CSS scroll-margin-top (JS only closes mobile menu)
   • Footer year
   • Contact form (EmailJS — no email app required)
   • Lightbox (focus trap, debounced transitions, touch swipe)
   • Reviews strip (reads reviews.js) + review form (EmailJS)
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


// ── CONTACT FORM (EmailJS) ───────────────────────────────
emailjs.init('b-wDLjf2ow3eMg5Um');

const contactForm    = document.getElementById('contactForm');
const contactSubmit  = document.getElementById('contactSubmit');
const contactSuccess = document.getElementById('contactSuccess');

const contactValidators = {
  contactName:    v => v.trim().length < 2  ? 'Please enter your name.'                           : '',
  contactEmail:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.',
  contactSubject: v => v.trim().length < 2  ? 'Please enter a subject.'                           : '',
  contactMessage: v => v.trim().length < 10 ? 'Please write a message (at least 10 characters).'  : '',
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
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    let hasError = false;

    Object.keys(contactValidators).forEach(id => {
      const field = document.getElementById(id);
      const msg   = contactValidators[id](field ? field.value : '');
      showContactError(id, msg);
      if (msg) hasError = true;
    });

    if (hasError) return;

    // Disable button and show loading state while sending
    contactSubmit.disabled = true;
    contactSubmit.textContent = 'Sending…';

    const templateParams = {
      from_name:    document.getElementById('contactName').value.trim(),
      from_email:   document.getElementById('contactEmail').value.trim(),
      subject:      document.getElementById('contactSubject').value.trim(),
      message:      document.getElementById('contactMessage').value.trim(),
    };

    try {
      await emailjs.send('website', 'template_gmfnron', templateParams);

      // Real success — email was actually sent
      contactForm.reset();
      contactSubmit.hidden = true;
      contactSuccess.textContent = '✓ Message sent! I\'ll get back to you soon.';
      contactSuccess.hidden = false;

    } catch (err) {
      console.error('EmailJS error:', err);
      contactSubmit.disabled = false;
      contactSubmit.textContent = 'Send Message';
      showContactError('contactMessage', 'Something went wrong — please try again or email me directly at 122otoj@gmail.com.');
    }
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
  <div class="lightbox__inner">
    <img class="lightbox__img" src="" alt="" />
    <p class="lightbox__caption"></p>
  </div>
`;
document.body.appendChild(lightbox);

const lightboxImg     = lightbox.querySelector('.lightbox__img');
const lightboxCaption = lightbox.querySelector('.lightbox__caption');
const lightboxClose   = lightbox.querySelector('.lightbox__close');

// All focusable elements inside the lightbox (for focus trapping)
const lightboxFocusable = [lightboxClose];

const galleryImages = Array.from(document.querySelectorAll('.before-after__panel img'));
let currentIndex  = 0;
let lastFocused   = null; // element that had focus before lightbox opened
let transitionPending = false; // debounce rapid arrow presses

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


// ── REVIEWS (reads reviews.js) ───────────────────────────
// Add or hide reviews by editing reviews.js — nothing in this file needs to change.
const reviewsList    = document.getElementById('reviewsList');
const reviewsSummary = document.getElementById('reviewsSummary');
const reviewsPrev    = document.getElementById('reviewsPrev');
const reviewsNext    = document.getElementById('reviewsNext');

const activeReviews = (window.REVIEWS || []).filter(r =>
  r && r.active === true &&
  typeof r.name === 'string' && r.name.trim() &&
  typeof r.review === 'string' && r.review.trim() &&
  Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5
);

const renderReview = r => {
  const card = document.createElement('blockquote');
  card.className = 'review-card';

  const stars = document.createElement('div');
  stars.className = 'review-card__stars';
  stars.setAttribute('aria-label', `${r.rating} out of 5 stars`);
  stars.textContent = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

  const text = document.createElement('p');
  text.className = 'review-card__text';
  text.textContent = r.review.trim();

  const author = document.createElement('footer');
  author.className = 'review-card__author';
  author.textContent = r.name.trim();

  card.append(stars, text, author);
  return card;
};

if (reviewsList && activeReviews.length) {
  reviewsList.innerHTML = '';
  activeReviews.forEach(r => reviewsList.appendChild(renderReview(r)));

  const avg = activeReviews.reduce((total, r) => total + r.rating, 0) / activeReviews.length;
  reviewsSummary.textContent =
    `${avg.toFixed(1)} out of 5 · ${activeReviews.length} ${activeReviews.length === 1 ? 'review' : 'reviews'}`;

  // Buttons move one card at a time to exact card positions, so they never
  // fight the scroll-snap. The strip itself still swipes / shift-scrolls normally.
  const cards = () => Array.from(reviewsList.querySelectorAll('.review-card'));

  const updateArrows = () => {
    const max = reviewsList.scrollWidth - reviewsList.clientWidth;
    const overflow = max > 4;
    reviewsPrev.hidden = !overflow;
    reviewsNext.hidden = !overflow;
    reviewsPrev.disabled = reviewsList.scrollLeft <= 4;
    reviewsNext.disabled = reviewsList.scrollLeft >= max - 4;
  };

  const scrollByCard = dir => {
    const list = cards();
    const here = reviewsList.scrollLeft;
    // index of the card currently at (or nearest to) the left edge
    let current = 0;
    list.forEach((c, i) => {
      if (Math.abs(c.offsetLeft - list[0].offsetLeft - here) <
          Math.abs(list[current].offsetLeft - list[0].offsetLeft - here)) current = i;
    });
    const target = list[Math.min(Math.max(current + dir, 0), list.length - 1)];
    reviewsList.scrollTo({
      left: target.offsetLeft - list[0].offsetLeft,
      behavior: 'smooth'
    });
  };

  reviewsPrev.addEventListener('click', () => scrollByCard(-1));
  reviewsNext.addEventListener('click', () => scrollByCard(1));
  reviewsList.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}


// ── REVIEW FORM (EmailJS) ────────────────────────────────
// Reviews are emailed to Jordan for approval; they are not published automatically.
const reviewForm = document.getElementById('reviewForm');

if (reviewForm) {
  const reviewSubmit  = document.getElementById('reviewSubmit');
  const reviewSuccess = document.getElementById('reviewSuccess');

  const setReviewError = (id, msg) => {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  };

  reviewForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = document.getElementById('reviewName').value.trim();
    const email   = document.getElementById('reviewEmail').value.trim();
    const message = document.getElementById('reviewMessage').value.trim();
    const rating  = reviewForm.querySelector('input[name="rating"]:checked');

    let hasError = false;

    if (name.length < 2) {
      setReviewError('reviewNameError', 'Please enter your name.');
      hasError = true;
    } else setReviewError('reviewNameError', '');

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setReviewError('reviewEmailError', 'Enter a valid email or leave this blank.');
      hasError = true;
    } else setReviewError('reviewEmailError', '');

    if (!rating) {
      setReviewError('reviewRatingError', 'Please choose a star rating.');
      hasError = true;
    } else setReviewError('reviewRatingError', '');

    if (message.length < 10) {
      setReviewError('reviewMessageError', 'Please write a few words about your experience.');
      hasError = true;
    } else setReviewError('reviewMessageError', '');

    if (hasError) return;

    reviewSubmit.disabled = true;
    reviewSubmit.textContent = 'Sending…';

    try {
      await emailjs.send('website', 'template_gmfnron', {
        from_name:  name,
        from_email: email || 'Not provided',
        subject:    `New review: ${rating.value}/5 stars`,
        message:    `Rating: ${rating.value}/5\n\n${message}`,
      });

      reviewForm.reset();
      reviewSubmit.hidden = true;
      reviewSuccess.hidden = false;
    } catch (err) {
      console.error('EmailJS review error:', err);
      reviewSubmit.disabled = false;
      reviewSubmit.textContent = 'Submit Review';
      setReviewError('reviewMessageError', 'Something went wrong. Please try again in a moment.');
    }
  });
}
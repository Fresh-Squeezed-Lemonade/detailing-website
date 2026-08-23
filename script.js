/* =========================================================
   Jordan Clark's Car Detailing — script.js
   • Sticky nav scroll behaviour
   • Mobile nav toggle
   • Smooth scroll with nav offset
   • Footer year
   • Lightbox for before/after gallery images
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
  document.body.style.overflow = 'hidden';
};

const closeNav = () => {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
};

navToggle.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeNav() : openNav();
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav();
});


// ── SMOOTH SCROLL OFFSET (accounts for fixed nav) ────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = nav.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});


// ── LIGHTBOX ─────────────────────────────────────────────
// Build the lightbox overlay once and reuse it
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

// Collect all gallery images in order
const galleryImages = Array.from(document.querySelectorAll('.before-after__panel img'));
let currentIndex = 0;

const openLightbox = index => {
  currentIndex = index;
  const img = galleryImages[currentIndex];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
  updateNavButtons();
};

const closeLightbox = () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  // Return focus to the image that was clicked
  galleryImages[currentIndex].focus();
};

const showImage = index => {
  currentIndex = (index + galleryImages.length) % galleryImages.length;
  const img = galleryImages[currentIndex];
  lightboxImg.classList.add('lightbox__img--fade');
  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightboxImg.classList.remove('lightbox__img--fade');
  }, 150);
  updateNavButtons();
};

const updateNavButtons = () => {
  // Hide nav arrows if there's only one image
  const show = galleryImages.length > 1;
  lightboxPrev.style.display = show ? '' : 'none';
  lightboxNext.style.display = show ? '' : 'none';
};

// Make each gallery image clickable
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

// Click outside image to close
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard: Escape to close, arrow keys to navigate
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showImage(currentIndex - 1);
  if (e.key === 'ArrowRight')  showImage(currentIndex + 1);
});
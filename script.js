// =============================
// Utility: DOM Ready
// =============================
const onReady = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

onReady(() => {
  initHeaderScroll();
  initMobileNav();
  initTypingEffect();
  initTimelineObserver();
  initProjectParallax();
  initProjectFilters();
  initSectionReveal();
  initBackgroundOrbits();
  initContactForm();
  setYear();
});

// =============================
// Sticky Header Shrink on Scroll
// =============================
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const toggleHeaderClass = () => {
    const scrolled = window.scrollY > 10;
    header.classList.toggle("site-header--scrolled", scrolled);
  };

  toggleHeaderClass();
  window.addEventListener("scroll", toggleHeaderClass, { passive: true });
}

// =============================
// Mobile Nav Toggle
// =============================
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  if (!toggle || !nav) return;

  const toggleNav = () => {
    nav.classList.toggle("nav--open");
  };

  toggle.addEventListener("click", toggleNav);

  nav.addEventListener("click", (event) => {
    const link = event.target.closest(".nav-link");
    if (!link) return;
    nav.classList.remove("nav--open");
  });
}

// =============================
// Typing Effect
// =============================
function initTypingEffect() {
  const typingEl = document.querySelector(".typing");
  if (!typingEl) return;

  let phrases = [];
  try {
    const raw = typingEl.getAttribute("data-phrases") || "[]";
    phrases = JSON.parse(raw);
  } catch {
    phrases = [];
  }

  if (!phrases.length) return;

  // Typing state machine
  const TYPE_SPEED = 70;
  const ERASE_SPEED = 45;
  const PAUSE_AFTER_TYPE = 1600;
  const PAUSE_AFTER_ERASE = 400;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const step = () => {
    const currentPhrase = phrases[phraseIndex] || "";
    const visible = isDeleting
      ? currentPhrase.slice(0, charIndex--)
      : currentPhrase.slice(0, charIndex++);

    typingEl.textContent = visible;

    if (!isDeleting && visible.length === currentPhrase.length) {
      isDeleting = true;
      setTimeout(step, PAUSE_AFTER_TYPE);
    } else if (isDeleting && visible.length === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(step, PAUSE_AFTER_ERASE);
    } else {
      const delay = isDeleting ? ERASE_SPEED : TYPE_SPEED;
      setTimeout(step, delay);
    }
  };

  step();
}

// =============================
// Timeline Animation on Scroll
// =============================
function initTimelineObserver() {
  const items = document.querySelectorAll(".timeline-item");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("timeline-item--visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("timeline-item--visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item) => observer.observe(item));
}

// =============================
// Project Card Parallax Depth
// =============================
function initProjectParallax() {
  const cards = document.querySelectorAll(".project-card");

  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const MAX_TRANSLATE = 10; // px
  const layers = new WeakMap();

  const handleMove = (event) => {
    const card = event.currentTarget;
    const inner = layers.get(card);
    if (!inner) return;

    const rect = card.getBoundingClientRect();
    const relX = event.clientX - rect.left;
    const relY = event.clientY - rect.top;

    const normX = (relX / rect.width) - 0.5;
    const normY = (relY / rect.height) - 0.5;

    const translateX = -normX * MAX_TRANSLATE;
    const translateY = -normY * MAX_TRANSLATE;

    inner.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0)`;
  };

  const handleEnter = (event) => {
    const card = event.currentTarget;
    const inner = layers.get(card);
    if (!inner) return;
    card.style.transform = "translateY(-4px)";
  };

  const handleLeave = (event) => {
    const card = event.currentTarget;
    const inner = layers.get(card);
    if (!inner) return;

    inner.style.transform = "translate3d(0, 0, 0)";
    card.style.transform = "translateY(0)";
  };

  cards.forEach((card) => {
    const inner = card.querySelector(".project-card-inner");
    if (!inner) return;
    layers.set(card, inner);

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseenter", handleEnter);
    card.addEventListener("mouseleave", handleLeave);
  });
}

// =============================
// Project Filters (Tabs)
// =============================
function initProjectFilters() {
  const buttons = document.querySelectorAll(".projects-filter-btn");
  const cards = document.querySelectorAll(".project-card");

  if (!buttons.length || !cards.length) return;

  const setActiveButton = (targetBtn) => {
    buttons.forEach((btn) => {
      const isActive = btn === targetBtn;
      btn.classList.toggle("projects-filter-btn--active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  };

  const filterCards = (filter) => {
    cards.forEach((card) => {
      const category = card.getAttribute("data-category");
      const show = filter === "all" || category === filter;
      card.style.display = show ? "" : "none";
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      setActiveButton(btn);
      filterCards(filter);
    });
  });

  // Initial state
  filterCards("all");
}

// =============================
// Section Reveal on Scroll
// =============================
function initSectionReveal() {
  const sections = document.querySelectorAll(".reveal-section");
  if (!sections.length) return;

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("reveal-section--visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-section--visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach((section) => observer.observe(section));
}

// =============================
// Background Orbits Scroll Response
// =============================
function initBackgroundOrbits() {
  const root = document.documentElement;
  if (!root) return;

  const updateScrollVar = () => {
    root.style.setProperty("--scrollY", String(window.scrollY || window.pageYOffset || 0));
  };

  updateScrollVar();
  window.addEventListener("scroll", updateScrollVar, { passive: true });
}

// =============================
// Contact Form (front-end only)
// =============================
function initContactForm() {
  const form = document.querySelector(".contact-form");
  const status = document.querySelector(".form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();

    status.textContent = `Thanks${name ? `, ${name}` : ""}! This demo form doesn’t send emails, but your message was captured locally.`;
  });
}

// =============================
// Footer Year
// =============================
function setYear() {
  const yearEl = document.getElementById("year");
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}

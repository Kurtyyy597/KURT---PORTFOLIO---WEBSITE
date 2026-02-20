/* index.js — aggressive modern interactions (no libraries)
   Features:
   - Scroll progress bar
   - Active nav link highlight while scrolling
   - Smooth scroll with offset for sticky header
   - Scroll-reveal animations (adds classes)
   - Magnetic buttons + links
   - Parallax tilt on hero card
   - Cursor glow trail
   - Auto-close mobile menu after click
   - Respects prefers-reduced-motion
*/

// ---------- Section Snap Assist (desktop only, controlled) ----------
const enableSnapAssist = !prefersReducedMotion && window.matchMedia("(min-width: 900px)").matches;

if (enableSnapAssist) {
  const snapSections = [...document.querySelectorAll("main > section")];
  let snapTimer = null;

  const snapToNearest = () => {
    const offset = header ? header.getBoundingClientRect().height + 10 : 10;

    // Find nearest section top to current scroll position
    const current = window.scrollY + offset;
    let nearest = snapSections[0];
    let bestDist = Infinity;

    for (const sec of snapSections) {
      const dist = Math.abs(sec.offsetTop - current);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = sec;
      }
    }

    // Only snap if we're reasonably close (prevents fighting the user)
    if (bestDist < 220 && nearest) {
      const top = nearest.offsetTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToNearest, 120);
    },
    { passive: true }
  );
}

(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ---------- Helpers ----------
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // ---------- 1) Scroll progress bar ----------
  const progress = document.createElement("div");
  progress.setAttribute("aria-hidden", "true");
  progress.style.position = "fixed";
  progress.style.top = "0";
  progress.style.left = "0";
  progress.style.height = "3px";
  progress.style.width = "0%";
  progress.style.zIndex = "9999";
  progress.style.background =
    "linear-gradient(90deg, rgba(124,92,255,1), rgba(34,211,238,1))";
  progress.style.boxShadow = "0 0 18px rgba(124,92,255,0.35)";
  document.body.appendChild(progress);

  function updateProgress() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progress.style.width = `${p}%`;
  }

  // ---------- 2) Smooth scroll with header offset ----------
  const header = qs(".site-header");
  const headerOffset = () =>
    header ? header.getBoundingClientRect().height : 0;

  function smoothScrollTo(targetEl) {
    if (!targetEl) return;
    const top =
      targetEl.getBoundingClientRect().top +
      window.scrollY -
      headerOffset() -
      10;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  // Intercept anchor links to ids (#resume, #contact, etc.)
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = qs(id);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(target);

      // auto-close mobile nav if open
      const navToggle = qs("#nav-toggle");
      if (navToggle && navToggle.checked) navToggle.checked = false;
    });
  });

  // ---------- 3) Active nav highlight on scroll ----------
  const navLinks = qsa(".navbar a").filter((a) =>
    a.getAttribute("href")?.startsWith("#"),
  );
  const sections = navLinks
    .map((a) => qs(a.getAttribute("href")))
    .filter(Boolean);

  function setActiveNavByScroll() {
    if (!sections.length) return;

    const scrollPos = window.scrollY + headerOffset() + 40;
    let activeIndex = 0;

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const top = s.offsetTop;
      if (scrollPos >= top) activeIndex = i;
    }

    navLinks.forEach((a) => a.classList.remove("active-section"));
    const activeLink = navLinks[activeIndex];
    if (activeLink) activeLink.classList.add("active-section");
  }

  // Add aggressive active style inline (no CSS edits required)
  const style = document.createElement("style");
  style.textContent = `
    .navbar a.active-section{
      color: rgba(255,255,255,0.95) !important;
      background: rgba(34,211,238,0.12) !important;
      border: 1px solid rgba(34,211,238,0.20) !important;
      box-shadow: 0 0 0 1px rgba(34,211,238,0.05), 0 10px 30px rgba(0,0,0,0.25);
    }
    .reveal{
      opacity: 0;
      transform: translateY(20px) scale(0.98);
      filter: blur(6px);
      transition: opacity 650ms ease, transform 650ms ease, filter 650ms ease;
      will-change: transform, opacity, filter;
    }
    .reveal.show{
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  `;
  document.head.appendChild(style);

  // ---------- 4) Scroll reveal (aggressive but clean) ----------
  const revealTargets = [
    ".hero-text",
    ".hero-card",
    ".cards .card",
    ".panel",
    ".resume-actions",
    ".resume-viewer",
    ".social-links a",
    ".section-head",
  ]
    .flatMap((sel) => qsa(sel))
    .filter(Boolean);

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if (!prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.15 },
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("show"));
  }

  // ---------- 5) Magnetic buttons / links ----------
  // Targets: .btn and social links
  const magneticEls = [...qsa(".btn"), ...qsa(".social-links a")];

  magneticEls.forEach((el) => {
    el.style.transform = "translate3d(0,0,0)";
    el.style.willChange = "transform";

    if (prefersReducedMotion) return;

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      const mx = clamp(x / (r.width / 2), -1, 1);
      const my = clamp(y / (r.height / 2), -1, 1);

      const strength = el.classList.contains("primary") ? 10 : 7;
      el.style.transform = `translate3d(${mx * strength}px, ${my * strength}px, 0)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate3d(0,0,0)";
    });
  });

  // ---------- 6) Parallax tilt on hero card ----------
  const heroCard = qs(".hero-card");
  if (heroCard && !prefersReducedMotion) {
    heroCard.style.transformStyle = "preserve-3d";
    heroCard.style.willChange = "transform";

    heroCard.addEventListener("mousemove", (e) => {
      const r = heroCard.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      const rotateY = (px - 0.5) * 10; // left/right
      const rotateX = (0.5 - py) * 10; // up/down
      heroCard.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    heroCard.addEventListener("mouseleave", () => {
      heroCard.style.transform = "none";
    });
  }

  // ---------- 7) Cursor glow trail (aggressive, modern) ----------
  if (!prefersReducedMotion) {
    const glow = document.createElement("div");
    glow.setAttribute("aria-hidden", "true");
    glow.style.position = "fixed";
    glow.style.width = "22px";
    glow.style.height = "22px";
    glow.style.borderRadius = "999px";
    glow.style.pointerEvents = "none";
    glow.style.zIndex = "9998";
    glow.style.mixBlendMode = "screen";
    glow.style.filter = "blur(10px)";
    glow.style.background =
      "radial-gradient(circle, rgba(34,211,238,0.9), rgba(124,92,255,0.35), transparent 70%)";
    glow.style.opacity = "0";
    document.body.appendChild(glow);

    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;

    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.style.opacity = "1";
    });

    const tick = () => {
      // smooth follow
      gx += (tx - gx) * 0.18;
      gy += (ty - gy) * 0.18;
      glow.style.transform = `translate3d(${gx - 11}px, ${gy - 11}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mouseout", () => {
      glow.style.opacity = "0";
    });
  }

  // ---------- 8) Close mobile menu when clicking a normal link ----------
  const navToggle = qs("#nav-toggle");
  if (navToggle) {
    qsa(".navbar a").forEach((a) => {
      a.addEventListener("click", () => {
        if (navToggle.checked) navToggle.checked = false;
      });
    });prefersReducedMotion
  }

  // ---------- 9) Throttled scroll handling ----------
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      setActiveNavByScroll();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateProgress();
    setActiveNavByScroll();
  });

  // Initial run
  updateProgress();
  setActiveNavByScroll();
})();

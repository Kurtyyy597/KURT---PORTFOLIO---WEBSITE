// =====================================
// Projects (V2)
// - Filters
// - Load More
// - Image click zoom (Lightbox)
// - Auto close mobile menu
// =====================================

(() => {
  // Auto-close mobile nav after clicking a link
  const navToggle = document.getElementById("nav-toggle");
  document.querySelectorAll(".navbar a").forEach((a) => {
    a.addEventListener("click", () => {
      if (navToggle && navToggle.checked) navToggle.checked = false;
    });
  });

  // ---------------------------
  // Filtering + Load More
  // ---------------------------
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".p-card"));
  const filterButtons = Array.from(
    document.querySelectorAll(".pill[data-filter]"),
  );
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const loadHint = document.getElementById("loadHint");
  const emptyState = document.getElementById("emptyState");

  let activeFilter = "all";
  const PAGE_SIZE = 6; // show 6 per "page"
  let visibleCount = 0;

  const getTags = (card) =>
    (card.getAttribute("data-tags") || "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

  const matchesFilter = (card) => {
    if (activeFilter === "all") return true;
    return getTags(card).includes(activeFilter);
  };

  const hideAll = () => cards.forEach((c) => c.classList.add("is-hidden"));

  const updateEmpty = (count) => {
    if (!emptyState) return;
    emptyState.hidden = count !== 0;
  };

  const updateLoadMore = (matching) => {
    if (!loadMoreBtn || !loadHint) return;

    const remaining = matching.length - visibleCount;
    if (remaining > 0) {
      loadMoreBtn.style.display = "inline-flex";
      loadHint.textContent = `${remaining} more project${remaining === 1 ? "" : "s"} available`;
    } else {
      loadMoreBtn.style.display = "none";
      loadHint.textContent = matching.length ? "You’ve reached the end." : "";
    }
  };

  const showNext = (matching) => {
    const next = matching.slice(visibleCount, visibleCount + PAGE_SIZE);
    next.forEach((c) => c.classList.remove("is-hidden"));
    visibleCount += next.length;
    updateEmpty(matching.length);
    updateLoadMore(matching);
  };

  const applyFilter = (filter) => {
    activeFilter = filter;
    visibleCount = 0;

    filterButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });

    hideAll();
    const matching = cards.filter(matchesFilter);
    showNext(matching);
  };

  // init
  hideAll();
  applyFilter("all");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      const matching = cards.filter(matchesFilter);
      showNext(matching);
    });
  }

  // ---------------------------
  // Lightbox Zoom (image click)
  // ---------------------------
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Zoomed project image";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImg.removeAttribute("src");
  };

  // Click any project image to zoom
  grid.addEventListener("click", (e) => {
    const img = e.target.closest("img.zoomable");
    if (!img) return;
    openLightbox(img.src, img.alt);
  });

  // Close on backdrop / close button
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      const shouldClose =
        e.target?.dataset?.close === "true" ||
        e.target.closest("[data-close='true']");
      if (shouldClose) closeLightbox();
    });
  }

  // Close with ESC
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      lightbox &&
      lightbox.classList.contains("is-open")
    ) {
      closeLightbox();
    }
  });
})();

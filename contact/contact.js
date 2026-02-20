// =====================================
// contact.js (SAFE Formspree)
// - DOES NOT block submission
// - Adds loading state while sending
// - Copy email + toast
// - Mobile nav close
// =====================================

(() => {
  // Auto-close mobile nav after clicking a link
  const navToggle = document.getElementById("nav-toggle");
  document.querySelectorAll(".navbar a").forEach((a) => {
    a.addEventListener("click", () => {
      if (navToggle && navToggle.checked) navToggle.checked = false;
    });
  });

  // Toast
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  const showToast = (msg) => {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toast.hidden = true), 2200);
  };

  // Copy email
  const emailText = document.getElementById("emailText");
  const copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn && emailText) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailText.textContent.trim());
        showToast("Email copied!");
      } catch {
        showToast("Copy not supported on this device.");
      }
    });
  }

  // Form loading state (DO NOT prevent default submit)
  const form = document.getElementById("contactFormEl");
  const submitBtn = document.getElementById("submitBtn");

  if (form && submitBtn) {
    form.addEventListener("submit", () => {
      // Honeypot block (if filled, do nothing)
      const hp = form.querySelector('input[name="company"]');
      if (hp && hp.value.trim().length) return;

      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      submitBtn.innerHTML = `Sending... <i class="fa-solid fa-spinner"></i>`;
    });
  }
})();

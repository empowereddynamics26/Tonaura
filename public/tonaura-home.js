(function () {
  var nav = document.getElementById("site-nav");
  var burger = document.getElementById("nav-burger");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-solid", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Ambient cycle on 5th phone
  function startAmbientCycle() {
    var phone = document.querySelector("[data-ambient-phone]");
    if (!phone) return;
    var slides = Array.prototype.slice.call(phone.querySelectorAll(".ambient-slides img"));
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 3000);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAmbientCycle);
  } else {
    startAmbientCycle();
  }

  // Scroll reveals
  var nodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (n) { io.observe(n); });
  } else {
    nodes.forEach(function (n) { n.classList.add("is-in"); });
  }

  // Cookie helpers used by footer
  window.openCookiePrefs = function () {
    var el = document.getElementById("cookie-modal-backdrop");
    if (!el) return;
    el.hidden = false;
    var saved = localStorage.getItem("tonaura_cookie_prefs");
    var analytics = true;
    try {
      if (saved) analytics = !!JSON.parse(saved).analytics;
    } catch (e) {}
    var box = document.getElementById("cookie-toggle-analytics");
    if (box) box.checked = analytics;
  };
  window.saveCookiePrefs = function (all) {
    var box = document.getElementById("cookie-toggle-analytics");
    var analytics = all === true ? true : !!(box && box.checked);
    if (all === false) analytics = false;
    localStorage.setItem(
      "tonaura_cookie_prefs",
      JSON.stringify({ essential: true, analytics: analytics, savedAt: Date.now() })
    );
    var el = document.getElementById("cookie-modal-backdrop");
    if (el) el.hidden = true;
  };
})();

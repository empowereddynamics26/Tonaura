(function () {
  function setStatus(status, state, text) {
    if (!status) return;
    status.className = "tonaura-form-status" + (state ? " status-" + state + " is-visible" : "");
    status.textContent = text || "";
  }

  function post(url, payload, form, success) {
    var status = form.querySelector(".tonaura-form-status");
    var btn = form.querySelector('button[type="submit"]');
    setStatus(status, "sending", "Sending…");
    if (btn) btn.classList.add("is-loading");
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (json) {
          if (!res.ok) throw new Error(json.error || "Could not send.");
          setStatus(status, "success", success);
          form.reset();
        });
      })
      .catch(function (err) {
        setStatus(status, "error", err.message || "Could not send.");
      })
      .finally(function () {
        if (btn) btn.classList.remove("is-loading");
      });
  }

  function enhanceWaitlist() {
    var forms = document.querySelectorAll("form.email-form, form#waitlist-form");
    forms.forEach(function (form) {
      if (form.getAttribute("data-tonaura-wired")) return;
      form.setAttribute("data-tonaura-wired", "1");
      form.removeAttribute("onsubmit");
      var input = form.querySelector('input[type="email"]');
      if (input && !input.getAttribute("name")) input.setAttribute("name", "email");
      if (!form.querySelector(".tonaura-form-status")) {
        var p = document.createElement("p");
        p.className = "tonaura-form-status";
        p.style.marginTop = "8px";
        form.appendChild(p);
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (form.querySelector('input[type="email"]') || {}).value || "";
        post("/api/waitlist", { email: email, honey: "", source: "website" }, form, "You’re on the list.");
      });
    });
  }

  function enhanceContact() {
    var form = document.getElementById("contact-form");
    if (!form || form.getAttribute("data-tonaura-wired")) return;
    form.setAttribute("data-tonaura-wired", "1");
    form.removeAttribute("onsubmit");
    if (!form.querySelector(".tonaura-form-status")) {
      var p = document.createElement("p");
      p.className = "tonaura-form-status";
      p.style.marginTop = "12px";
      form.appendChild(p);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      post(
        "/api/contact",
        {
          name: (document.getElementById("contact-name") || {}).value || "",
          email: (document.getElementById("contact-email") || {}).value || "",
          topic: (document.getElementById("contact-topic") || {}).value || "general",
          message: (document.getElementById("contact-message") || {}).value || "",
          _honey: (document.getElementById("_honey") || {}).value || "",
        },
        form,
        "Message sent. We’ll reply by email."
      );
    });
  }

  function addAccountLink() {
    var links = document.querySelector(".nav-links");
    if (!links || links.querySelector("[data-account-link]")) return;
    var a = document.createElement("a");
    a.href = "/account";
    a.textContent = "Account";
    a.setAttribute("data-account-link", "1");
    links.appendChild(a);
  }

  function retargetCtas() {
    document.querySelectorAll(".price-btn, .nav-cta").forEach(function (el) {
      if (el.closest("form") || el.tagName === "A") return;
      el.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "/account";
      });
    });
  }

  // ---------- Modernize: hero headline word reveal ----------
  // Splits page-hero / legal-hero <h1> text into per-word spans so each word
  // animates in on load (CSS handles the actual animation via .word-reveal).
  // Preserves <br> line breaks; these headings are plain text + optional <br>
  // only (no nested links/emphasis), so an innerHTML rebuild is safe here.
  function revealHeroWords() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var headings = document.querySelectorAll(".page-hero h1, .legal-hero h1");
    headings.forEach(function (h1) {
      if (h1.getAttribute("data-split")) return;
      h1.setAttribute("data-split", "1");
      var lines = h1.innerHTML.split(/<br\s*\/?>/i);
      var wordIndex = 0;
      var html = lines
        .map(function (line) {
          var words = line.trim().split(/\s+/).filter(Boolean);
          return words
            .map(function (word) {
              var span =
                '<span class="word-reveal" style="animation-delay:' +
                (wordIndex * 0.06).toFixed(2) +
                's">' +
                word +
                "</span>";
              wordIndex++;
              return span;
            })
            .join(" ");
        })
        .join("<br>");
      h1.innerHTML = html;
    });
  }

  // ---------- Modernize: scroll-triggered reveal ----------
  // Fades/slides content up into place as it enters the viewport.
  function scrollReveal() {
    var targets = document.querySelectorAll(
      ".legal-content section, .support-card, .contact-card, .compare-card, .about-pillars > div, .trust-item"
    );
    if (!targets.length) return;
    var reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("reveal-in");
      });
      return;
    }
    targets.forEach(function (el, i) {
      el.classList.add("reveal-init");
      el.style.transitionDelay = (Math.min(i % 6, 5) * 0.07).toFixed(2) + "s";
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  // ---------- Modernize: "On this page" scroll-spy ----------
  // Highlights the legal-toc link matching whichever numbered clause is
  // currently in view.
  function tocScrollSpy() {
    var toc = document.querySelector(".legal-toc");
    if (!toc) return;
    var links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) sections.push({ link: a, sec: sec });
    });
    if (!sections.length) return;

    var ticking = false;
    function update() {
      ticking = false;
      var pos = window.scrollY + 130;
      var current = sections[0];
      sections.forEach(function (s) {
        if (s.sec.offsetTop <= pos) current = s;
      });
      links.forEach(function (a) {
        a.classList.remove("toc-active");
      });
      current.link.classList.add("toc-active");
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  // ---------- Modernize: mobile nav menu ----------
  // Wires the hamburger button (markup already in the page) to slide the
  // nav-links panel open/closed, with outside-click / Escape / link-click
  // dismissal and basic focus handling.
  function initMobileMenu() {
    var btn = document.querySelector(".nav-hamburger");
    var panel = document.getElementById("nav-links-mobile");
    if (!btn || !panel) return;

    function isOpen() {
      return document.body.classList.contains("menu-open");
    }
    function closeMenu() {
      document.body.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
    }
    function openMenu() {
      document.body.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
    }

    btn.addEventListener("click", function () {
      if (isOpen()) closeMenu();
      else openMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        closeMenu();
        btn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!isOpen()) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      closeMenu();
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720 && isOpen()) closeMenu();
    });
  }

  enhanceWaitlist();
  enhanceContact();
  addAccountLink();
  retargetCtas();
  revealHeroWords();
  scrollReveal();
  tocScrollSpy();
  initMobileMenu();
})();

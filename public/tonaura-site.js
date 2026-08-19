(function () {
  function post(url, payload, form, success) {
    var status = form.querySelector(".tonaura-form-status");
    if (status) status.textContent = "Sending…";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (json) {
          if (!res.ok) throw new Error(json.error || "Could not send.");
          if (status) status.textContent = success;
          form.reset();
        });
      })
      .catch(function (err) {
        if (status) status.textContent = err.message || "Could not send.";
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

  enhanceWaitlist();
  enhanceContact();
  addAccountLink();
  retargetCtas();
})();

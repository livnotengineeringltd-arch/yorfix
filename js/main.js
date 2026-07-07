// ============================================================
// YorFix page behaviour: hero slider, mobile nav, reviews
// carousel, FAQ accordion, and the two forms.
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  // ---------- Sticky header shadow ----------
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", function () {
    const open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { mainNav.classList.remove("open"); });
  });

  // ---------- Hero slider: crossfade every 5 seconds ----------
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dotsWrap = document.getElementById("heroDots");
  let heroIndex = 0;
  let heroTimer = null;

  slides.forEach(function (_, i) {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Show image " + (i + 1));
    if (i === 0) b.classList.add("active");
    b.addEventListener("click", function () { goHero(i); restartHeroTimer(); });
    dotsWrap.appendChild(b);
  });
  const heroDots = Array.from(dotsWrap.children);

  function goHero(i) {
    slides[heroIndex].classList.remove("active");
    heroDots[heroIndex].classList.remove("active");
    heroIndex = i;
    slides[heroIndex].classList.add("active");
    heroDots[heroIndex].classList.add("active");
  }
  function nextHero() { goHero((heroIndex + 1) % slides.length); }
  function restartHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(nextHero, 5000);
  }
  restartHeroTimer();

  // ---------- Reviews carousel ----------
  const track = document.getElementById("reviewTrack");
  const cards = track.children.length;
  const revDotsWrap = document.getElementById("revDots");
  let revIndex = 0;
  let revTimer = null;

  for (let i = 0; i < cards; i++) {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Show review " + (i + 1));
    if (i === 0) b.classList.add("active");
    b.addEventListener("click", function () { goReview(i); restartRevTimer(); });
    revDotsWrap.appendChild(b);
  }
  const revDots = Array.from(revDotsWrap.children);

  function goReview(i) {
    revIndex = (i + cards) % cards;
    track.style.transform = "translateX(-" + (revIndex * 100) + "%)";
    revDots.forEach(function (d, j) { d.classList.toggle("active", j === revIndex); });
  }
  function restartRevTimer() {
    clearInterval(revTimer);
    revTimer = setInterval(function () { goReview(revIndex + 1); }, 6000);
  }
  document.getElementById("revPrev").addEventListener("click", function () { goReview(revIndex - 1); restartRevTimer(); });
  document.getElementById("revNext").addEventListener("click", function () { goReview(revIndex + 1); restartRevTimer(); });
  document.getElementById("reviewCarousel").addEventListener("mouseenter", function () { clearInterval(revTimer); });
  document.getElementById("reviewCarousel").addEventListener("mouseleave", restartRevTimer);
  restartRevTimer();

  // ---------- FAQ accordion ----------
  document.querySelectorAll(".faq-item").forEach(function (item) {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  // ---------- Service card Book buttons pre-select the service ----------
  const serviceSelect = document.getElementById("bkService");
  document.querySelectorAll(".book-service").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectService(btn.dataset.service);
      document.getElementById("book").scrollIntoView({ behavior: "smooth" });
    });
  });
  function selectService(name) {
    // Match ignoring the difference between & and &amp; renderings.
    Array.from(serviceSelect.options).forEach(function (opt) {
      if (opt.text.replace(/\s+/g, " ").trim() === name.replace(/\s+/g, " ").trim()) {
        serviceSelect.value = opt.value || opt.text;
        opt.selected = true;
      }
    });
  }
  // Support ?service=Plumbing links from ads and the flyer QR code.
  const params = new URLSearchParams(window.location.search);
  if (params.get("service")) selectService(params.get("service"));

  // ---------- Booking form ----------
  const bkDate = document.getElementById("bkDate");
  bkDate.min = new Date().toISOString().split("T")[0];

  const bookingForm = document.getElementById("bookingForm");
  const bookingMsg = document.getElementById("bookingMsg");
  const bookingSubmit = document.getElementById("bookingSubmit");

  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    bookingMsg.className = "form-msg";

    // Honeypot: real people never fill this hidden field.
    if (document.getElementById("bkCompany").value) return;

    const data = {
      service: document.getElementById("bkService").value,
      area: document.getElementById("bkArea").value,
      preferred_date: bkDate.value,
      preferred_time: document.getElementById("bkTime").value,
      name: document.getElementById("bkName").value.trim(),
      phone: document.getElementById("bkPhone").value.trim(),
      email: document.getElementById("bkEmail").value.trim(),
      description: document.getElementById("bkDesc").value.trim(),
      client_type: bookingForm.querySelector("input[name=client_type]:checked").value,
      reference: YorFixAPI.makeReference()
    };

    if (!data.service || !data.area || !data.name || !data.phone) {
      bookingMsg.textContent = "Please fill in the service, area, your name and a phone number.";
      bookingMsg.classList.add("error");
      return;
    }

    bookingSubmit.disabled = true;
    bookingSubmit.textContent = "Sending...";
    const result = await YorFixAPI.createBooking(data);
    bookingSubmit.disabled = false;
    bookingSubmit.textContent = "Request my booking";

    if (result.ok) {
      bookingForm.style.display = "none";
      document.getElementById("confirmName").textContent = data.name;
      document.getElementById("confirmRef").textContent = "Reference: " + data.reference;
      document.getElementById("bookingConfirm").style.display = "block";
    } else {
      bookingMsg.textContent = "Sorry, something went wrong sending your booking. Please call us on " + YORFIX_CONFIG.PHONE_DISPLAY + " and we will sort it straight away.";
      bookingMsg.classList.add("error");
    }
  });

  document.getElementById("bookAnother").addEventListener("click", function () {
    bookingForm.reset();
    bookingForm.style.display = "block";
    document.getElementById("bookingConfirm").style.display = "none";
  });

  // ---------- Contact form ----------
  const contactForm = document.getElementById("contactForm");
  const contactMsg = document.getElementById("contactMsg");
  const contactSubmit = document.getElementById("contactSubmit");

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    contactMsg.className = "form-msg";
    if (document.getElementById("ctCompany").value) return;

    const data = {
      name: document.getElementById("ctName").value.trim(),
      contact: document.getElementById("ctContact").value.trim(),
      message: document.getElementById("ctMessage").value.trim()
    };
    if (!data.name || !data.contact || !data.message) {
      contactMsg.textContent = "Please fill in your name, a way to reach you, and a message.";
      contactMsg.classList.add("error");
      return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = "Sending...";
    const result = await YorFixAPI.createMessage(data);
    contactSubmit.disabled = false;
    contactSubmit.textContent = "Send message";

    if (result.ok) {
      contactForm.reset();
      contactMsg.textContent = "Message sent! We aim to reply within one working hour.";
      contactMsg.classList.add("ok");
    } else {
      contactMsg.textContent = "Sorry, that did not send. Please call or WhatsApp us instead.";
      contactMsg.classList.add("error");
    }
  });

});

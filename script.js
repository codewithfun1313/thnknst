(function () {
  "use strict";

  const body = document.body;
  const root = document.documentElement;
  const header = document.getElementById("siteHeader");
  const backTop = document.getElementById("backTop");
  const menuToggle = document.getElementById("menuToggle");
  const drawer = document.getElementById("mobileDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerClose = document.getElementById("drawerClose");
  const searchPopup = document.getElementById("searchPopup");
  const searchClose = document.getElementById("searchClose");
  const searchTriggers = document.querySelectorAll(".search-open");
  const searchInput = searchPopup ? searchPopup.querySelector("input[type='search']") : null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let lastFocusedElement = null;
  let lockedScrollY = 0;

  if (drawer && !drawer.classList.contains("open")) drawer.inert = true;

  function lockScroll() {
    if (body.dataset.scrollLocked === "true") return;
    lockedScrollY = window.scrollY;
    body.dataset.scrollLocked = "true";
    body.style.position = "fixed";
    body.style.top = "-" + lockedScrollY + "px";
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  }

  function unlockScroll() {
    if (body.dataset.scrollLocked !== "true") return;
    body.dataset.scrollLocked = "false";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    window.scrollTo(0, lockedScrollY);
  }

  function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    closeSearch(false);
    lastFocusedElement = document.activeElement;
    drawer.inert = false;
    drawer.classList.add("open");
    drawerBackdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    lockScroll();
    if (drawerClose) drawerClose.focus({ preventScroll: true });
  }

  function closeDrawer(restoreFocus) {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.remove("open");
    drawerBackdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    unlockScroll();
    if (restoreFocus !== false && lastFocusedElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function openSearch(trigger) {
    if (!searchPopup) return;
    closeDrawer(false);
    lastFocusedElement = trigger || document.activeElement;
    searchPopup.classList.add("open");
    searchPopup.setAttribute("aria-hidden", "false");
    lockScroll();
    window.setTimeout(function () {
      if (searchInput) searchInput.focus({ preventScroll: true });
    }, 80);
  }

  function closeSearch(restoreFocus) {
    if (!searchPopup || !searchPopup.classList.contains("open")) return;
    searchPopup.classList.remove("open");
    searchPopup.setAttribute("aria-hidden", "true");
    unlockScroll();
    if (restoreFocus !== false && lastFocusedElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  let ticking = false;

  function updateScrollState() {
    const scrollY = window.scrollY;
    if (header) header.classList.toggle("scrolled", scrollY > 30);
    if (backTop) backTop.classList.toggle("show", scrollY > 600);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollState);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", updateScrollState);
  updateScrollState();

  const hero = document.querySelector(".training-hero");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".training-hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".training-hero-dot"));
    const previousButton = hero.querySelector("[data-hero-previous]");
    const nextButton = hero.querySelector("[data-hero-next]");
    let activeSlide = 0;
    let slideTimer = 0;

    function showHeroSlide(index) {
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        const isActive = dotIndex === activeSlide;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-pressed", String(isActive));
      });
    }

    function stopHeroAutoplay() {
      window.clearInterval(slideTimer);
      slideTimer = 0;
    }

    function startHeroAutoplay() {
      stopHeroAutoplay();
      if (prefersReducedMotion || document.hidden || slides.length < 2) return;
      slideTimer = window.setInterval(function () {
        showHeroSlide(activeSlide + 1);
      }, 5000);
    }

    if (slides.length > 1 && dots.length === slides.length) {
      if (previousButton) {
        previousButton.addEventListener("click", function () {
          showHeroSlide(activeSlide - 1);
          startHeroAutoplay();
        });
      }
      if (nextButton) {
        nextButton.addEventListener("click", function () {
          showHeroSlide(activeSlide + 1);
          startHeroAutoplay();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showHeroSlide(index);
          startHeroAutoplay();
        });
      });
      hero.addEventListener("pointerenter", stopHeroAutoplay);
      hero.addEventListener("pointerleave", startHeroAutoplay);
      hero.addEventListener("focusin", stopHeroAutoplay);
      hero.addEventListener("focusout", function (event) {
        if (!hero.contains(event.relatedTarget)) startHeroAutoplay();
      });
      let touchStartX = 0;
      let touchStartY = 0;
      hero.addEventListener("touchstart", function (e) {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        stopHeroAutoplay();
      }, { passive: true });
      hero.addEventListener("touchend", function (e) {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            showHeroSlide(activeSlide + 1);
          } else {
            showHeroSlide(activeSlide - 1);
          }
        }
        startHeroAutoplay();
      }, { passive: true });

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopHeroAutoplay();
        else startHeroAutoplay();
      });
      startHeroAutoplay();
    }
  }

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", function () { closeDrawer(true); });
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", function () { closeDrawer(true); });
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeDrawer(false); });
    });
  }

  searchTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () { openSearch(trigger); });
  });

  if (searchClose) searchClose.addEventListener("click", function () { closeSearch(true); });
  if (searchPopup) {
    searchPopup.addEventListener("click", function (event) {
      if (event.target === searchPopup) closeSearch(true);
    });
    const searchForm = searchPopup.querySelector(".search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        filterTrainingCourses(searchInput ? searchInput.value : "");
        closeSearch(false);
        const courses = document.getElementById("courses");
        if (courses) courses.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      });
    }
  }

  function filterTrainingCourses(query) {
    const cards = Array.from(document.querySelectorAll(".training-course-card"));
    const normalizedQuery = query.trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach(function (card) {
      const searchableText = (card.dataset.courseSearch || card.textContent).toLowerCase();
      const matches = !normalizedQuery || searchableText.includes(normalizedQuery);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    const emptyMessage = document.getElementById("courseSearchEmpty");
    if (emptyMessage) emptyMessage.classList.toggle("show", cards.length > 0 && visibleCount === 0);
  }

  document.querySelectorAll("[data-course-select]").forEach(function (link) {
    link.addEventListener("click", function () {
      const selectedCourse = link.dataset.courseSelect;
      const courseSelects = document.querySelectorAll("#heroProgram, #contactForm select[name='program']");
      courseSelects.forEach(function (select) {
        if (Array.from(select.options).some(function (option) { return option.value === selectedCourse; })) {
          select.value = selectedCourse;
        }
      });
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (searchPopup && searchPopup.classList.contains("open")) {
      closeSearch(true);
      return;
    }
    if (drawer && drawer.classList.contains("open")) closeDrawer(true);
  });

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  const accordion = document.getElementById("faqAccordion");
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll(".accordion-item"));
    items.forEach(function (item) {
      const trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;
      trigger.setAttribute("aria-expanded", item.classList.contains("active") ? "true" : "false");
      trigger.addEventListener("click", function () {
        const willOpen = !item.classList.contains("active");
        items.forEach(function (other) {
          other.classList.remove("active");
          const otherTrigger = other.querySelector(".accordion-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        });
        if (willOpen) {
          item.classList.add("active");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  const counters = document.querySelectorAll(".counter[data-counter]");
  function runCounter(element) {
    if (element.dataset.counted === "true") return;
    element.dataset.counted = "true";
    const target = Number(element.dataset.counter) || 0;
    if (prefersReducedMotion) {
      element.textContent = String(target);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    counters.forEach(function (counter) { counterObserver.observe(counter); });

    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealElements.forEach(function (element) { revealObserver.observe(element); });
  } else {
    counters.forEach(runCounter);
    document.querySelectorAll(".reveal").forEach(function (element) {
      element.classList.add("in-view");
    });
  }

  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const submitButton = contactForm.querySelector("button[type='submit']");
      if (submitButton) submitButton.disabled = true;
      if (formSuccess) formSuccess.classList.add("show");
      contactForm.reset();
      window.setTimeout(function () {
        if (formSuccess) formSuccess.classList.remove("show");
        if (submitButton) submitButton.disabled = false;
      }, 5000);
    });
  }

  const heroEnquiryForm = document.getElementById("heroEnquiryForm");
  const heroEnquirySuccess = document.getElementById("heroEnquirySuccess");
  if (heroEnquiryForm) {
    heroEnquiryForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const submitButton = heroEnquiryForm.querySelector("button[type='submit']");
      if (submitButton) submitButton.disabled = true;
      if (heroEnquirySuccess) heroEnquirySuccess.classList.add("show");
      heroEnquiryForm.reset();
      window.setTimeout(function () {
        if (heroEnquirySuccess) heroEnquirySuccess.classList.remove("show");
        if (submitButton) submitButton.disabled = false;
      }, 5000);
    });
  }

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const button = newsletterForm.querySelector("button");
      if (button) {
        const icon = button.querySelector("i");
        const originalClass = icon ? icon.className : "";
        if (icon) icon.className = "fa-solid fa-check";
        button.setAttribute("aria-label", "Subscribed");
        window.setTimeout(function () {
          if (icon) icon.className = originalClass;
          button.setAttribute("aria-label", "Subscribe");
        }, 2600);
      }
      newsletterForm.reset();
    });
  }

  const quickContact = document.createElement("div");
  const isThinkNextHome = body.classList.contains("thinknext-home");
  quickContact.className = "quick-contact";
  quickContact.setAttribute("aria-label", "Quick contact");
  quickContact.innerHTML = isThinkNextHome
    ? '<a class="quick-contact-btn quick-contact-wa" href="https://wa.me/917837401000?text=Hello%20ThinkNEXT%2C%20I%20would%20like%20to%20know%20more%20about%20your%20training%20programs." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ThinkNEXT"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>WhatsApp</span></a>' +
      '<a class="quick-contact-btn quick-contact-call" href="tel:+917837401000" aria-label="Call ThinkNEXT"><i class="fa-solid fa-phone-volume" aria-hidden="true"></i><span>Call Now</span></a>'
    : '<a class="quiz-fab" id="quizFab" href="quiz.html" aria-label="Quiz"><i class="fa-solid fa-clipboard-list"></i><span>Quiz</span></a>' +
      '<a class="quick-contact-btn quick-contact-wa" href="https://wa.me/918872401632?text=Hello%20Healmedetox%2C%20I%20would%20like%20to%20know%20more%20about%20your%20nutrition%20programs." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>WhatsApp</span></a>' +
      '<a class="quick-contact-btn quick-contact-call" href="tel:+918872401632" aria-label="Call"><i class="fa-solid fa-phone-volume" aria-hidden="true"></i><span>Call Now</span></a>';
  body.appendChild(quickContact);

  window.togglePrintDrawer = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const drawer = document.getElementById("media-print-archive");
    const btn = document.getElementById("togglePrintMediaBtn");
    if (!drawer) return;
    const isOpen = drawer.classList.toggle("is-open");
    if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    const label = drawer.querySelector(".drawer-toggle-label");
    if (label) label.textContent = isOpen ? "Hide Clippings" : "View Clippings";
    if (isOpen) {
      drawer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

    // Mega Dropdown Program Search Filter
  const megaSearchInputs = document.querySelectorAll(".mega-search-input");
  megaSearchInputs.forEach(input => {
    input.addEventListener("input", function () {
      const q = this.value.toLowerCase().trim();
      const megaDropdown = this.closest(".mega-dropdown-container");
      if (!megaDropdown) return;
      const items = megaDropdown.querySelectorAll(".mega-faculty-item");
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Mega Dropdown Category Filter in Programs
  const progFilterBtn = document.getElementById("progFilterBtn");
  const progFilterMenu = document.getElementById("progFilterMenu");
  const progCategoryDropdown = document.getElementById("programsCategoryDropdown");

  if (progFilterBtn && progFilterMenu) {
    progFilterBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = progCategoryDropdown.classList.toggle("open");
      progFilterBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    const progFilterOpts = progFilterMenu.querySelectorAll(".mega-filter-opt");
    progFilterOpts.forEach(opt => {
      opt.addEventListener("click", function (e) {
        e.stopPropagation();
        const filter = this.getAttribute("data-filter");
        progFilterOpts.forEach(o => o.classList.remove("active"));
        this.classList.add("active");

        const label = progFilterBtn.querySelector(".mega-filter-label");
        if (label) label.textContent = this.textContent.split("(")[0].trim();

        const rightCol = this.closest(".mega-right-col");
        const subcols = rightCol ? rightCol.querySelectorAll(".mega-faculty-subcol") : document.querySelectorAll(".mega-faculty-subcol[data-category]");

        subcols.forEach(col => {
          const cat = col.getAttribute("data-category");
          if (filter === "all" || cat === filter) {
            col.classList.remove("dimmed");
            col.classList.add("highlighted");
            col.style.display = "";
          } else {
            col.classList.add("dimmed");
            col.classList.remove("highlighted");
          }
        });

        progCategoryDropdown.classList.remove("open");
        progFilterBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Mega Dropdown Nav Item Click-to-lock support
  const megaNavLinks = document.querySelectorAll(".nav-item.mega-item > .nav-link");
  megaNavLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      const item = this.closest(".mega-item");
      if (!item) return;
      if (window.innerWidth > 991) {
        e.preventDefault();
        const wasOpen = item.classList.contains("mega-open");
        document.querySelectorAll(".nav-item.mega-item.mega-open").forEach(el => el.classList.remove("mega-open"));
        if (!wasOpen) {
          item.classList.add("mega-open");
        }
      }
    });
  });

  // Close open mega dropdowns or filters when clicking outside or pressing Escape
  document.addEventListener("click", function (e) {
    if (progCategoryDropdown && !e.target.closest("#programsCategoryDropdown")) {
      progCategoryDropdown.classList.remove("open");
      if (progFilterBtn) progFilterBtn.setAttribute("aria-expanded", "false");
    }
    if (!e.target.closest(".mega-item")) {
      document.querySelectorAll(".nav-item.mega-item.mega-open").forEach(el => el.classList.remove("mega-open"));
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (progCategoryDropdown) progCategoryDropdown.classList.remove("open");
      document.querySelectorAll(".nav-item.mega-item.mega-open").forEach(el => el.classList.remove("mega-open"));
    }
  });

  // ==========================================================================
  // ThinkNEXT Video Spotlight Lightbox Modal
  // ==========================================================================
  const vspotModal = document.getElementById("vspotModal");
  const vspotModalBackdrop = document.getElementById("vspotModalBackdrop");
  const vspotModalClose = document.getElementById("vspotModalClose");
  const vspotModalIframe = document.getElementById("vspotModalIframe");
  const vspotModalTitle = document.getElementById("vspotModalTitle");
  const vspotCards = document.querySelectorAll(".vspot-card");

  function openVspotModal(videoId, title) {
    if (!vspotModal || !vspotModalIframe) return;
    if (vspotModalTitle) vspotModalTitle.textContent = title || "ThinkNEXT Video";
    vspotModalIframe.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0&modestbranding=1";
    vspotModal.classList.add("is-open");
    vspotModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeVspotModal() {
    if (!vspotModal || !vspotModalIframe) return;
    vspotModal.classList.remove("is-open");
    vspotModal.setAttribute("aria-hidden", "true");
    vspotModalIframe.src = "";
    document.body.style.overflow = "";
  }

  if (vspotCards.length) {
    vspotCards.forEach(function (card) {
      const videoId = card.getAttribute("data-video-id");
      const videoTitle = card.getAttribute("data-video-title");
      if (!videoId) return;

      const thumb = card.querySelector(".vspot-thumb-wrap");
      if (thumb) {
        thumb.addEventListener("click", function (e) {
          e.preventDefault();
          openVspotModal(videoId, videoTitle);
        });
      }

      const triggers = card.querySelectorAll(".vspot-title-link, .vspot-action-btn");
      triggers.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          openVspotModal(videoId, videoTitle);
        });
      });
    });
  }

  if (vspotModalClose) {
    vspotModalClose.addEventListener("click", closeVspotModal);
  }

  if (vspotModalBackdrop) {
    vspotModalBackdrop.addEventListener("click", closeVspotModal);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && vspotModal && vspotModal.classList.contains("is-open")) {
      closeVspotModal();
    }
  });

    const tourModalBtn = document.getElementById("openTourModalBtn");
  if (tourModalBtn) {
    tourModalBtn.addEventListener("click", function () {
      openVspotModal("rXqldaGFudw", "Visual Tour of ThinkNEXT 6-Floor Setup");
    });
  }

  // ==========================================================================
  // Footer Corporate Office Map Navigation & Hover Interaction
  // ==========================================================================
  const footerAddressBox = document.getElementById("footer-address-box");
  const footerCampusMap = document.getElementById("footer-campus-map");
  const hoverMapQuickJump = document.querySelector(".hover-map-quick-jump");
  const corporateHoverMap = document.getElementById("corporate-office-hover-map");

  function scrollToCampusMap(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!footerCampusMap) return;
    footerCampusMap.scrollIntoView({ behavior: "smooth", block: "center" });
    footerCampusMap.classList.add("map-highlight-pulse");
    setTimeout(function () {
      footerCampusMap.classList.remove("map-highlight-pulse");
    }, 2200);
  }

  if (footerAddressBox && footerCampusMap) {
    footerAddressBox.addEventListener("click", function (e) {
      if (e.target.closest(".hover-map-floating-badge a") || e.target.closest("iframe")) return;
      scrollToCampusMap(e);
    });

    footerAddressBox.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        scrollToCampusMap(e);
      }
    });

    // Touch device support: tap to reveal
    footerAddressBox.addEventListener("touchstart", function () {
      if (corporateHoverMap) {
        corporateHoverMap.classList.toggle("is-visible");
      }
    }, { passive: true });
  }

  if (hoverMapQuickJump) {
    hoverMapQuickJump.addEventListener("click", function (e) {
      scrollToCampusMap(e);
    });
  }

  // ==========================================================================
  // ThinkNEXT Edge & Why ThinkNEXT - Show More / Show Less Toggle
  // ==========================================================================
  const advMoreBtns = document.querySelectorAll(".btn-adv-more");

  advMoreBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const col = this.closest(".adv-col");
      if (!col) return;

      const isExpanded = col.classList.toggle("is-expanded");
      this.setAttribute("aria-expanded", isExpanded ? "true" : "false");

      const moreText = this.querySelector(".more-text");
      const moreIcon = this.querySelector(".more-icon i");
      const defaultText = this.getAttribute("data-more-text") || "View More";
      const lessText = this.getAttribute("data-less-text") || "Show Less";

      if (isExpanded) {
        if (moreText) moreText.textContent = lessText;
        if (moreIcon) {
          moreIcon.classList.remove("fa-chevron-down");
          moreIcon.classList.add("fa-chevron-up");
        }
      } else {
        if (moreText) moreText.textContent = defaultText;
        if (moreIcon) {
          moreIcon.classList.remove("fa-chevron-up");
          moreIcon.classList.add("fa-chevron-down");
        }
        const colRect = col.getBoundingClientRect();
        if (colRect.top < 80) {
          col.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  /* ==========================================================================
     ThinkNEXT Interactive Admissions Chatbot
     ========================================================================== */
  function initThinkNextChatbot() {
    const launcher = document.getElementById("tnChatLauncher");
    const modal = document.getElementById("tnChatModal");
    const closeBtn = document.getElementById("tnChatClose");
    const resetBtn = document.getElementById("tnChatReset");
    const promptBubble = document.getElementById("tnChatPrompt");
    const promptDismiss = document.getElementById("tnPromptDismiss");
    const messagesContainer = document.getElementById("tnChatMessages");
    const quickActionsContainer = document.getElementById("tnChatQuickActions");
    const chatForm = document.getElementById("tnChatForm");
    const chatInput = document.getElementById("tnChatInput");
    const badge = document.querySelector(".tn-chat-launcher-badge");

    if (!launcher || !modal || !messagesContainer) return;

    let isOpen = false;
    let hasInteracted = false;

    // Prompt bubble removed per user request

    function toggleChat(open) {
      isOpen = typeof open === "boolean" ? open : !isOpen;
      modal.classList.toggle("is-active", isOpen);
      launcher.classList.toggle("is-active", isOpen);
      launcher.setAttribute("aria-expanded", isOpen ? "true" : "false");
      modal.setAttribute("aria-hidden", isOpen ? "false" : "true");

      if (isOpen) {
        hasInteracted = true;
        if (promptBubble) promptBubble.classList.remove("is-visible");
        if (badge) badge.style.display = "none";
        if (window.innerWidth > 768) {
          setTimeout(function () {
            if (chatInput) chatInput.focus();
          }, 150);
        }
        if (messagesContainer.children.length === 0) {
          sendBotGreeting();
        }
      }
    }

    launcher.addEventListener("click", function () {
      toggleChat();
    });

    if (promptBubble) {
      promptBubble.addEventListener("click", function () {
        toggleChat(true);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        toggleChat(false);
      });
    }

    function appendMessage(text, sender, actions) {
      sender = sender || "bot";
      const msgDiv = document.createElement("div");
      msgDiv.className = "tn-msg tn-msg-" + sender;

      const bubble = document.createElement("div");
      bubble.className = "tn-bubble";
      bubble.innerHTML = text;
      msgDiv.appendChild(bubble);

      const time = document.createElement("span");
      time.className = "tn-msg-time";
      const now = new Date();
      time.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      msgDiv.appendChild(time);

      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      if (actions && Array.isArray(actions) && actions.length > 0) {
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "tn-msg-actions";
        actions.forEach(function (act) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "tn-action-chip";
          btn.innerHTML = act.label;
          btn.addEventListener("click", function () {
            if (act.intent) {
              handleIntent(act.intent, act.label);
            }
          });
          actionsDiv.appendChild(btn);
        });
        messagesContainer.appendChild(actionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    function showTypingIndicator(callback, delay) {
      delay = delay || 500;
      const typingDiv = document.createElement("div");
      typingDiv.className = "tn-msg tn-msg-bot tn-typing";
      typingDiv.innerHTML = '<div class="tn-bubble"><span class="tn-dot"></span><span class="tn-dot"></span><span class="tn-dot"></span></div>';
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      setTimeout(function () {
        typingDiv.remove();
        if (callback) callback();
      }, delay);
    }

    function sendBotGreeting() {
      showTypingIndicator(function () {
        appendMessage(
          "👋 <strong>Namaste & Welcome to ThinkNEXT Technologies!</strong><br>8 Times National Award Winner & Govt. Approved Industrial Training Leader.",
          "bot"
        );
        setTimeout(function () {
          showTypingIndicator(function () {
            appendMessage(
              "How can we help you today? Please choose an option below or type your question:",
              "bot",
              [
                { label: "💻 Popular Courses", intent: "courses" },
                { label: "🎓 Book Free Demo", intent: "demo" },
                { label: "💰 Stipend Training", intent: "stipend" },
                { label: "💼 100% Placement", intent: "placement" },
                { label: "📞 Direct Helpline", intent: "callback" }
              ]
            );
          }, 400);
        }, 200);
      }, 350);
    }

    function handleIntent(intent, userLabel) {
      if (userLabel) {
        appendMessage(userLabel, "user");
      }

      showTypingIndicator(function () {
        switch (intent) {
          case "courses":
            appendMessage(
              "🎓 <strong>Top 6 Months / 6 Weeks Industrial Training Programs:</strong><br>" +
              "• <strong>Python, AI &amp; Machine Learning / Data Science</strong><br>" +
              "• <strong>Full Stack Web Dev (MERN, React, Java, PHP)</strong><br>" +
              "• <strong>Digital Marketing &amp; SEO Pro</strong><br>" +
              "• <strong>CAD / CAM (AutoCAD, SolidWorks, CATIA, Revit)</strong><br>" +
              "• <strong>Embedded Systems, IoT &amp; Robotics</strong><br><br>" +
              "Includes live project training, certification &amp; free Spoken English / PD classes!",
              "bot",
              [
                { label: "📝 Register for Demo", intent: "demo" },
                { label: "💬 Chat on WhatsApp", intent: "whatsapp" },
                { label: "📞 Call Admissions", intent: "call" }
              ]
            );
            break;

          case "demo":
            appendMessage(
              "🎯 <strong>Register for Free Demo Class:</strong><br>" +
              "Experience our 6-floor smart campus, 15+ advanced labs, and interact directly with senior industry mentors.<br><br>" +
              "<a href='#contact' class='tn-chat-link-btn' onclick='var c=document.getElementById(\"tnChatClose\");if(c)c.click();'><i class='fa-solid fa-calendar-check'></i> Open Free Demo Registration</a>",
              "bot",
              [
                { label: "📞 Call Helpline", intent: "call" },
                { label: "🔙 Back to Menu", intent: "menu" }
              ]
            );
            break;

          case "stipend":
            appendMessage(
              "💰 <strong>Stipend Based &amp; Free Industrial Training:</strong><br>" +
              "• ThinkNEXT offers merit-based stipend training for B.Tech, MCA, BCA, Diploma and Polytechnic students.<br>" +
              "• Clear our scholarship / technical interview to get up to 100% fee waiver &amp; monthly stipend during your live project!",
              "bot",
              [
                { label: "📋 Apply for Stipend", intent: "demo" },
                { label: "💬 Check Eligibility on WhatsApp", intent: "whatsapp" }
              ]
            );
            break;

          case "placement":
            appendMessage(
              "💼 <strong>100% Placement Assistance:</strong><br>" +
              "• <strong>700+ hiring partner companies</strong> actively recruit our students.<br>" +
              "• Daily free personality development (PD), resume building, and mock technical interviews until you get placed!",
              "bot",
              [
                { label: "🌟 Explore Placements", intent: "courses" },
                { label: "💬 WhatsApp Placement Team", intent: "whatsapp" }
              ]
            );
            break;

          case "callback":
            appendMessage(
              "📞 <strong>Direct Helpline &amp; Admissions:</strong><br>" +
              "• Call: <a href='tel:+917837401000' style='color:#38bdf8;font-weight:700;'>+91 78374-01000</a><br>" +
              "• WhatsApp: <a href='https://wa.me/917009379585?text=Hi%20ThinkNEXT' target='_blank' style='color:#25d366;font-weight:700;'>+91 70093-79585</a><br>" +
              "• Campus: ThinkNEXT Technologies, SCF 113, Sector 65, Mohali (Chandigarh).",
              "bot",
              [
                { label: "💬 Open WhatsApp", intent: "whatsapp" },
                { label: "🔙 Main Menu", intent: "menu" }
              ]
            );
            break;

          case "whatsapp":
            appendMessage("Redirecting to ThinkNEXT Official WhatsApp...", "bot");
            window.open("https://wa.me/917837401000?text=Hello%20ThinkNEXT%2C%20I%20am%20interested%20in%20Industrial%20Training.%20Please%20share%20details.", "_blank", "noopener,noreferrer");
            break;

          case "call":
            window.location.href = "tel:+917837401000";
            break;

          case "menu":
            appendMessage(
              "What would you like to know more about?",
              "bot",
              [
                { label: "💻 Popular Courses", intent: "courses" },
                { label: "🎓 Book Free Demo", intent: "demo" },
                { label: "💰 Stipend Training", intent: "stipend" },
                { label: "💼 100% Placement", intent: "placement" },
                { label: "📞 Direct Helpline", intent: "callback" }
              ]
            );
            break;

          default:
            appendMessage(
              "Thank you for contacting ThinkNEXT! Our admissions counselors are available right now to guide you with batch timings, fee structures, and course syllabus.",
              "bot",
              [
                { label: "💻 Explore Courses", intent: "courses" },
                { label: "🎓 Book Free Demo", intent: "demo" },
                { label: "💬 Chat on WhatsApp", intent: "whatsapp" }
              ]
            );
            break;
        }
      }, 450);
    }

    if (quickActionsContainer) {
      quickActionsContainer.addEventListener("click", function (e) {
        const btn = e.target.closest(".tn-quick-btn");
        if (!btn) return;
        const intent = btn.getAttribute("data-intent");
        const label = btn.textContent.trim();
        handleIntent(intent, label);
      });
    }

    if (chatForm && chatInput) {
      chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        appendMessage(text, "user");
        chatInput.value = "";

        const lower = text.toLowerCase();
        let intent = "default";
        if (lower.includes("course") || lower.includes("python") || lower.includes("java") || lower.includes("web") || lower.includes("data") || lower.includes("marketing") || lower.includes("cad") || lower.includes("ai") || lower.includes("mern") || lower.includes("react")) {
          intent = "courses";
        } else if (lower.includes("demo") || lower.includes("free class") || lower.includes("trial") || lower.includes("register") || lower.includes("seat")) {
          intent = "demo";
        } else if (lower.includes("stipend") || lower.includes("free training") || lower.includes("scholarship") || lower.includes("fees") || lower.includes("fee") || lower.includes("cost")) {
          intent = "stipend";
        } else if (lower.includes("placement") || lower.includes("job") || lower.includes("salary") || lower.includes("package") || lower.includes("company") || lower.includes("companies")) {
          intent = "placement";
        } else if (lower.includes("whatsapp") || lower.includes("chat") || lower.includes("wa")) {
          intent = "whatsapp";
        } else if (lower.includes("call") || lower.includes("phone") || lower.includes("contact") || lower.includes("helpline") || lower.includes("address") || lower.includes("location") || lower.includes("mohali") || lower.includes("chandigarh")) {
          intent = "callback";
        }

        handleIntent(intent, null);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        messagesContainer.innerHTML = "";
        sendBotGreeting();
      });
    }
  }

  initThinkNextChatbot();

  root.classList.add("ready");
})();

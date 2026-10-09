/* The Human System — native scroll + GSAP / ScrollTrigger scene choreography.
 * Two short desktop pins. Mobile uses continuous scrubs without pinning.
 * No wheel interception, smooth-scroll proxy, WebGL, or perpetual render loop.
 */
(function () {
  "use strict";
  var gsap = window.gsap,
    ST = window.ScrollTrigger;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  var root = document.documentElement,
    main = document.getElementById("main");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scenes = Array.from(main.querySelectorAll(":scope > section"));
  var roles = Array.from(document.querySelectorAll(".job"));
  var context,
    navigation,
    desktop,
    timelines = {},
    currentRole = 0;
  var sceneIds = [
    "portrait-iris",
    "career-filmstrip",
    "insight-unfold",
    "foundation-draft",
    "capability-path",
  ];

  function headerHeight() {
    return innerWidth <= 520 ? 68 : 80;
  }
  function canPin() {
    return innerWidth >= 1000 && innerHeight >= 760;
  }
  function pathLength(path) {
    try {
      return path.getTotalLength();
    } catch (_) {
      return 1900;
    }
  }
  function draw(path, timeline, position, duration) {
    var length = pathLength(path);
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    timeline.to(path, { strokeDashoffset: 0, duration: duration, ease: "none" }, position);
  }
  function roleState(index) {
    currentRole = index;
    roles.forEach(function (role, i) {
      var inactive = desktop && i !== index;
      role.inert = inactive;
      if (inactive) role.setAttribute("aria-hidden", "true");
      else role.removeAttribute("aria-hidden");
    });
    document.getElementById("reel-count").textContent = "0" + (index + 1) + " / 03";
    document.getElementById("role-prev").disabled = index === 0;
    document.getElementById("role-next").disabled = index === roles.length - 1;
    var focusedRole = document.activeElement && document.activeElement.closest(".job");
    if (desktop && focusedRole && focusedRole !== roles[index]) {
      document.getElementById(index > 0 ? "role-prev" : "role-next").focus({ preventScroll: true });
    }
  }
  function teardown() {
    if (context) {
      context.revert();
      context = null;
    }
    timelines = {};
    root.classList.remove("cinema-desktop", "cinema-active");
    document.querySelector(".intro-bottom").inert = false;
    roles.forEach(function (role) {
      role.inert = false;
      role.removeAttribute("aria-hidden");
    });
  }
  function timeline(id, config) {
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: Object.assign({ id: id, scrub: true, invalidateOnRefresh: true }, config),
    });
    timelines[id] = tl;
    return tl;
  }
  function setup() {
    teardown();
    desktop = canPin();
    if (main.style.display === "none" || root.classList.contains("still") || reduced.matches) {
      root.dataset.motionState = reduced.matches ? "reduced" : "off";
      desktop = false;
      roleState(0);
      return;
    }
    root.dataset.motionState = "active";
    root.classList.add("cinema-active");
    if (desktop) root.classList.add("cinema-desktop");
    context = gsap.context(function () {
      // SCENE 1: the central aperture opens, type separates, then an iris of
      // paper fills the entire frame and carries its tone into the profile.
      var intro = timeline("portrait-iris", {
        trigger: ".intro-stage",
        start: function () {
          return "top top+=" + headerHeight();
        },
        end: function () {
          return "+=" + Math.round(innerHeight * (desktop ? 1.45 : 0.7));
        },
        pin: desktop,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: function (self) {
          document.querySelector(".intro-bottom").inert = desktop && self.progress > 0.4;
        },
      });
      if (desktop) {
        intro
          .fromTo(
            ".portrait-window",
            { clipPath: "inset(10% 15% 10% 15%)" },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1.45, y: -36, duration: 1.2 },
            0,
          )
          .to(".title-plane", { xPercent: -75, scale: 1.4, duration: 1.6 }, 0)
          .to(".hero-name h1 span:first-child", { xPercent: -38, duration: 1.5 }, 0)
          .to(".hero-name h1 span:last-child", { xPercent: 24, duration: 1.5 }, 0)
          .to(".intro-orbit", { rotation: 30, scale: 1.4, duration: 1.5 }, 0)
          .to(".intro-bottom,.intro-side,.hero-name p", { opacity: 0, duration: 0.35 }, 1)
          .to(".intro-veil", { opacity: 1, duration: 0.5 }, 1.1)
          .to(".transition-portal", { scale: 16, duration: 1.1 }, 1.4)
          .fromTo(".intro-last", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.6 }, 1.7)
          .to(".intro-last", { y: -40, duration: 0.4 }, 2.5);
      } else {
        // Mobile keeps the opening portrait and name readable throughout.
        intro
          .to(".title-plane", { xPercent: -9, duration: 1 }, 0)
          .to(".portrait-window", { y: -20, duration: 1 }, 0)
          .to(".intro-orbit", { rotation: 12, duration: 1 }, 0);
      }

      var profile = timeline("profile-to-practice", {
        trigger: "#about",
        start: "top 80%",
        end: "bottom 15%",
      });
      profile
        .fromTo(".about-title em", { xPercent: -10 }, { xPercent: 6, duration: 1 }, 0)
        .fromTo(".about-exit span", { xPercent: 15 }, { xPercent: -30, duration: 1 }, 0);

      // SCENE 2: three actual role records advance like film frames. The route
      // is drawn across the stage while the active index tracks real scroll.
      var career = timeline("career-filmstrip", {
        trigger: ".experience-stage",
        start: function () {
          return desktop ? "top top+=" + headerHeight() : "top 65%";
        },
        end: function () {
          return desktop ? "+=" + Math.round(innerHeight * 1.85) : "bottom 35%";
        },
        pin: desktop,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: function (self) {
          if (desktop) roleState(Math.min(2, Math.floor(self.progress * 3)));
        },
      });
      if (desktop) {
        gsap.set(roles.slice(1), { yPercent: 110, autoAlpha: 0 });
        career
          .to(roles[0], { yPercent: -110, autoAlpha: 0, duration: 0.34 }, 1)
          .to(roles[1], { yPercent: 0, autoAlpha: 1, duration: 0.34 }, 1)
          .to(roles[1], { yPercent: -110, autoAlpha: 0, duration: 0.34 }, 2)
          .to(roles[2], { yPercent: 0, autoAlpha: 1, duration: 0.34 }, 2)
          .fromTo(".reel-progress span", { scaleX: 0.05 }, { scaleX: 1, duration: 3 }, 0)
          .to(".career-heading em", { x: 24, duration: 3 }, 0);
        roleState(0);
      } else {
        career.fromTo(".reel-progress span", { scaleX: 0.05 }, { scaleX: 1, duration: 3 }, 0);
        roles.forEach(function (role, i) {
          timeline("role-" + i, {
            trigger: role,
            start: "top 80%",
            end: "bottom 20%",
            onUpdate: function (self) {
              if (self.progress > 0.2 && self.progress < 0.8) roleState(i);
            },
          }).fromTo(role.querySelector(".role-index"), { x: -12 }, { x: 12, duration: 1 });
        });
      }
      draw(document.querySelector(".route-draw"), career, 0, 3);

      // Foundation makes the career's drawn route into a document spine.
      var foundation = timeline("foundation-draft", {
        trigger: "#education",
        start: "top 85%",
        end: "bottom 30%",
      });
      foundation
        .fromTo(
          ".degree-document",
          { rotation: desktop ? -6 : -1.5, y: desktop ? 70 : 20, scale: desktop ? 0.88 : 0.98 },
          { rotation: 0, y: 0, scale: 1, duration: 1 },
          0,
        )
        .fromTo(".foundation-line", { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

      // SCENE 3: opposing typography becomes a traced graph; the actual
      // dashboard unfolds out of a lower mask into a readable project screen.
      var insight = timeline("insight-unfold", {
        trigger: ".project-transition",
        start: "top 85%",
        endTrigger: ".flagship",
        end: "bottom 60%",
      });
      insight
        .fromTo(
          ".project-transition>span:first-child",
          { xPercent: -12 },
          { xPercent: 8, duration: 1 },
          0,
        )
        .fromTo(".insight-word", { xPercent: 18 }, { xPercent: -8, duration: 1 }, 0)
        .fromTo(
          ".project-screen",
          {
            clipPath: "inset(45% 12% 0% 12%)",
            rotationX: desktop ? 18 : 0,
            y: desktop ? 100 : 30,
            scale: 0.9,
          },
          { clipPath: "inset(0% 0% 0% 0%)", rotationX: 0, y: 0, scale: 1, duration: 0.65 },
          0.35,
        );
      draw(document.querySelector(".insight-path"), insight, 0, 0.9);

      var capability = timeline("capability-path", {
        trigger: "#skills",
        start: "top 75%",
        end: "bottom 55%",
      });
      draw(document.querySelector(".skills-paths path"), capability, 0, 1);
      if (desktop)
        capability.fromTo(".skill-node:nth-child(even)", { y: 45 }, { y: -15, duration: 1 }, 0);

      timeline("resume-to-contact", {
        trigger: "#resume",
        start: "top bottom",
        end: "bottom top",
      }).fromTo(".resume-word", { xPercent: 12 }, { xPercent: -18, duration: 1 });
      timeline("contact-finale", {
        trigger: "#contact",
        start: "top 85%",
        end: "bottom bottom",
      }).fromTo(".contact-end", { xPercent: 8 }, { xPercent: -6, duration: 1 });
    }, main);
    ST.refresh();
    if (window.layout) window.layout();
  }
  function setLabel(section, i) {
    window.mark(section.id);
    document.getElementById("chapter-current").textContent =
      "0" + (i + 1) + " / " + window.LAB[section.id];
    document.querySelectorAll(".links a,.dots a").forEach(function (a) {
      if (a.getAttribute("href") === "#" + section.id) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  function setupNavigation() {
    if (navigation) navigation.revert();
    navigation = gsap.context(function () {
      if (main.style.display === "none") return;
      scenes.forEach(function (section, i) {
        ST.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: function (self) {
            if (self.isActive) setLabel(section, i);
          },
        });
      });
      gsap.fromTo(
        "#bar",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } },
      );
    });
    if (main.style.display !== "none") setLabel(scenes[0], 0);
  }
  function navigate(id, instant) {
    var el = document.getElementById(id);
    if (!el) return;
    ST.refresh();
    var target = Math.max(0, el.getBoundingClientRect().top + scrollY - headerHeight());
    var scene =
      id === "home"
        ? timelines["portrait-iris"]
        : id === "experience"
          ? timelines["career-filmstrip"]
          : null;
    if (desktop && scene) target = scene.scrollTrigger.start;
    window.scrollTo({
      top: target,
      behavior:
        instant || reduced.matches || root.classList.contains("still") ? "instant" : "smooth",
    });
  }
  function selectRole(delta) {
    var next = Math.max(0, Math.min(2, currentRole + delta));
    var scene = timelines["career-filmstrip"];
    if (desktop && scene) {
      var trigger = scene.scrollTrigger;
      // Stop in the middle of a settled frame, never inside a crossfade.
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * ((next + 0.5) / 3),
        behavior: "instant",
      });
      ST.update();
    } else
      roles[next].scrollIntoView({
        block: "center",
        behavior: reduced.matches ? "instant" : "smooth",
      });
    roleState(next);
  }
  document.getElementById("role-prev").addEventListener("click", function () {
    selectRole(-1);
  });
  document.getElementById("role-next").addEventListener("click", function () {
    selectRole(1);
  });
  // Keyboard focus must never remain clipped by a scroll-linked mask.
  main.addEventListener("focusin", function (e) {
    var screen = e.target.closest(".project");
    if (screen && timelines["insight-unfold"]) {
      timelines["insight-unfold"].progress(1);
      gsap.set(".project-screen", { clearProps: "clipPath,transform" });
    }
  });
  window.PortfolioMotion = {
    getState: function () {
      return root.dataset.motionState;
    },
    refresh: function () {
      ST.refresh();
    },
    navigate: navigate,
    // Exposes existing scene timelines for runtime verification and debugging.
    getScenes: function () {
      return Object.keys(timelines);
    },
    getScene: function (id) {
      return timelines[id];
    },
    getCurrentRole: function () {
      return currentRole;
    },
  };
  function rebuild() {
    setup();
    setupNavigation();
    ST.refresh();
  }
  rebuild();
  window.addEventListener("portfolio:route", rebuild);
  window.addEventListener("portfolio:motion", rebuild);
  reduced.addEventListener("change", rebuild);
  var resize;
  window.addEventListener("resize", function () {
    clearTimeout(resize);
    resize = setTimeout(function () {
      if (desktop !== canPin()) rebuild();
      else ST.refresh();
    }, 150);
  });
  ST.addEventListener("refresh", function () {
    if (window.layout) window.layout();
  });
  window.addEventListener("load", function () {
    ST.refresh();
  });
  if (document.fonts)
    document.fonts.ready.then(function () {
      ST.refresh();
    });
  document.querySelectorAll("img").forEach(function (img) {
    if (!img.complete)
      img.addEventListener(
        "load",
        function () {
          ST.refresh();
        },
        { once: true },
      );
  });
  window.addEventListener("pagehide", function (e) {
    if (!e.persisted) {
      teardown();
      if (navigation) navigation.revert();
    }
  });
})();

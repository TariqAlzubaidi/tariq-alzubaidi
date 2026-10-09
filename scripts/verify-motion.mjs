import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM, ResourceLoader, VirtualConsole } from "jsdom";

// Executes the actual bundled GSAP/ScrollTrigger against a deterministic layout
// fixture. Scroll positions (not direct timeline seeking) drive every assertion.
// JSDOM does not render pixels; browser visual/performance review is separate.
const html = readFileSync("dist/index.html", "utf8");
const source = readFileSync("public/portfolio-motion.js", "utf8");
assert.ok(!/normalizeScroll|scrollerProxy|wheel.*preventDefault/.test(source));
assert.ok(!html.includes("section-atmosphere"), "Previous presentation removed");
class LocalFiles extends ResourceLoader {
  fetch(url) {
    if (url.startsWith("http://localhost:4173/") && new URL(url).pathname.endsWith(".js"))
      return Promise.resolve(readFileSync(resolve("dist", "." + new URL(url).pathname)));
    return null;
  }
}
async function run(width, initiallyReduced = false) {
  console.log("Cinematic scroll runtime:", width, initiallyReduced ? "reduced" : "full");
  const errors = [],
    warnings = [],
    media = [];
  let viewport = width,
    height = 1000,
    y = 0,
    reduced = initiallyReduced;
  const sections = {
    home: [80, 920],
    about: [1000, 1400],
    experience: [2400, 920],
    education: [3320, 1100],
    projects: [4420, 2600],
    skills: [7020, 1400],
    certifications: [8420, 2500],
    resume: [10920, 1000],
    contact: [11920, 1600],
  };
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => {
    errors.push(e.message);
    console.log("Runtime error:", e.message);
  });
  vc.on("error", (e) => errors.push(String(e)));
  vc.on("warn", (e) => warnings.push(String(e)));
  const dom = new JSDOM(html, {
    url: "http://localhost:4173/",
    runScripts: "dangerously",
    resources: new LocalFiles(),
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      const computed = w.getComputedStyle.bind(w);
      // Browsers resolve authored transform functions to matrices. JSDOM
      // returns the function string; supply an identity layout matrix so GSAP
      // can measure and update relative transforms without NaN decomposition.
      w.getComputedStyle = function (el) {
        const style = computed(el);
        return new Proxy(style, {
          get(target, key) {
            if (key === "transform" && target.transform && !target.transform.startsWith("matrix"))
              return "matrix(1, 0, 0, 1, 0, 0)";
            if (key === "getPropertyValue")
              return function (name) {
                if (
                  name === "transform" &&
                  target.transform &&
                  !target.transform.startsWith("matrix")
                )
                  return "matrix(1, 0, 0, 1, 0, 0)";
                return target.getPropertyValue(name);
              };
            const value = Reflect.get(target, key);
            return typeof value === "function" ? value.bind(target) : value;
          },
        });
      };
      Object.defineProperty(w, "innerWidth", { get: () => viewport });
      Object.defineProperty(w, "innerHeight", { get: () => height });
      Object.defineProperty(w, "scrollY", { get: () => y });
      Object.defineProperty(w, "pageYOffset", { get: () => y });
      w.scrollTo = (a, b) => {
        y = typeof a === "object" ? a.top : b || 0;
      };
      w.HTMLElement.prototype.scrollIntoView = function () {
        y = this.getBoundingClientRect().top + y - 80;
        w.dispatchEvent(new w.Event("scroll"));
      };
      w.matchMedia = (query) => {
        const listeners = new Set();
        const m = {
          get matches() {
            if (query.includes("reduced-motion")) return reduced;
            if (query.includes("prefers-color-scheme")) return true;
            const min = query.match(/min-width:\s*(\d+)/),
              max = query.match(/max-width:\s*(\d+)/);
            return (!min || viewport >= +min[1]) && (!max || viewport <= +max[1]);
          },
          media: query,
          addListener: (f) => listeners.add(f),
          removeListener: (f) => listeners.delete(f),
          addEventListener: (_, f) => listeners.add(f),
          removeEventListener: (_, f) => listeners.delete(f),
          notify() {
            listeners.forEach((f) => f(m));
          },
        };
        media.push(m);
        return m;
      };
      function dimensions(el) {
        if (el === w.document.documentElement || el === w.document.body) return [0, 16000];
        const s = el.closest?.("#main > section");
        const base = s ? sections[s.id] : [0, 600];
        if (!s) return base;
        if (el === s) return base;
        if (el.matches(".intro-stage,.experience-stage")) return [base[0], height - 80];
        if (el.matches(".project-transition")) return [base[0], 700];
        if (el.matches(".flagship")) return [base[0] + 1200, 700];
        if (el.matches(".career-reel,.job")) return [base[0] + 260, 500];
        return [base[0] + 100, 400];
      }
      w.HTMLElement.prototype.getBoundingClientRect = function () {
        const [top, h] = dimensions(this);
        return {
          top: top - y,
          bottom: top - y + h,
          left: 0,
          right: viewport,
          width: viewport,
          height: h,
          x: 0,
          y: top - y,
          toJSON() {
            return this;
          },
        };
      };
      for (const prop of ["offsetHeight", "clientHeight", "scrollHeight"])
        Object.defineProperty(w.HTMLElement.prototype, prop, {
          configurable: true,
          get() {
            if (this === w.document.documentElement)
              return prop === "scrollHeight" ? 16000 : height;
            return dimensions(this)[1];
          },
        });
      for (const prop of ["offsetWidth", "clientWidth", "scrollWidth"])
        Object.defineProperty(w.HTMLElement.prototype, prop, {
          configurable: true,
          get: () => viewport,
        });
      w.SVGElement.prototype.getBoundingClientRect = function () {
        return { top: 0, left: 0, width: 1200, height: 650, bottom: 650, right: 1200 };
      };
    },
  });
  const w = dom.window,
    d = w.document;
  await new Promise((r, reject) => {
    w.addEventListener("load", r, { once: true });
    w.setTimeout(() => reject(new Error("Script load timed out: " + errors.join("; "))), 10000);
  });
  assert.deepEqual(errors, []);
  assert.equal(w.gsap.version, "3.13.0");
  const P = w.PortfolioMotion;
  assert.equal(P.getState(), initiallyReduced ? "reduced" : "active");
  const pinCount = () => w.ScrollTrigger.getAll().filter((t) => t.pin).length;
  async function scrollScene(id, fraction) {
    const tl = P.getScene(id),
      st = tl.scrollTrigger;
    assert.ok(st.end > st.start, `${id} has a real scroll range`);
    w.scrollTo({ top: st.start + (st.end - st.start) * fraction });
    w.dispatchEvent(new w.Event("scroll"));
    w.ScrollTrigger.update();
    await new Promise((r) => w.setTimeout(r, 30));
    w.ScrollTrigger.update();
    assert.ok(
      Math.abs(tl.progress() - fraction) < 0.035,
      `${id} responds to scroll: ${tl.progress()} ≈ ${fraction}`,
    );
    // GSAP timelines are thenables; returning one would wait for completion
    // rather than return after checking this intermediate scroll position.
  }
  if (!initiallyReduced) {
    assert.equal(pinCount(), width >= 1000 ? 2 : 0, "Only two desktop pins; no mobile pins");
    assert.ok(P.getScenes().includes("portrait-iris"));
    assert.ok(P.getScenes().includes("career-filmstrip"));
    assert.ok(P.getScenes().includes("insight-unfold"));
    await scrollScene("portrait-iris", 0.1);
    const earlyPortrait = w.gsap.getProperty(".portrait-window", "y");
    await scrollScene("portrait-iris", 0.8);
    assert.notEqual(
      w.gsap.getProperty(".portrait-window", "y"),
      earlyPortrait,
      "Portrait moves with actual scroll",
    );
    if (width >= 1000)
      assert.ok(w.gsap.getProperty(".transition-portal", "scaleX") > 8, "Paper iris expands");
    await scrollScene("portrait-iris", 0.1);
    assert.ok(
      Math.abs(w.gsap.getProperty(".portrait-window", "y") - earlyPortrait) < 0.1,
      "Portrait reverses when scrolling back",
    );

    await scrollScene("career-filmstrip", 0.15);
    const earlyDash = Number(w.gsap.getProperty(".route-draw", "strokeDashoffset"));
    await scrollScene("career-filmstrip", 0.5);
    if (width >= 1000) {
      assert.equal(P.getCurrentRole(), 1);
      assert.equal(d.querySelector("#role-sgs").getAttribute("aria-hidden"), null);
      assert.equal(d.querySelector("#role-stc").getAttribute("aria-hidden"), "true");
      assert.ok(w.gsap.getProperty("#role-sgs", "opacity") > 0.9);
    }
    assert.ok(
      Number(w.gsap.getProperty(".route-draw", "strokeDashoffset")) < earlyDash,
      "SVG route draws with scroll",
    );
    if (width >= 1000) {
      d.querySelector("#role-next").click();
      w.dispatchEvent(new w.Event("scroll"));
      w.ScrollTrigger.update();
      assert.equal(P.getCurrentRole(), 2, "Keyboard-operable controls select a settled frame");
      assert.ok(w.gsap.getProperty("#role-mpc", "opacity") > 0.9);
      d.querySelector("#role-prev").click();
      w.dispatchEvent(new w.Event("scroll"));
      w.ScrollTrigger.update();
      assert.equal(P.getCurrentRole(), 1);
    }
    await scrollScene("insight-unfold", 0.05);
    const earlyMask = d.querySelector(".project-screen").style.clipPath;
    await scrollScene("insight-unfold", 0.9);
    assert.notEqual(
      d.querySelector(".project-screen").style.clipPath,
      earlyMask,
      "Project mask unfolds with scroll",
    );
    await scrollScene("insight-unfold", 0.05);
    assert.equal(
      d.querySelector(".project-screen").style.clipPath,
      earlyMask,
      "Project mask reverses with scroll",
    );
    P.navigate("experience", true);
    assert.ok(Number.isFinite(w.scrollY), "Chapter navigation accounts for pins");
  }
  reduced = true;
  media.slice().forEach((m) => m.notify());
  assert.equal(P.getState(), "reduced");
  assert.equal(pinCount(), 0);
  assert.equal(
    d.querySelectorAll(".pin-spacer").length,
    0,
    "Reduced motion removes spacer heights",
  );
  assert.ok(
    Array.from(d.querySelectorAll(".job")).every((r) => !r.inert && !r.hasAttribute("aria-hidden")),
    "All roles readable",
  );
  assert.equal(d.querySelector(".portrait-window").style.clipPath, "");
  assert.equal(d.querySelector(".project-screen").style.clipPath, "");
  reduced = false;
  media.slice().forEach((m) => m.notify());
  d.querySelector("#mot").click();
  assert.equal(P.getState(), "off");
  assert.equal(pinCount(), 0);
  d.querySelector("#mot").click();
  assert.equal(P.getState(), "active");
  viewport = width >= 1000 ? 375 : 1440;
  w.dispatchEvent(new w.Event("resize"));
  await new Promise((r) => w.setTimeout(r, 180));
  assert.equal(pinCount(), viewport >= 1000 ? 2 : 0, "Resize cleans up and rebuilds pin layout");
  w.location.hash = "#/project/hr-recruitment-dashboard";
  await new Promise((r) => w.setTimeout(r, 30));
  assert.equal(
    w.ScrollTrigger.getAll().length,
    0,
    "Detail route removes all hidden scene triggers",
  );
  assert.ok(d.querySelector('#csBody a[href="./hr-dashboard.html"]'));
  w.location.hash = "#projects";
  await new Promise((r) => w.setTimeout(r, 30));
  assert.equal(d.querySelector("#main").style.display, "");
  assert.ok(w.ScrollTrigger.getAll().length > 12);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  w.dispatchEvent(new w.PageTransitionEvent("pagehide", { persisted: false }));
  assert.equal(w.ScrollTrigger.getAll().length, 0);
  dom.window.close();
}
await run(1440);
await run(375);
await run(1440, true);
console.log(
  "Passed actual scroll-driven GSAP timelines: portrait iris, role filmstrip and controls, SVG progression, reversible project mask, desktop/mobile pin behavior, reduced motion, resize cleanup, detail navigation and teardown. Uses simulated layout, not a pixel-rendering browser.",
);

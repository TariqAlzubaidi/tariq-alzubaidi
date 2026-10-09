import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { JSDOM, VirtualConsole } from "jsdom";

const html = readFileSync("dist/index.html", "utf8");
const data = readFileSync("src/lib/portfolio-content.js", "utf8");
// Captured from the original content before the redesign. Update only for intentional content edits.
assert.equal(
  createHash("sha256").update(data).digest("hex"),
  "b2e2f6fb971bdf331f7a100458c08040afaa4b4b3db1cdb17ecb1fa5258c9432",
  "All original content, asset data and status records must be preserved exactly",
);
for (const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e.message));
const dom = new JSDOM(html, {
  url: "http://localhost:4173/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(w) {
    w.scrollTo = () => {};
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  },
});
const { window: w } = dom;
const d = w.document;
assert.equal(errors.length, 0, errors.join("\n"));
assert.equal(d.querySelectorAll("#expList .job").length, 3);
assert.equal(d.querySelectorAll("#featured .card").length, 3);
assert.equal(d.querySelectorAll("#futureGrid .card").length, 3);
assert.equal(d.querySelectorAll("#skillsGrid .box").length, 4);
assert.equal(d.querySelectorAll("#certGroups .cert:not(.cert-empty)").length, w.CERTS.length);
assert.equal(d.querySelector("#featured .project-status").textContent, "Completed");
assert.deepEqual(
  Array.from(d.querySelectorAll("#certGroups .cstat"), (x) => x.textContent),
  Array.from(
    w.CERTS.filter((x) => x.status),
    (x) => x.status,
  ),
);
assert.equal(w.atob(w.CONFIG.cv).slice(0, 5), "%PDF-");
assert.equal(d.querySelector("#pic").src, w.CONFIG.photo);
assert.ok(d.querySelector('#contactList a[href^="mailto:"]'));
assert.ok(d.querySelector('#contactList a[href^="tel:"]'));
assert.ok(d.querySelector('#featured a[href="./hr-dashboard.html"]'));
d.querySelector("#menu").click();
assert.equal(d.querySelector("#menu").getAttribute("aria-expanded"), "true");
d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
assert.equal(d.querySelector("#menu").getAttribute("aria-expanded"), "false");
d.querySelector("#th").click();
assert.equal(d.documentElement.dataset.theme, "light");
d.querySelector("#th").click();
assert.equal(d.documentElement.dataset.theme, "dark");
assert.deepEqual(
  Array.from(d.querySelectorAll("#main > section"), (x) => x.id),
  [
    "home",
    "about",
    "experience",
    "education",
    "projects",
    "skills",
    "certifications",
    "resume",
    "contact",
  ],
  "Nine content chapters keep their logical order",
);
for (const x of w.EXPS) {
  const role = d.querySelector("#role-" + x.slug);
  assert.equal(role.querySelectorAll("li").length, x.list.length);
  assert.equal(role.querySelector(".meta").textContent, x.meta);
}
w.location.hash = "#/project/hr-recruitment-dashboard";
w.route();
assert.equal(d.querySelector("#main").style.display, "none");
assert.equal(d.querySelectorAll(".hs-kpis>div").length, 5);
assert.ok(d.querySelector('#csBody a[href="./hr-dashboard.html"]'));
d.querySelector(".hs-zoom").click();
assert.ok(d.querySelector("#lb").classList.contains("open"));
assert.equal(d.activeElement.id, "lbx");
d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
assert.ok(!d.querySelector("#lb").classList.contains("open"));
assert.equal(d.activeElement.className, "hs-zoom");
for (const x of w.EXPS) {
  w.location.hash = "#/exp/" + x.slug;
  w.route();
  assert.equal(d.querySelector("#csTitle").textContent, x.role);
  assert.equal(d.querySelectorAll("#csBody li").length, x.list.length);
}
w.location.hash = "#projects";
w.route();
assert.equal(d.querySelector("#main").style.display, "");
assert.equal(
  readFileSync("dist/hr-dashboard.html", "utf8"),
  readFileSync("src/lib/hr-dashboard.html", "utf8"),
);
assert.equal(
  readFileSync("dist/hr-recruitment-data.csv", "utf8"),
  readFileSync("public/hr-recruitment-data.csv", "utf8"),
);
dom.window.close();
console.log(
  "Passed: exact content preservation, JavaScript syntax, rendered records and statuses, CV PDF, contact links, menu/theme, project/experience routes, image viewer keyboard focus, dashboard and dataset preservation.",
);

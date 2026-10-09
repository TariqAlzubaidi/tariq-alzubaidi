// Browser review through Edge's local DevTools protocol; no added dependency.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const targets = await (await fetch("http://127.0.0.1:9222/json")).json();
const target = targets.find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map(),
  errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.reject(m.error) : p.resolve(m.result);
  }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
});
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
}
async function evaluate(expression) {
  const r = await command("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
}
await command("Runtime.enable");
await command("Page.enable");
mkdirSync(".tmp/review", { recursive: true });
for (const [width, height] of [
  [1440, 1000],
  [768, 1024],
  [375, 812],
  [812, 375],
]) {
  await command("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  await command("Page.navigate", { url: "http://127.0.0.1:4173/" });
  await evaluate("new Promise(r=>setTimeout(r,2000))");
  await evaluate("document.fonts.ready");
  await evaluate("new Promise(r=>setTimeout(r,1200))");
  const overflow = await evaluate(
    '({width:innerWidth,scroll:document.documentElement.scrollWidth,hero:document.querySelector(".hero-name h1").getBoundingClientRect().toJSON(),portrait:document.querySelector("#pic").complete&&document.querySelector("#pic").naturalWidth>0})',
  );
  assert.ok(
    overflow.scroll <= width,
    `Horizontal overflow at ${width}: ${JSON.stringify(overflow)}`,
  );
  assert.ok(overflow.portrait, "Portrait loaded");
  assert.equal(await evaluate("window.PortfolioMotion.getState()"), "active");
  for (const theme of ["light", "dark"]) {
    await evaluate(`setTheme('${theme}');window.scrollTo(0,0)`);
    const shot = await command("Page.captureScreenshot", { format: "png" });
    writeFileSync(`.tmp/review/hero-${width}-${theme}.png`, Buffer.from(shot.data, "base64"));
  }
  for (const sceneId of ["portrait-iris", "career-filmstrip", "insight-unfold"]) {
    const states = [];
    for (const fraction of [0.15, 0.75, 0.15]) {
      await evaluate(
        `(()=>{const t=PortfolioMotion.getScene('${sceneId}').scrollTrigger;window.scrollTo(0,t.start+(t.end-t.start)*${fraction});ScrollTrigger.update()})()`,
      );
      await evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
      const state = await evaluate(
        `({progress:PortfolioMotion.getScene('${sceneId}').progress(),portrait:gsap.getProperty('.portrait-window','y'),role:PortfolioMotion.getCurrentRole(),mask:document.querySelector('.project-screen').style.clipPath})`,
      );
      assert.ok(
        Math.abs(state.progress - fraction) < 0.04,
        `${sceneId} responds to browser scroll at ${width}`,
      );
      states.push(state);
    }
    if (sceneId === "portrait-iris") assert.notEqual(states[0].portrait, states[1].portrait);
    if (sceneId === "career-filmstrip" && width >= 1000 && height >= 760)
      assert.notEqual(states[0].role, states[1].role);
    if (sceneId === "insight-unfold") assert.notEqual(states[0].mask, states[1].mask);
    assert.equal(states[0].mask, states[2].mask, `${sceneId} reverses`);
  }
  await evaluate(
    'document.querySelector("#projects").scrollIntoView();new Promise(r=>setTimeout(r,1300))',
  );
  const project = await command("Page.captureScreenshot", { format: "png" });
  writeFileSync(`.tmp/review/projects-${width}.png`, Buffer.from(project.data, "base64"));
  assert.ok(
    await evaluate(
      'document.querySelector("#featured .card").getBoundingClientRect().width<=innerWidth',
    ),
    "Project fits viewport",
  );
  await command("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  assert.equal(await evaluate("PortfolioMotion.getState()"), "reduced");
  assert.equal(await evaluate("ScrollTrigger.getAll().filter(t=>t.pin).length"), 0);
  assert.ok(
    await evaluate(
      'Array.from(document.querySelectorAll(".job")).every(x=>!x.inert&&!x.hasAttribute("aria-hidden"))',
    ),
  );
  await command("Emulation.setEmulatedMedia", { features: [] });
  console.log(
    `Browser passed: ${width} × ${height}, light/dark, loaded portrait, no overflow, project layout, reduced motion.`,
  );
}
assert.deepEqual(errors, [], "No browser runtime exceptions");
ws.close();
console.log("Screenshots written to .tmp/review.");

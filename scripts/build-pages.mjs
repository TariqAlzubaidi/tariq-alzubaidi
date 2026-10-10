// Static GitHub Pages build: emits the portfolio as a client-only site in ./dist.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, rmSync } from "node:fs";

const ASSET_HOST = "https://tariq-alzubaidi.lovable.app";
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
mkdirSync("dist/vendor/gsap", { recursive: true });
for (const file of ["gsap.min.js", "ScrollTrigger.min.js"]) {
  copyFileSync(`public/vendor/gsap/${file}`, `dist/vendor/gsap/${file}`);
}
copyFileSync("public/portfolio-motion.js", "dist/portfolio-motion.js");
// Publish the downloadable CV with the static site.
copyFileSync("public/TariqAlzubaidi_ResumeEN.pdf", "dist/TariqAlzubaidi_ResumeEN.pdf");

// Certificate files are hosted on the Lovable asset CDN; make their links absolute.
const html = readFileSync("src/lib/portfolio.html", "utf8")
  .replace("/* PORTFOLIO_CONTENT */", () => readFileSync("src/lib/portfolio-content.js", "utf8"))
  .replaceAll('"/__l5e/', `"${ASSET_HOST}/__l5e/`);
writeFileSync("dist/index.html", html);
copyFileSync("dist/index.html", "dist/404.html");
// Standalone interactive HR analytics page; leaves the portfolio unchanged.
copyFileSync("src/lib/hr-dashboard.html", "dist/hr-dashboard.html");
copyFileSync("public/hr-recruitment-data.csv", "dist/hr-recruitment-data.csv");
mkdirSync("dist/employee-data-case-study", { recursive: true });
copyFileSync("public/employee-data-case-study/workforce-dashboard.svg", "dist/employee-data-case-study/workforce-dashboard.svg");
writeFileSync("dist/.nojekyll", "");
if (existsSync("public/favicon.ico")) copyFileSync("public/favicon.ico", "dist/favicon.ico");
console.log("Static site written to dist/ (index.html + 404.html)");

// Static GitHub Pages build: emits the portfolio as a client-only site in ./dist.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, rmSync } from "node:fs";

const ASSET_HOST = "https://tariq-alzubaidi.lovable.app";
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });

// Certificate files are hosted on the Lovable asset CDN; make their links absolute.
const html = readFileSync("src/lib/portfolio.html", "utf8").replaceAll(
  '"/__l5e/',
  `"${ASSET_HOST}/__l5e/`,
);
writeFileSync("dist/index.html", html);
copyFileSync("dist/index.html", "dist/404.html");
writeFileSync("dist/.nojekyll", "");
if (existsSync("public/favicon.ico")) copyFileSync("public/favicon.ico", "dist/favicon.ico");
console.log("Static site written to dist/ (index.html + 404.html)");

# Tariq Al-Zubaidi — The Human System

A cinematic, continuous personal portfolio for an HR Operations and
Administrative professional. The presentation is built from nine chapters:
Introduction, About, Experience, Education, Projects, Skills, Certifications,
Resume and Contact. Future projects remain within the Projects chapter.

## Local preview

```powershell
rtk proxy npm run build
rtk proxy python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open **http://localhost:4173**. The interactive dashboard is available at
**http://localhost:4173/hr-dashboard.html**. These commands serve local files;
they do not publish or deploy anything.

## Scroll choreography

- **Portrait iris:** a centered portrait aperture expands, large typography
  separates, drafting orbits turn, and a paper iris fills the frame before About.
- **Career filmstrip:** three complete experience records advance vertically
  through a pinned stage while an SVG route draws. Previous/next buttons provide
  keyboard access to settled frames.
- **Insight unfold:** opposing words move into a traced data path, then the
  original recruitment dashboard preview unfolds through a moving mask.
- An academic document settles against a growing drafting spine, skills connect
  through an SVG network, and giant resume typography travels into Contact.

Only the intro and career stages pin on sufficiently large desktop viewports.
Mobile uses continuous scroll-linked transforms without pins. Short laptop
viewports get compact role typography. Reduced motion and the footer animation
switch restore a linear, fully readable page with all experience records visible.

## Source and compatibility

`src/lib/portfolio.html` contains the complete new HTML/CSS and functional
rendering/navigation. Its GET response is still served by the existing TanStack
Start route. `src/lib/portfolio-content.js` remains the unchanged source of
factual records, statuses, contact information, portrait data and embedded CV.
`public/portfolio-motion.js` owns all scroll choreography. GSAP 3.13.0 and
ScrollTrigger remain bundled locally in `public/vendor/gsap`.

The original HR dashboard and CSV are unchanged. Remote certificate images,
PDFs and Power BI screenshots keep their original CDN links and require internet
access; the portrait, CV, dashboard and CSV are local.

## Verification

```powershell
rtk proxy npm test
rtk proxy npm run lint
rtk proxy node scripts/verify-portfolio.mjs
rtk proxy node scripts/verify-motion.mjs
rtk proxy node --experimental-strip-types node_modules/vite/bin/vite.js build --configLoader native
```

The content check asserts the original data module's SHA-256, nine-chapter
order, every experience responsibility and date, certificate statuses, embedded
PDF, contact links, downloads, detail routes and gallery focus handling.

The motion check executes actual GSAP and ScrollTrigger with deterministic
layout measurements. Changing scroll positions drives the assertions; the test
does not manually seek timelines. It checks forward/reverse transforms, masks,
SVG stroke progression, desktop/mobile pins, role controls, reduced motion,
resize, navigation and teardown. JSDOM does not render pixels.

Static and full application builds, routing/content/motion tests pass. Lint has
zero errors and six existing Fast Refresh warnings in shared UI components.
Real Edge visual checks were attempted, but Windows sandbox restrictions block
the browser's IPC/subprocess operations. Pixel-level overflow, screenshot and
frame-rate checks therefore remain unverified. `scripts/verify-browser.mjs`
provides those checks for a browser running with local DevTools on port 9222.

Design research and implementation notes:
`design-system/tariq-portfolio/pages/cinematic.md`.

This project remains connected to [Lovable](https://lovable.dev). No remote
history, publication, deployment or saved backup was changed by this redesign.

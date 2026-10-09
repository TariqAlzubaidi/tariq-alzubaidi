# Tariq Al-Zubaidi — editorial redesign

The portfolio remains one continuous document. The factual content module,
certificate statuses, original portrait, embedded CV, HR dashboard and CSV
are retained. The home route still serves `src/lib/portfolio.html`.

## Art direction

Chalk backgrounds, ink typography and electric cobalt establish a personal
identity. Space Grotesk supplies the large name masthead and editorial
headings; DM Sans keeps longer descriptions readable. The hero pairs a
large name with a cobalt silhouette behind the original portrait. An
asymmetric career timeline, one substantial featured case, capability
panels, certificate archive and cobalt resume interlude create varied pacing.

The UI UX Pro Max design-system search used portfolio/editorial/creative
keywords with variance 8 and motion 8. Its scroll storytelling, accessible
fallback and typography recommendations informed the implementation.
The generated brutalist styling recommendation was softened for the HR
professional context with rounded portrait geometry and generous spacing.

## 21st MCP research and adaptation

Catalog searches: `portfolio editorial hero` and `scroll reveal timeline`.
Evaluated Editorial Collage Hero, Editorial Hero, Product Timeline,
Scroll Reveal and Scroll animated timeline.

Retrieved and reviewed full component source for:

- [Editorial Hero by felipemenezes098](https://21st.dev/@felipemenezes098/components/hero-05), demo 19075.
- [Scroll animated timeline by ibrandify](https://21st.dev/@ibrandify/components/scroll-timeline), demo 35029.

Adapted the hero's editorial copy/media hierarchy to a name masthead and
portrait, using the existing HTML response instead of adding React/Motion
dependencies. Adapted the milestone progress concept to the existing career
records, using GSAP `scaleY` instead of React scroll state or animated height.
The horizontal Product Timeline was rejected because the page should keep
natural vertical scrolling and straightforward mobile navigation.

## Motion and accessibility

GSAP and ScrollTrigger own headline word reveals, portrait wipe, scroll-driven
silhouette separation, project image reveals/parallax, career rail draw and
archive entrances. CSS only handles interaction colors and surface feedback.
Native scrolling remains uninterrupted. Mobile omits parallax. Reduced motion
and the footer motion toggle revert transforms and text masks immediately.
Keyboard focus completes relevant reveals. Detail navigation cleans up scroll
triggers and returning recreates them. Image viewer focus handling is retained.

Light and dark mode use semantic tokens; the featured dashboard stays on an
ink surface in both. The contact form explicitly explains that it opens an
email app. Existing download and verification links remain unchanged.

## Local validation

`npm run build` generates `dist`. `npm test` uses the native config loader and
threads to avoid blocked Windows child-process spawning. The full app build
can be checked with `node --experimental-strip-types node_modules/vite/bin/vite.js build --configLoader native`.
`node scripts/verify-portfolio.mjs` checks exact content integrity and
interactions. `node scripts/verify-motion.mjs` runs actual GSAP/ScrollTrigger
for desktop, mobile and reduced motion.

The local preview is `http://localhost:4173`. A real Edge screenshot review
was attempted but this sandbox prevents the browser's required subprocess
and IPC operations. Browser screenshots and visual overflow assertions have
therefore not been completed. `scripts/verify-browser.mjs` is available for
use with a locally running DevTools browser on port 9222.

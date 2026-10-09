# Portfolio implementation direction

The portfolio uses the verified Minimalism & Swiss Style search result, with the premium typography and ink/gold color direction from the design-system search. The automatically suggested Liquid Glass style fits native app chrome and is overridden here for this professional website.

- Identity: warm ivory, deep forest ink, antique gold; Cormorant Garamond display with Instrument Sans body and system fallbacks.
- Semantic tokens: background, ink, muted, border, panel, card, accent; separate dark theme and forest sections.
- Layout: continuous numbered chapters, asymmetric split hero, timeline, full-width featured project, compact supporting projects, grouped certification grid.
- Spacing: 8px foundation; desktop 112px section spacing, mobile 72px; 1240px container with 48/32/22px gutters.
- Motion: locally bundled GSAP 3.13.0 + ScrollTrigger replace the IntersectionObserver implementation. Masked short-heading words, coordinated hero entrance, scroll-linked decorative layers, progressing timeline, desktop project image parallax, and bento cell reveals. Native smooth scrolling with no pinning or scroll interception.
- Motion tokens: power3.out for standard entrances (850ms), expo.out for hero/headline reveals (1000–1350ms), power2.out for hover feedback (350ms), word/cell stagger 55ms, scroll scrub 400–1000ms. Mobile shortens travel and timing and removes continuous depth effects. System reduced motion and the footer toggle revert transforms and text splitting without reload. GSAP contexts and matchMedia own breakpoint and route cleanup.
- Accessibility: 44px controls, visible focus, skip link, full keyboard image viewer with focus restoration, original status labels and disabled unavailable certificates.
- Preserve portfolio copy and all existing records in portfolio-content.js; original static copy remains in portfolio.html. Both server and static build inline the same data module.

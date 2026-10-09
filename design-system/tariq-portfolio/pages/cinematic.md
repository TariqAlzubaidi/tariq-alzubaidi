# The Human System — implemented creative direction

## Concept

A visual documentary about people, processes and precision. The opening is a
centered portrait poster, not a split hero. Thin drafting lines connect it to
the professional record, academic document and recruitment analysis. Nine
chapters keep the original content order. All factual content is read from the
existing untouched data module.

Charcoal, warm paper and sage support contrasting scenes. Italiana provides
expressive serif headlines; Manrope and DM Mono handle prose and annotations.
The chapter index replaces the horizontal section bar. Every section has a
different composition; the implementation removes the previous art direction,
floating cards, section atmospheres, reveal masks and animation implementation.

## Applied UI UX Pro Max research

Read the installed skill and ran a design-system search for cinematic portfolio
storytelling (variance 9, motion 10, spacious density 2). The first broad
recommendation returned a conventional hero/features pattern; a focused
`scroll storytelling pinned` landing search verified Scroll-Triggered
Storytelling and Horizontal Scroll Journey. The vertical storytelling result
fits the required content sequence. A focused GSAP search verified deterministic
stage height, refresh after assets, true scrub, limited pins and reduced-motion
fallback. Two desktop pins are used; mobile has no pinning.

## 21st MCP research

Actively searched `pinned scroll image zoom parallax` and
`cinematic scroll typography portfolio`. Evaluated:

- [Zoom Parallax by efferd](https://21st.dev/@efferd/components/zoom-parallax):
  scroll-linked depth rather than repeated independent entrances.
- [Parallax Scrolling Effect by minhxthanh](https://21st.dev/@minhxthanh/components/parallax-scrolling-effect):
  useful zoom progression, but blur is avoided for rendering cost/readability.
- [Cinematic Product Scroll Section by Loomix](https://21st.dev/@Loomix/components/cinematic-product-scroll-section):
  masks and opposing typography informed the analytical-work transition.
- [Portfolio Scroll Grid by ruixen.ui](https://21st.dev/@ruixen.ui/components/portfolio-scroll-grid):
  held typography behind moving media; the repeated photo grid does not fit this
  factual professional portrait and was rejected.
- [Interactive Video Portfolio Scroller by piyushxdev](https://21st.dev/@piyushxdev/components/interactive-video-portfolio-scroller):
  synchronized content pacing informed the role filmstrip; autoplay/video/audio
  add no useful professional evidence and were rejected.

Attempted `get_component(5967)`; 21st returned the exhausted daily retrieval
quota. No new component source was returned or copied. The implementation is
custom HTML, SVG and GSAP informed by the retrieved catalog metadata, compatible
with the project's existing server GET response and static builder.

## SVG / Canvas / Three.js evaluation

SVG materially improves the story: the career route, stepped recruitment path
and skills network are crisp, scalable and scroll-drawable. Semantic content
remains HTML beside decorative SVG. GSAP animates stroke dash offsets.

Canvas and Three.js would require extra rendering code and a continuous render
loop for a story already served by typography, a real portrait and an actual
dashboard. They were deliberately excluded. No synthetic portrait or invented
project imagery is introduced.

## Actual scene transitions

1. `portrait-iris`: 1.45 viewport-length desktop pin. Aperture clip opens;
   portrait scales; name halves separate; outline typography and orbits move;
   an opaque veil followed by a warm-paper iris changes the complete frame.
2. `career-filmstrip`: 1.85 viewport-length desktop pin. Complete role panels
   translate vertically through the same frame while an SVG path and progress
   rule draw. Inactive roles are inert and hidden from accessibility navigation.
   Previous/next controls scroll to settled frames. Mobile presents every role
   in flow with separately scrubbed indices and a continuous progress line.
3. `insight-unfold`: no pin. Opposing large type moves across the viewport,
   a stepped SVG graph traces, and the actual dashboard image expands out of
   a lower inset mask with perspective and scale settling into a work record.

Additional continuous scrubs connect the profile ribbon to the career, rotate
the academic document against a growing spine, draw the skills network and
move the outlined resume typography toward the contact finale.

## Accessibility and performance

Native scrolling; no event cancellation, scroll proxy or wheel interception.
Only two pins and no pin on small/short viewports. All original factual content
is available in the reduced-motion/animation-off document. Context teardown
removes inline transforms, pins, spacers and inert states. Focus completion
protects project controls from masking. The chapter index, role controls,
image gallery, forms and downloads are keyboard navigable. SVG is decorative.
Animations stop advancing when scroll stops; there are no perpetual visual loops.
Original image loading dimensions and lazy previews are preserved.

## Validation and limitations

Exact original data SHA-256, nine-chapter order, experience lists and dates,
statuses, gallery focus, detail routes, CV bytes, dashboard bytes and CSV bytes
pass. Static and full application builds pass. Routing test passes. Lint passes
with six existing shared-component Fast Refresh warnings.

The motion test executes bundled GSAP/ScrollTrigger with simulated document
measurements. It changes scroll positions and asserts actual timeline progress,
reversible portrait transforms, iris scale, role frame selection, SVG progression
and project masks. It also verifies mobile/no-pin, live reduced motion, motion
switches, resize rebuilds, navigation and complete teardown.

A real Edge run was attempted again, including a local headless profile, but
Windows sandbox IPC restrictions terminated the renderer. Actual browser pixel
review, overflow screenshots and frame-rate measurements remain unverified.

import { createFileRoute } from "@tanstack/react-router";
import portfolioHtml from "@/lib/portfolio.html?raw";

// The portfolio is the user's original single-file design, served as-is
// (with scroll-overlap fixes, reveal animations and the Education section).
export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(portfolioHtml, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});

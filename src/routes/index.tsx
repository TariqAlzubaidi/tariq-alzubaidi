import { createFileRoute } from "@tanstack/react-router";
import portfolioHtml from "@/lib/portfolio.html?raw";
import portfolioContent from "@/lib/portfolio-content.js?raw";

// Serve the continuous portfolio with its shared, editable content module.
export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          portfolioHtml.replace("/* PORTFOLIO_CONTENT */", () => portfolioContent),
          {
            headers: { "content-type": "text/html; charset=utf-8" },
          },
        ),
    },
  },
});

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const PRIVATE_DIR = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "private");

/** The first PDF found in private/ (the folder is git-ignored and never deployed). */
function privatePdf(): string | null {
  if (!fs.existsSync(PRIVATE_DIR)) return null;
  const file = fs.readdirSync(PRIVATE_DIR).find((f) => f.toLowerCase().endsWith(".pdf"));
  return file ? path.join(PRIVATE_DIR, file) : null;
}

/**
 * Serves the private report on the local dev server only (`npm run dev`).
 * The PDF is never imported, copied to public/ or emitted into dist/, so a
 * deployed build cannot expose it. The UI only offers the download in dev.
 */
function privateReportDevOnly(): Plugin {
  return {
    name: "private-report-dev-only",
    apply: "serve",
    configureServer(server) {
      // Never serve the private folder by its direct path.
      server.middlewares.use((req, res, next) => {
        if (decodeURIComponent(req.url ?? "").toLowerCase().startsWith("/private")) {
          res.statusCode = 404;
          res.end();
          return;
        }
        next();
      });
      server.middlewares.use("/__local/report.pdf", (req, res) => {
        const pdf = privatePdf();
        if (!pdf) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="RR_2027_Squad_Report.pdf"');
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        fs.createReadStream(pdf).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), privateReportDevOnly()],
  server: {
    // Block direct URL access to the private folder in dev as well.
    fs: { deny: ["private/**", ".env", ".env.*"] },
  },
});

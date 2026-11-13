import { useEffect, useState } from "react";

/**
 * The full PDF report is private (frontend/private/, git-ignored). It is only
 * reachable through the local dev server; production builds never request it.
 */
const DEV_REPORT_URL = "/__local/report.pdf";

export function useLocalReport(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let cancelled = false;
    fetch(DEV_REPORT_URL, { method: "HEAD" })
      .then((r) => !cancelled && r.ok && r.headers.get("content-type")?.includes("pdf") && setUrl(DEV_REPORT_URL))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return url;
}

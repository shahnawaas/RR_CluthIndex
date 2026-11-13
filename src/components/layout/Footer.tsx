import { Download } from "lucide-react";
import { meta } from "../../data";
import { longDate, num } from "../../lib/format";
import { useLocalReport } from "../../lib/report";

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#teams", label: "Teams" },
  { href: "#squads", label: "Squads" },
  { href: "#insights", label: "Squad insights" },
];

export function Footer() {
  const reportUrl = useLocalReport();
  return (
    <footer id="about" aria-labelledby="about-title" className="bg-navy text-white">
      <div className="mx-auto max-w-[1360px] px-5 pb-10 pt-20 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="flex items-baseline gap-2.5">
              <span className="display text-[2.6rem] leading-none">Royals</span>
              <span className="display text-[2.6rem] leading-none text-pink">2027</span>
            </p>
            <h2 id="about-title" className="mt-8 text-[17px] font-bold text-gold">
              About this project
            </h2>
            <p className="mt-3 max-w-[36rem] text-[15px] leading-relaxed text-white/75">
              An independent, data-led player selection for the Rajasthan Royals IPL 2027 squad: one team of proven performers under
              pressure and one of researched auction prospects from outside the current squad.
            </p>
            <p className="mt-4 max-w-[36rem] text-[14px] leading-relaxed text-white/60">
              Statistics come from {num(meta.matches)} IPL and T20I matches ({num(meta.iplMatches)} IPL, {num(meta.t20iMatches)} T20I;{" "}
              {num(meta.deliveries)} deliveries) played between {longDate(meta.firstDate)} and {longDate(meta.lastDate)}. They are not
              career figures.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:col-start-8">
            <nav aria-label="Footer">
              <p className="text-[13px] font-bold text-white/50">On this page</p>
              <ul className="mt-3 space-y-2">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-[15px] font-semibold text-white/85 hover:text-gold">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="text-[13px] font-bold text-white/50">Full report</p>
              {reportUrl ? (
                <>
                  <a
                    href={reportUrl}
                    download="RR_2027_Squad_Report.pdf"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-pink-strong px-5 py-2.5 text-[14px] font-bold text-white hover:bg-pink"
                  >
                    <Download size={16} aria-hidden /> Download report
                  </a>
                  <p className="mt-2 text-[12px] text-white/50">Available on this local preview only.</p>
                </>
              ) : (
                <p className="mt-3 max-w-[16rem] text-[14px] leading-relaxed text-white/75">
                  The full report is kept private. It is available on request.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/15 pt-6 text-[12px] text-white/50 sm:flex-row sm:justify-between">
          <p>Independent project. Not affiliated with or endorsed by Rajasthan Royals or the IPL.</p>
          <p>Player photos appear only where a correctly named image has been supplied.</p>
        </div>
      </div>
    </footer>
  );
}

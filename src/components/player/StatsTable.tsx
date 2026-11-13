import type { BattingStats, BowlingStats, Player, Scope } from "../../types";
import { NA, num } from "../../lib/format";

const SCOPES: { key: Scope; label: string }[] = [
  { key: "ipl", label: "IPL" },
  { key: "t20i", label: "T20I" },
  { key: "all", label: "Combined" },
];

type Row<T> = { label: string; get: (s: T) => string };

const BAT_ROWS: Row<BattingStats>[] = [
  { label: "Matches", get: (s) => num(s.matches) },
  { label: "Runs", get: (s) => num(s.runs) },
  { label: "Balls faced", get: (s) => num(s.balls) },
  { label: "Average", get: (s) => num(s.average, 2) },
  { label: "Strike rate", get: (s) => num(s.strikeRate, 2) },
  { label: "Highest score", get: (s) => s.highest },
  { label: "50s / 100s", get: (s) => `${s.fifties} / ${s.hundreds}` },
  { label: "4s / 6s", get: (s) => `${num(s.fours)} / ${num(s.sixes)}` },
  { label: "Dot-ball %", get: (s) => num(s.dotPct, 1) },
];

const BOWL_ROWS: Row<BowlingStats>[] = [
  { label: "Matches", get: (s) => num(s.matches) },
  { label: "Overs", get: (s) => s.overs },
  { label: "Wickets", get: (s) => num(s.wickets) },
  { label: "Economy", get: (s) => num(s.economy, 2) },
  { label: "Average", get: (s) => num(s.average, 2) },
  { label: "Strike rate", get: (s) => num(s.strikeRate, 1) },
  { label: "Best figures", get: (s) => s.best },
  { label: "4-wicket hauls", get: (s) => num(s.fourWickets) },
  { label: "Dot-ball %", get: (s) => num(s.dotPct, 1) },
];

export function StatsTable({ player, kind }: { player: Player; kind: "batting" | "bowling" }) {
  const data = player[kind] as Record<Scope, BattingStats | BowlingStats | null>;
  const rows = (kind === "batting" ? BAT_ROWS : BOWL_ROWS) as Row<BattingStats | BowlingStats>[];
  return (
    <div className="-mx-1 overflow-x-auto px-1" data-scroll-x>
      <table className="tnum w-full min-w-[300px] border-collapse text-[14px]">
        <caption className="sr-only">
          {kind === "batting" ? "Batting" : "Bowling"} statistics by competition, 2022 to 2026
        </caption>
        <thead>
          <tr className="border-b-2 border-navy text-left">
            <th scope="col" className="py-2 pr-3 font-semibold text-muted">
              <span className="sr-only">Statistic</span>
            </th>
            {SCOPES.map((s) => (
              <th key={s.key} scope="col" className={`py-2 pl-3 text-right font-bold ${s.key === "all" ? "text-navy" : "text-ink"}`}>
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-line last:border-0">
              <th scope="row" className="py-2 pr-3 text-left font-semibold text-muted">
                {r.label}
              </th>
              {SCOPES.map((s) => {
                const v = data[s.key];
                const text = v ? r.get(v) : NA;
                return (
                  <td
                    key={s.key}
                    className={`py-2 pl-3 text-right ${text === NA ? "text-muted/70" : s.key === "all" ? "font-bold text-navy" : "text-ink"}`}
                  >
                    {text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

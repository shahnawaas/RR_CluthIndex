import { insights, TEAMS, teamsContaining } from "../../data";
import { num } from "../../lib/format";

function list(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function words(n: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][n] ?? String(n);
}

export function SquadInsights() {
  const i = insights;
  const shared = i.inBothTeams.length;
  const notes = [
    {
      title: "A pace-led attack",
      body: `${i.pace.length} of the ${i.uniqueBowlers} bowlers selected bowl pace, ${words(i.leftArmPace.length)} of them left-arm: ${list(
        i.leftArmPace,
      )}. Spin comes from ${list(i.spin)}.`,
    },
    {
      title: "Left-handed batting",
      body: `${capital(words(i.leftHandedBatters.length))} of the ${i.uniqueBatters} batters bat left-handed: ${list(i.leftHandedBatters)}.`,
    },
    {
      title: "All-round options",
      body: `${capital(words(i.allRounders.length))} players have both faced and bowled at least 300 balls in this data: ${list(i.allRounders)}.`,
    },
    {
      title: "International evidence only",
      body: `${list(i.noIplInDataset)} have no IPL matches in this data, so their selection rests on T20I performances.`,
    },
  ];

  return (
    <section id="insights" aria-labelledby="insights-title" className="bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10">
        <h2 id="insights-title" className="display max-w-[14ch] text-[clamp(2.8rem,6vw,5rem)] text-navy">
          What the squads add up to
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="display tnum text-[clamp(7rem,16vw,11rem)] leading-[0.8] text-pink">{i.uniquePlayers}</p>
            <p className="mt-4 max-w-[26rem] text-xl font-semibold leading-snug text-navy">
              different players across {i.selections} selections.
            </p>
            <p className="mt-3 max-w-[26rem] text-[15px] leading-relaxed text-muted">
              {capital(words(shared))} are picked in both squads, so the lists share a core while still offering {i.uniquePlayers - shared}{" "}
              players who appear in only one of them.
            </p>
          </div>

          <FinishersChart />
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-8 border-t border-navy/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {notes.map((n) => (
            <div key={n.title}>
              <h3 className="text-[16px] font-bold text-navy">{n.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function capital(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FinishersChart() {
  const rows = insights.finishers;
  const max = 250;
  const ticks = [0, 50, 100, 150, 200, 250];
  return (
    <figure className="rounded-[4px] bg-white p-5 ring-1 ring-line sm:p-8 lg:col-span-8">
      <figcaption>
        <h3 className="text-[17px] font-bold text-navy">Finishing power: strike rate in overs 16 to 20</h3>
        <p className="mt-1 text-[13px] text-muted">
          Selected batters with at least {insights.finisherMinBalls} balls faced in the last five overs. Runs per 100 balls, IPL and T20I
          combined.
        </p>
      </figcaption>

      <div className="mt-6" role="table" aria-label="Strike rate in overs 16 to 20">
        <div className="relative">
          {/* grid lines */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[8.5rem] right-[4.5rem] sm:left-[11rem] sm:right-[8rem]">
            {ticks.map((t) => (
              <span key={t} className="absolute inset-y-0 w-px bg-line" style={{ left: `${(t / max) * 100}%` }} />
            ))}
          </div>
          <ul className="relative space-y-1.5" role="rowgroup">
            {rows.map((r) => {
              const teams = teamsContaining(r.id);
              const team = teams.length > 1 ? "Both teams" : `Team ${TEAMS[teams[0]].number}`;
              return (
                <li key={r.id} role="row" className="grid grid-cols-[8.5rem_1fr_4.5rem] items-center sm:grid-cols-[11rem_1fr_8rem]">
                  <span role="rowheader" className="truncate pr-3 text-[13px] font-semibold text-ink sm:text-[14px]">
                    {r.name}
                  </span>
                  <span role="cell" className="relative h-[18px]">
                    <span
                      className={`absolute inset-y-0 left-0 rounded-r-[2px] ${teams.length > 1 ? "bg-gold" : teams[0] === "team01" ? "bg-navy" : "bg-pink-strong"}`}
                      style={{ width: `${(r.strikeRate / max) * 100}%` }}
                    />
                  </span>
                  <span role="cell" className="tnum pl-3 text-[13px] sm:text-[14px]">
                    <span className="font-bold text-navy">{num(r.strikeRate, 1)}</span>
                    <span className="hidden text-[11px] text-muted sm:inline"> ({num(r.balls)} balls)</span>
                    <span className="sr-only">
                      {" "}
                      from {r.balls} balls, {team}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div aria-hidden className="relative ml-[8.5rem] mr-[4.5rem] mt-2 h-4 sm:ml-[11rem] sm:mr-[8rem]">
          {ticks.map((t) => (
            <span key={t} className="tnum absolute -translate-x-1/2 text-[11px] text-muted" style={{ left: `${(t / max) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold text-muted" aria-label="Legend">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[1px] bg-navy" /> Team 01 only
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[1px] bg-pink-strong" /> Team 02 only
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[1px] bg-gold" /> In both teams
        </li>
      </ul>
    </figure>
  );
}

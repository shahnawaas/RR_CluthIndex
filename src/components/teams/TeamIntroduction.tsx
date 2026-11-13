import { insights, ROLE_LABEL, ROLE_ORDER, selections, TEAM_ORDER, TEAMS } from "../../data";
import type { TeamId } from "../../types";
import { PlayerPhoto } from "../player/PlayerPhoto";

const NOTES: Record<TeamId, string> = {
  team01: "Chosen on how players have batted and bowled in tight finishes and difficult match situations, backed by their wider record.",
  team02:
    "Current Rajasthan Royals players are deliberately left out, so this squad focuses on options from outside. Inclusion reflects research only and does not mean a player is confirmed for the auction.",
};

export function TeamIntroduction({ onExplore }: { onExplore: (team: TeamId) => void }) {
  return (
    <section id="teams" aria-labelledby="teams-title" className="bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="teams-title" className="display text-[clamp(2.8rem,6vw,5rem)] text-navy lg:col-span-5">
            Two squads, two different questions
          </h2>
          <p className="max-w-[40rem] text-lg leading-relaxed text-muted lg:col-span-6 lg:col-start-7">
            Performance Leaders asks who has delivered when matches were on the line. Auction Prospects asks who Rajasthan could bring
            in from elsewhere. Each squad names 10 batters and 10 bowlers.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {TEAM_ORDER.map((id) => (
            <TeamPanel key={id} team={id} onExplore={onExplore} />
          ))}
        </div>

        <p className="mt-8 max-w-[60rem] text-[15px] leading-relaxed text-muted">
          <span className="font-bold text-ink">{insights.inBothTeams.length} players appear in both squads: </span>
          {insights.inBothTeams.join(", ")}. Across the 40 selections there are {insights.uniquePlayers} different players.
        </p>
      </div>
    </section>
  );
}

function TeamPanel({ team, onExplore }: { team: TeamId; onExplore: (team: TeamId) => void }) {
  const info = TEAMS[team];
  const dark = team === "team01";
  return (
    <article
      aria-labelledby={`${team}-title`}
      className={`relative flex flex-col overflow-hidden rounded-[4px] p-7 sm:p-10 ${
        dark ? "bg-navy text-white" : "bg-pink-tint text-ink ring-1 ring-pink/25"
      }`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className={`text-[15px] font-bold ${dark ? "text-gold" : "text-pink-ink"}`}>Team {info.number}</p>
          <h3 id={`${team}-title`} className={`display mt-2 text-[clamp(2.4rem,4.6vw,3.6rem)] ${dark ? "text-white" : "text-navy"}`}>
            {info.title}
          </h3>
        </div>
        <span
          aria-hidden
          className={`display -mr-1 -mt-3 text-[clamp(4.5rem,9vw,7.5rem)] leading-none ${dark ? "text-gold/90" : "text-pink"}`}
        >
          {info.number}
        </span>
      </div>

      <p className={`mt-5 max-w-[34rem] text-lg font-semibold leading-snug ${dark ? "text-white" : "text-ink"}`}>{info.description}</p>
      <p className={`mt-3 max-w-[34rem] text-[15px] leading-relaxed ${dark ? "text-white/70" : "text-muted"}`}>{NOTES[team]}</p>

      <div className="mt-8 space-y-3">
        {ROLE_ORDER.map((role) => (
          <div key={role} className="flex items-center gap-4">
            <span className={`w-[4.6rem] shrink-0 text-[13px] font-bold ${dark ? "text-white/70" : "text-muted"}`}>
              10 {ROLE_LABEL[role].toLowerCase()}
            </span>
            <ul className="flex" aria-label={`${info.title} ${ROLE_LABEL[role].toLowerCase()}`}>
              {selections[team][role].map((s) => (
                <li
                  key={s.selection}
                  title={s.name}
                  className={`-ml-2 h-9 w-9 overflow-hidden rounded-full first:ml-0 sm:h-10 sm:w-10 ${
                    dark ? "ring-2 ring-navy" : "ring-2 ring-pink-tint"
                  }`}
                >
                  <PlayerPhoto playerId={s.playerId} name={s.name} size="sm" alt={s.name} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-9 pt-1">
        <button
          type="button"
          onClick={() => onExplore(team)}
          className={`rounded-full px-6 py-3 text-[15px] font-bold transition-colors duration-200 ${
            dark ? "bg-white text-navy hover:bg-gold" : "bg-navy text-white hover:bg-navy-soft"
          }`}
        >
          Explore {info.title.toLowerCase()}
        </button>
      </div>
    </article>
  );
}

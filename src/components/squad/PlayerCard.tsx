import { getPlayer, TEAMS, teamsContaining } from "../../data";
import { num, roleLabel, splitName, styleLine } from "../../lib/format";
import type { Role, Selection, TeamId } from "../../types";
import { PlayerPhoto } from "../player/PlayerPhoto";

interface Props {
  item: Selection;
  team: TeamId;
  role: Role;
  onOpen: () => void;
}

export function PlayerCard({ item, team, role, onOpen }: Props) {
  const p = getPlayer(item.playerId);
  const { first, last } = splitName(item.name);
  const otherTeams = teamsContaining(p.id).filter((t) => t !== team);
  const hasIpl = Boolean(p.batting.ipl || p.bowling.ipl);
  const bat = p.batting.all;
  const bowl = p.bowling.all;

  const stats =
    role === "batters"
      ? [
          { label: "Runs", value: num(bat?.runs) },
          { label: "Strike rate", value: num(bat?.strikeRate, 1) },
          { label: "Average", value: num(bat?.average, 1) },
        ]
      : [
          { label: "Wickets", value: num(bowl?.wickets) },
          { label: "Economy", value: num(bowl?.economy, 2) },
          { label: "Average", value: num(bowl?.average, 1) },
        ];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[4px] bg-white ring-1 ring-line transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(20,33,61,0.55)] focus-within:ring-2 focus-within:ring-pink">
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <PlayerPhoto
          playerId={p.id}
          name={item.name}
          className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-navy via-navy/70 to-transparent" />
        <span
          className="tnum display absolute left-0 top-0 flex h-11 min-w-11 items-center justify-center bg-navy px-2 text-[1.75rem] text-gold sm:h-12 sm:min-w-12 sm:text-[2rem]"
          aria-label={`Selection ${item.selection}`}
        >
          {item.selection}
        </span>
        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3 sm:px-4 sm:pb-3.5">
          {first && <p className="truncate text-[13px] font-semibold text-white/85 sm:text-sm">{first}</p>}
          <h3 className="display break-words text-[1.7rem] text-white sm:text-[2rem]">{last}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-3.5 sm:px-4">
        <p className="text-[13px] leading-snug">
          <span className="font-bold text-ink">{roleLabel(p, role)}</span>
          <span className="block text-muted">{styleLine(p, role)}</span>
        </p>

        <dl className="mt-4 grid grid-cols-1 gap-y-1.5 border-t border-line pt-3.5 sm:grid-cols-3 sm:gap-x-2">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 flex-row-reverse items-baseline justify-between gap-2 sm:block">
              <dd className="tnum display text-[1.35rem] text-navy sm:text-[1.6rem]">{s.value}</dd>
              <dt className="text-[12px] font-semibold leading-tight text-muted sm:mt-1 sm:text-[11px]">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] leading-snug text-muted">
          {hasIpl ? "IPL and T20I, 2022 to 2026" : "T20I only, 2022 to 2026 (no IPL matches in this data)"}
        </p>
        {otherTeams.length > 0 && (
          <p className="mt-1.5 text-[11px] font-bold text-pink-ink">Also in Team {TEAMS[otherTeams[0]].number}</p>
        )}

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={onOpen}
            aria-label={`View stats for ${item.name}`}
            className="w-full rounded-full border border-navy/20 py-2.5 text-[14px] font-bold text-navy transition-colors duration-200 after:absolute after:inset-0 after:content-[''] hover:border-navy hover:bg-navy hover:text-white group-hover:border-navy"
          >
            View stats
          </button>
        </div>
      </div>
    </article>
  );
}

import { motion } from "motion/react";
import type { KeyboardEvent } from "react";
import { ROLE_LABEL, ROLE_ORDER, selections, TEAM_ORDER, TEAMS } from "../../data";
import type { Role, TeamId } from "../../types";

/** Arrow-key movement between tabs, per the WAI-ARIA tabs pattern. */
function arrowNav<T>(e: KeyboardEvent, values: T[], current: T, set: (v: T) => void, idPrefix: string) {
  const i = values.indexOf(current);
  let next = -1;
  if (e.key === "ArrowRight") next = (i + 1) % values.length;
  if (e.key === "ArrowLeft") next = (i - 1 + values.length) % values.length;
  if (e.key === "Home") next = 0;
  if (e.key === "End") next = values.length - 1;
  if (next < 0) return;
  e.preventDefault();
  set(values[next]);
  document.getElementById(`${idPrefix}-${String(values[next])}`)?.focus();
}

export function TeamTabs({ team, onChange }: { team: TeamId; onChange: (t: TeamId) => void }) {
  return (
    <div role="tablist" aria-label="Team" className="grid grid-cols-2 gap-1 rounded-full bg-mist p-1 ring-1 ring-line">
      {TEAM_ORDER.map((t) => {
        const active = t === team;
        return (
          <button
            key={t}
            id={`team-tab-${t}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls="squad-panel"
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t)}
            onKeyDown={(e) => arrowNav(e, TEAM_ORDER, team, onChange, "team-tab")}
            className="relative rounded-full px-3 py-2.5 text-left sm:px-5 sm:py-3"
          >
            {active && (
              <motion.span
                layoutId="team-pill"
                className={`absolute inset-0 rounded-full ${t === "team01" ? "bg-navy" : "bg-pink-strong"}`}
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              />
            )}
            <span className="relative flex flex-col leading-tight sm:flex-row sm:items-baseline sm:gap-2">
              <span className={`whitespace-nowrap text-[12px] font-bold sm:text-[13px] ${active ? (t === "team01" ? "text-gold" : "text-white/85") : "text-muted"}`}>
                Team {TEAMS[t].number}
              </span>
              <span className={`text-[14px] font-bold sm:text-[15px] ${active ? "text-white" : "text-ink"}`}>{TEAMS[t].title}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function RoleTabs({ team, role, onChange }: { team: TeamId; role: Role; onChange: (r: Role) => void }) {
  return (
    <div role="tablist" aria-label="Category" className="flex gap-7">
      {ROLE_ORDER.map((r) => {
        const active = r === role;
        return (
          <button
            key={r}
            id={`role-tab-${r}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls="squad-panel"
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(r)}
            onKeyDown={(e) => arrowNav(e, ROLE_ORDER, role, onChange, "role-tab")}
            className={`relative pb-2 pt-1 text-[clamp(1.5rem,3vw,1.9rem)] transition-colors ${active ? "text-navy" : "text-muted/70 hover:text-navy"}`}
          >
            <span className="display">{ROLE_LABEL[r]}</span>
            <span className="tnum ml-1.5 align-top text-[12px] font-bold">{selections[team][r].length}</span>
            {active && (
              <motion.span
                layoutId="role-underline"
                className="absolute inset-x-0 -bottom-px h-[3px] bg-pink"
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

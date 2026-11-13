import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { meta, ROLE_LABEL, selections, TEAMS } from "../../data";
import { longDate } from "../../lib/format";
import type { Role, TeamId } from "../../types";
import { PlayerCard } from "./PlayerCard";
import { RoleTabs, TeamTabs } from "./Tabs";

interface Props {
  team: TeamId;
  role: Role;
  onTeam: (t: TeamId) => void;
  onRole: (r: Role) => void;
  onOpen: (index: number) => void;
}

export function SquadExplorer({ team, role, onTeam, onRole, onOpen }: Props) {
  const reduce = useReducedMotion();
  const list = selections[team][role];

  return (
    <section id="squads" aria-labelledby="squads-title" className="bg-white pb-24 pt-20 sm:pt-28">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
          <h2 id="squads-title" className="display text-[clamp(2.8rem,6vw,5rem)] text-navy lg:col-span-6">
            Meet the selections
          </h2>
          <p className="max-w-[38rem] text-[16px] leading-relaxed text-muted lg:col-span-6">
            Players are numbered 1 to 10 in selection order. Figures cover IPL and T20I matches from {longDate(meta.firstDate)} to{" "}
            {longDate(meta.lastDate)}, not full careers.
          </p>
        </div>
      </div>

      <div className="sticky top-16 z-30 mt-10 border-y border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-5 py-3 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="md:w-[30rem]">
            <TeamTabs team={team} onChange={onTeam} />
          </div>
          <RoleTabs team={team} role={role} onChange={onRole} />
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10">
        <p className="mt-8 max-w-[48rem] text-[15px] leading-relaxed text-muted">
          <span className="font-bold text-ink">
            Team {TEAMS[team].number}, {ROLE_LABEL[role].toLowerCase()}.
          </span>{" "}
          {TEAMS[team].description}
        </p>

        <div id="squad-panel" role="tabpanel" aria-labelledby={`team-tab-${team} role-tab-${role}`} className="mt-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={`${team}-${role}`}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
            >
              {list.map((item, i) => (
                <li key={item.selection}>
                  <PlayerCard item={item} team={team} role={role} onOpen={() => onOpen(i)} />
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

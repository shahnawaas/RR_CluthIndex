import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getPlayer, meta, ROLE_LABEL, selections, TEAMS, teamsContaining } from "../../data";
import { battingHand, bowlingStyle, longDate, NA_LONG, num, overs, roleLabel, splitName } from "../../lib/format";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { Player, Role, TeamId } from "../../types";
import { PlayerPhoto } from "./PlayerPhoto";
import { StatsTable } from "./StatsTable";

interface Props {
  team: TeamId;
  role: Role;
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}

export function PlayerProfileModal({ team, role, index, onClose, onIndex }: Props) {
  const list = selections[team][role];
  const item = list[index];
  const p = getPlayer(item.playerId);
  const prev = (index - 1 + list.length) % list.length;
  const next = (index + 1) % list.length;
  const mobile = useMediaQuery("(max-width: 767px)");
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus, scroll lock and restoring focus to the card that opened the profile.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      // Deferred so the dialog's focus guard has been removed first.
      window.setTimeout(() => opener?.focus?.(), 0);
    };
  }, []);

  // Keyboard: Escape closes, arrows move between players, Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && !(e.target as HTMLElement).closest("[data-scroll-x]")) onIndex(prev);
      else if (e.key === "ArrowRight" && !(e.target as HTMLElement).closest("[data-scroll-x]")) onIndex(next);
      else if (e.key === "Tab" && panelRef.current) {
        // Only controls that are actually rendered (the mobile and desktop layouts hide different buttons).
        const f = [...panelRef.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])")].filter(
          (el) => el.getClientRects().length > 0,
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        const inside = panelRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    // Safety net: if focus ever lands outside the open dialog, bring it back.
    const onFocusIn = (e: FocusEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) closeRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [onClose, onIndex, prev, next]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const { first, last } = splitName(item.name);
  const others = teamsContaining(p.id).filter((t) => t !== team);
  const roleSingular = role === "batters" ? "batter" : "bowler";

  const panelMotion = reduce
    ? {}
    : mobile
      ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring" as const, stiffness: 320, damping: 34 } }
      : { initial: { opacity: 0, scale: 0.97, y: 12 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.98, y: 8 }, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-navy-deep/75 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-name"
        {...panelMotion}
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white md:grid md:h-auto md:max-h-[min(90vh,860px)] md:max-w-[1080px] md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:rounded-[4px] md:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close player profile"
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-navy/80 text-white backdrop-blur transition-colors hover:bg-pink-strong md:bg-mist md:text-navy md:hover:bg-navy md:hover:text-white"
        >
          <X size={20} />
        </button>

        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto md:contents">
          {/* Identity panel */}
          <aside className="relative bg-navy text-white md:flex md:min-h-0 md:flex-col md:overflow-y-auto">
            <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] md:aspect-[4/5]">
              <PlayerPhoto key={p.id} playerId={p.id} name={item.name} size="lg" eager />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy to-transparent" />
              <span className="tnum display absolute left-0 top-0 flex h-14 min-w-14 items-center justify-center bg-navy px-2 text-[2.4rem] text-gold" aria-hidden>
                {item.selection}
              </span>
            </div>
            <div className="relative -mt-14 px-6 pb-6 md:flex md:flex-1 md:flex-col">
              <p className="text-[13px] font-bold text-gold">
                Team {TEAMS[team].number} {roleSingular}, selection {item.selection}
              </p>
              <h2 id="profile-name" className="display mt-1.5 text-[2.6rem] text-white">
                {first && <span className="block text-[0.62em] text-white/80">{first}</span>}
                {last}
              </h2>
              {p.sourceName !== item.name && (
                <p className="mt-2 text-[13px] text-white/65">Listed in the source data as {p.sourceName}</p>
              )}
              <dl className="mt-5 space-y-2.5 border-t border-white/15 pt-4 text-[14px]">
                <Fact label="Role" value={roleLabel(p, role)} />
                <Fact label="Bats" value={battingHand(p) ?? NA_LONG} />
                <Fact label="Bowls" value={bowlingStyle(p) ?? NA_LONG} />
                {others.length > 0 && <Fact label="Also in" value={others.map((t) => `Team ${TEAMS[t].number}, ${TEAMS[t].title}`).join("; ")} />}
              </dl>
              <div className="mt-6 hidden gap-2 md:mt-auto md:flex md:pt-6">
                <NavButton dir="prev" name={list[prev].name} onClick={() => onIndex(prev)} />
                <NavButton dir="next" name={list[next].name} onClick={() => onIndex(next)} />
              </div>
            </div>
          </aside>

          {/* Statistics */}
          <div
            tabIndex={0}
            aria-label={`${item.name} statistics`}
            className="min-h-0 px-5 pb-28 pt-7 focus-visible:outline-offset-[-3px] sm:px-8 md:overflow-y-auto md:pb-9 md:pt-9"
          >
            <ProfileStats player={p} role={role} />
          </div>
        </div>

        {/* Mobile previous / next bar */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex gap-2 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <NavButton dir="prev" name={list[prev].name} onClick={() => onIndex(prev)} light />
          <NavButton dir="next" name={list[next].name} onClick={() => onIndex(next)} light />
        </div>
      </motion.div>
      <span className="sr-only" aria-live="polite">
        {item.name}, {ROLE_LABEL[role].toLowerCase()} selection {item.selection}
      </span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3">
      <dt className="text-white/55">{label}</dt>
      <dd className="font-semibold text-white">{value}</dd>
    </div>
  );
}

function NavButton({ dir, name, onClick, light = false }: { dir: "prev" | "next"; name: string; onClick: () => void; light?: boolean }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${dir === "prev" ? "Previous" : "Next"} player: ${name}`}
      className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-3 py-2.5 text-[13px] font-bold transition-colors ${
        dir === "next" ? "flex-row-reverse text-right" : ""
      } ${light ? "bg-mist text-navy hover:bg-navy hover:text-white" : "bg-white/10 text-white hover:bg-white hover:text-navy"}`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{name}</span>
    </button>
  );
}

function ProfileStats({ player: p, role }: { player: Player; role: Role }) {
  const batFirst = role === "batters";
  const bat = p.batting.all;
  const bowl = p.bowling.all;
  const hasIpl = Boolean(p.batting.ipl || p.bowling.ipl);

  const key = batFirst
    ? [
        { label: "Runs", value: num(bat?.runs) },
        { label: "Strike rate", value: num(bat?.strikeRate, 1) },
        { label: "Average", value: num(bat?.average, 1) },
        { label: "Highest score", value: bat?.highest ?? "N/A" },
      ]
    : [
        { label: "Wickets", value: num(bowl?.wickets) },
        { label: "Economy", value: num(bowl?.economy, 2) },
        { label: "Average", value: num(bowl?.average, 1) },
        { label: "Best figures", value: bowl?.best ?? "N/A" },
      ];

  const pb = p.pressure.batting;
  const pw = p.pressure.bowling;
  const showPressureBat = batFirst || p.allRounder;
  const showPressureBowl = !batFirst || p.allRounder;

  return (
    <div className="space-y-10">
      <section aria-labelledby="key-figures">
        <h3 id="key-figures" className="text-[15px] font-bold text-ink">
          Key figures
        </h3>
        <p className="mt-0.5 text-[13px] text-muted">IPL and T20I combined{hasIpl ? "" : " (no IPL matches in this data)"}</p>
        <dl className="mt-4 grid grid-cols-2 gap-y-5 sm:grid-cols-4 sm:divide-x sm:divide-line">
          {key.map((k) => (
            <div key={k.label} className="sm:px-4 sm:first:pl-0">
              <dd className="tnum display text-[2.6rem] text-navy">{k.value}</dd>
              <dt className="mt-1 text-[12px] font-semibold text-muted">{k.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {(batFirst ? ["batting", "bowling"] : ["bowling", "batting"]).map((kind, i) => {
        const primary = i === 0;
        if (!primary && !p.allRounder) return null;
        return (
          <section key={kind} aria-labelledby={`table-${kind}`}>
            <h3 id={`table-${kind}`} className="text-[15px] font-bold text-ink">
              {kind === "batting" ? "Batting" : "Bowling"} by competition
            </h3>
            <p className="mb-3 mt-0.5 text-[13px] text-muted">
              {primary ? "IPL only, T20I only, and both combined" : "Also contributes regularly with the " + (kind === "batting" ? "bat" : "ball")}
            </p>
            <StatsTable player={p} kind={kind as "batting" | "bowling"} />
          </section>
        );
      })}

      <section aria-labelledby="under-pressure" className="rounded-[4px] bg-mist p-5 sm:p-6">
        <h3 id="under-pressure" className="display text-[2rem] text-navy">
          Under pressure
        </h3>
        <p className="mt-1 text-[14px] text-muted">Performance in defined high-pressure match situations.</p>
        <div className="mt-5 space-y-6">
          {showPressureBat &&
            (pb ? (
              <PressureRow
                title={p.allRounder ? "Batting" : undefined}
                note={`${num(pb.balls)} balls faced across ${pb.matches} matches`}
                items={[
                  { label: "Runs", value: num(pb.runs) },
                  { label: "Strike rate", value: num(pb.strikeRate, 1), compare: `${num(bat?.strikeRate, 1)} overall` },
                  { label: "Average", value: num(pb.average, 1), compare: `${num(bat?.average, 1)} overall` },
                  { label: "Boundary %", value: num(pb.boundaryPct, 1), compare: `${num(bat?.boundaryPct, 1)} overall` },
                ]}
              />
            ) : (
              <p className="text-[14px] text-muted">Batting: {NA_LONG}.</p>
            ))}
          {showPressureBowl &&
            (pw ? (
              <PressureRow
                title={p.allRounder ? "Bowling" : undefined}
                note={`${overs(pw.legalBalls)} overs bowled across ${pw.matches} matches`}
                items={[
                  { label: "Wickets", value: num(pw.wickets) },
                  { label: "Economy", value: num(pw.economy, 2), compare: `${num(bowl?.economy, 2)} overall` },
                  { label: "Strike rate", value: num(pw.strikeRate, 1), compare: `${num(bowl?.strikeRate, 1)} overall` },
                  { label: "Dot-ball %", value: num(pw.dotPct, 1), compare: `${num(bowl?.dotPct, 1)} overall` },
                ]}
              />
            ) : (
              <p className="text-[14px] text-muted">Bowling: {NA_LONG}.</p>
            ))}
        </div>
      </section>

      <section aria-labelledby="death-overs">
        <h3 id="death-overs" className="text-[15px] font-bold text-ink">
          Overs 16 to 20
        </h3>
        <p className="mt-1 text-[14px] text-ink">
          {batFirst
            ? p.deathOvers.ballsFaced
              ? `Strike rate ${num(p.deathOvers.strikeRate, 1)} from ${num(p.deathOvers.ballsFaced)} balls faced in the last five overs of an innings.`
              : `${NA_LONG}: no balls faced in overs 16 to 20.`
            : p.deathOvers.legalBalls
              ? `Economy ${num(p.deathOvers.economy, 2)} from ${overs(p.deathOvers.legalBalls)} overs bowled in the last five overs of an innings.`
              : `${NA_LONG}: no overs bowled in overs 16 to 20.`}
        </p>
      </section>

      <p className="border-t border-line pt-5 text-[12px] leading-relaxed text-muted">
        IPL and T20I matches from {longDate(meta.firstDate)} to {longDate(meta.lastDate)}; not career figures. N/A means not available
        in source data. Wicketkeeping and fielding are not recorded in this data.
      </p>
    </div>
  );
}

function PressureRow({ title, note, items }: { title?: string; note: string; items: { label: string; value: string; compare?: string }[] }) {
  return (
    <div>
      {title && <p className="mb-2 text-[13px] font-bold text-ink">{title}</p>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label}>
            <dd className="tnum display text-[1.9rem] text-pink-ink">{it.value}</dd>
            <dt className="text-[12px] font-semibold text-ink">{it.label}</dt>
            {it.compare && <p className="tnum text-[12px] text-muted">{it.compare}</p>}
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[12px] text-muted">{note}</p>
    </div>
  );
}

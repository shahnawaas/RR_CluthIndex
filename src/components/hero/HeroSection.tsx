import { motion, useReducedMotion } from "motion/react";
import { findSelection, getPlayer } from "../../data";
import { roleLabel } from "../../lib/format";
import { PlayerPhoto } from "../player/PlayerPhoto";
import { PinkBall } from "./PinkBall";
import type { TeamId } from "../../types";

const HERO_PLAYERS = ["Tilak Varma", "Wanindu Hasaranga", "Matheesha Pathirana"];

/* Collage placement as a percentage of the collage box. */
/* A fanned hand of three frames: each frame's caption sits clear of the frame in front of it. */
const FRAMES = [
  { box: "left-[0%] top-[19%] w-[37%]", rotate: -7, z: "z-10" },
  { box: "left-[31.5%] top-[3%] w-[37%]", rotate: 0, z: "z-20" },
  { box: "left-[63%] top-[21%] w-[37%]", rotate: 6, z: "z-30" },
];
const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ onExplore }: { onExplore: (team: TeamId) => void }) {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: EASE } };

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-navy text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_65%_at_80%_55%,#20325f_0%,transparent_70%)]" />

      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 pb-16 pt-28 sm:px-8 lg:min-h-[min(100svh,900px)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="lg:col-span-6">
          <h1 id="hero-title" className="display text-[clamp(3.4rem,9.6vw,8.2rem)] uppercase">
            <motion.span {...rise(0.25)} className="block">Building the</motion.span>
            <motion.span {...rise(0.33)} className="block">Rajasthan</motion.span>
            <motion.span {...rise(0.41)} className="block">Royals of</motion.span>
            <motion.span {...rise(0.49)} className="block">2027.</motion.span>
          </h1>
          <motion.p {...rise(0.6)} className="mt-7 max-w-[34rem] text-lg leading-relaxed text-white/75 sm:text-xl">
            A data-led look at performance leaders and researched auction prospects for the next Rajasthan Royals squad.
          </motion.p>
          <motion.div {...rise(0.72)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onExplore("team01")}
              className="rounded-full bg-pink-strong px-7 py-3.5 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-pink"
            >
              Explore performance leaders
            </button>
            <button
              type="button"
              onClick={() => onExplore("team02")}
              className="rounded-full border border-white/35 px-7 py-3.5 text-[15px] font-bold text-white transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              Explore auction prospects
            </button>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:col-span-6 lg:max-w-[700px] lg:justify-self-end">
          <div className="relative aspect-[5/4] w-full">
            <PinkBall className="absolute -right-[16%] -top-[4%] w-[88%]" />
            {HERO_PLAYERS.map((name, i) => {
              const found = findSelection(name);
              if (!found) return null;
              const p = getPlayer(found.item.playerId);
              const f = FRAMES[i];
              return (
                <motion.figure
                  key={name}
                  className={`absolute ${f.box} ${f.z}`}
                  initial={reduce ? false : { opacity: 0, y: -36, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: f.rotate }}
                  transition={{ duration: 0.9, delay: 0.5 + i * 0.16, ease: EASE }}
                >
                  <div className="bg-white p-[3.5%] pb-0 shadow-[0_30px_60px_-20px_rgba(4,10,28,0.7)]">
                    <div className="aspect-[4/5] overflow-hidden">
                      <PlayerPhoto playerId={p.id} name={name} eager size="lg" />
                    </div>
                    <figcaption className="px-0.5 py-[6%] text-ink">
                      <span className="display block truncate text-[clamp(1rem,2.2vw,1.45rem)] leading-none">
                        <span className="sm:hidden">{name.split(" ").slice(-1)[0]}</span>
                        <span className="hidden sm:inline">{name}</span>
                      </span>
                      <span className="mt-1 hidden text-[11px] font-semibold text-muted sm:block">{roleLabel(p, found.role)}</span>
                    </figcaption>
                  </div>
                </motion.figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

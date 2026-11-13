import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/hero/HeroSection";
import { TeamIntroduction } from "./components/teams/TeamIntroduction";
import { SquadExplorer } from "./components/squad/SquadExplorer";
import { SquadInsights } from "./components/insights/SquadInsights";
import { PlayerProfileModal } from "./components/player/PlayerProfileModal";
import type { Role, TeamId } from "./types";

export default function App() {
  const [team, setTeam] = useState<TeamId>("team01");
  const [role, setRole] = useState<Role>("batters");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const explore = useCallback((t: TeamId) => {
    setTeam(t);
    setRole("batters");
    document.getElementById("squads")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <>
      <a
        href="#squads"
        className="sr-only z-[60] rounded-full bg-white px-4 py-2 font-bold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to squads
      </a>
      <Navbar />
      <main>
        <HeroSection onExplore={explore} />
        <TeamIntroduction onExplore={explore} />
        <SquadExplorer team={team} role={role} onTeam={setTeam} onRole={setRole} onOpen={setOpenIndex} />
        <SquadInsights />
      </main>
      <Footer />
      <AnimatePresence>
        {openIndex !== null && <PlayerProfileModal team={team} role={role} index={openIndex} onClose={close} onIndex={setOpenIndex} />}
      </AnimatePresence>
    </>
  );
}

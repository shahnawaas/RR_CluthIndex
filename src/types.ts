export type TeamId = "team01" | "team02";
export type Role = "batters" | "bowlers";
export type Scope = "all" | "ipl" | "t20i";

export interface Selection {
  selection: number;
  name: string;
  playerId: number;
  suppliedId: number | null;
  idStatus: "verified" | "resolved" | "conflict";
}

export type Selections = Record<TeamId, Record<Role, Selection[]>>;

export interface BattingStats {
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  outs: number;
  notOuts: number;
  average: number | null;
  strikeRate: number | null;
  highest: string;
  fifties: number;
  hundreds: number;
  fours: number;
  sixes: number;
  dotPct: number | null;
  boundaryPct: number | null;
}

export interface BowlingStats {
  matches: number;
  innings: number;
  legalBalls: number;
  overs: string;
  runs: number;
  wickets: number;
  economy: number | null;
  average: number | null;
  strikeRate: number | null;
  best: string;
  fourWickets: number;
  dotPct: number | null;
}

export interface PressureBatting {
  balls: number;
  runs: number;
  dismissals: number;
  matches: number;
  strikeRate: number | null;
  average: number | null;
  dotPct: number | null;
  boundaryPct: number | null;
}

export interface PressureBowling {
  legalBalls: number;
  runs: number;
  wickets: number;
  matches: number;
  economy: number | null;
  dotPct: number | null;
  strikeRate: number | null;
}

export interface Player {
  id: number;
  sourceName: string;
  battingHand: "LHB" | "RHB" | null;
  bowlingStyle: string | null;
  paceOrSpin: "Pace" | "Spin" | null;
  batting: Record<Scope, BattingStats | null>;
  bowling: Record<Scope, BowlingStats | null>;
  deathOvers: { ballsFaced: number; strikeRate: number | null; legalBalls: number; economy: number | null };
  pressure: { batting: PressureBatting | null; bowling: PressureBowling | null };
  allRounder: boolean;
}

export interface Finisher {
  id: number;
  name: string;
  strikeRate: number;
  balls: number;
}

export interface Insights {
  selections: number;
  uniquePlayers: number;
  uniqueBatters: number;
  uniqueBowlers: number;
  inBothTeams: string[];
  leftHandedBatters: string[];
  pace: string[];
  spin: string[];
  leftArmPace: string[];
  allRounders: string[];
  noIplInDataset: string[];
  finishers: Finisher[];
  finisherMinBalls: number;
}

export interface DatasetMeta {
  matches: number;
  deliveries: number;
  iplMatches: number;
  t20iMatches: number;
  firstDate: string;
  lastDate: string;
}

export interface TeamInfo {
  id: TeamId;
  number: string;
  title: string;
  description: string;
}

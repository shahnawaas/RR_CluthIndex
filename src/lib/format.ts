import type { Player, Role } from "../types";

/** Shown wherever a figure is missing from the source data. */
export const NA_LONG = "Not available in source data";
export const NA = "N/A";

export function num(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NA;
  return value.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function overs(legalBalls: number): string {
  const o = Math.floor(legalBalls / 6);
  const b = legalBalls % 6;
  return b ? `${o}.${b}` : `${o}`;
}

export function splitName(name: string): { first: string; last: string } {
  const parts = name.split(" ");
  if (parts.length === 1) return { first: "", last: name };
  // keep particles such as "de", "Ur" with the surname
  let i = parts.length - 1;
  while (i > 1 && /^(de|du|van|von|ur|al|bin)$/i.test(parts[i - 1])) i--;
  return { first: parts.slice(0, i).join(" "), last: parts.slice(i).join(" ") };
}

export function initials(name: string): string {
  const { first, last } = splitName(name);
  return `${first.charAt(0)}${last.split(" ").pop()!.charAt(0)}`.toUpperCase();
}

export function battingHand(p: Player): string | null {
  if (p.battingHand === "LHB") return "Left-hand bat";
  if (p.battingHand === "RHB") return "Right-hand bat";
  return null;
}

export function bowlingStyle(p: Player): string | null {
  if (!p.bowlingStyle) return null;
  const s = p.bowlingStyle.replace(/offbreak/i, "off-break").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Playing role from the data: all-rounder when the player has both a batting and a bowling sample of 300+ balls. */
export function roleLabel(p: Player, selectedAs: Role): string {
  if (p.allRounder) return "All-rounder";
  return selectedAs === "batters" ? "Batter" : "Bowler";
}

export function styleLine(p: Player, selectedAs: Role): string {
  const parts = selectedAs === "batters" ? [battingHand(p), p.allRounder ? bowlingStyle(p) : null] : [bowlingStyle(p), p.allRounder ? battingHand(p) : null];
  return parts.filter(Boolean).join(", ") || NA_LONG;
}

export function longDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

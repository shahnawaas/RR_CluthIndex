"""Build the dashboard's static data files from the project's analysis outputs.

Run from the project root with the project's Python environment:
    venv\\Scripts\\python.exe frontend\\scripts\\build_data.py

Reads (read-only):
    Data/competition_team_player_mapping.csv       identity checks (names and IDs)
    outputs/analysis_deliveries_ipl_t20i_2022plus.csv  ball-by-ball (IPL + T20I, 2022 onwards)
    outputs/batter_pressure_stats.csv, outputs/bowler_pressure_stats.csv  pressure-situation totals
    reports/player_data_verification.csv            batting hand / bowling style
Writes:
    frontend/src/data/selections.json, players.json, insights.json, meta.json
    frontend/docs/player_verification.csv, frontend/docs/player_verification.md

The approved selections below decide who appears and in what order. Analysis outputs
only supply statistics; they never add, remove or reorder players.
"""
import json
import math
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
FE = ROOT / "frontend"
OUT_DATA = FE / "src" / "data"
OUT_DOCS = FE / "docs"
NA = "Not available in source data"

# ---- Approved selections (user's lists; supplied IDs kept exactly as given) ----
T1_BAT = [("Tilak Varma", 7897), ("Dhruv Jurel", 7260), ("Reeza Hendricks", 768), ("Kamindu Mendis", 4904),
          ("Sai Sudharsan", 23450), ("Suryakumar Yadav", 1699), ("Riyan Parag", 6423), ("Towhid Hridoy", 6651),
          ("Ravindra Jadeja", 152), ("Shreyas Iyer", 3647)]
T1_BOWL = [("Wanindu Hasaranga", 4900), ("Bhuvneshwar Kumar", 360), ("Jasprit Bumrah", 2933), ("Sunil Narine", None),
           ("Lockie Ferguson", 4692), ("Axar Patel", 2876), ("Joshua Little", 4807), ("Mitchell Starc", 829),
           ("Nathan Ellis", 7920), ("Mark Wood", 2985)]
T2_BAT = [("Reeza Hendricks", 768), ("Cameron Green", 5939), ("Kamindu Mendis", 4904), ("Towhid Hridoy", 6651),
          ("Jonny Bairstow", 1205), ("Daryl Mitchell", 4106), ("Harry Tector", 4812), ("Matthew Short", 3727),
          ("Tim Seifert", 3700), ("Quinton de Kock", 2161)]
T2_BOWL = [("Wanindu Hasaranga", 4900), ("Lockie Ferguson", 4692), ("Joshua Little", 4807), ("Matheesha Pathirana", 8661),
           ("Spencer Johnson", 6354), ("Marcus Stoinis", 2639), ("Jacob Duffy", 22920), ("Mohsin Khan", 6669),
           ("Mujeeb Ur Rahman", 6450), ("Mustafizur Rahman", 4373)]
SELECTIONS = {("team01", "batters"): T1_BAT, ("team01", "bowlers"): T1_BOWL,
              ("team02", "batters"): T2_BAT, ("team02", "bowlers"): T2_BOWL}


def clean(x, nd=2):
    """JSON-safe number: None for NaN/inf, rounded floats, plain ints."""
    if x is None:
        return None
    if isinstance(x, (int,)) and not isinstance(x, bool):
        return int(x)
    try:
        f = float(x)
    except (TypeError, ValueError):
        return x
    if math.isnan(f) or math.isinf(f):
        return None
    return int(f) if f.is_integer() and nd == 0 else round(f, nd)


# ---- Load sources ----
mapping = pd.read_csv(ROOT / "Data" / "competition_team_player_mapping.csv")
names_by_id = mapping.groupby("player_id").player_name.agg(lambda s: sorted(set(s)))
d = pd.read_csv(ROOT / "outputs" / "analysis_deliveries_ipl_t20i_2022plus.csv", low_memory=False)
for c in ["is_legal_ball", "is_ball_faced", "is_four", "is_six", "bowler_wicket"]:
    d[c] = d[c].astype(str).str.lower().eq("true")
d["scope"] = d.competition_group.map({"IPL": "ipl", "T20I": "t20i"})
assert d.scope.notna().all(), "unexpected competition group"
bat_p = pd.read_csv(ROOT / "outputs" / "batter_pressure_stats.csv").set_index("player_id")
bowl_p = pd.read_csv(ROOT / "outputs" / "bowler_pressure_stats.csv").set_index("player_id")
ver = pd.read_csv(ROOT / "reports" / "player_data_verification.csv").drop_duplicates("verified_id").set_index("verified_id")

# ---- 1. Verify IDs ----
ver_rows = []
resolved = {}
for (team, role), items in SELECTIONS.items():
    for slot, (name, sid) in enumerate(items, start=1):
        src_names = names_by_id.get(sid, []) if sid is not None else []
        exact = mapping[mapping.player_name.str.lower() == name.lower()].player_id.unique()
        if sid is not None and src_names:
            vid = sid
            if name in src_names:
                status, note = "verified", "ID and name match source"
            else:
                status, note = "verified", f"ID matches; source name is '{src_names[0]}'"
        elif sid is None:
            assert len(exact) == 1, f"cannot uniquely resolve {name}"
            vid = int(exact[0])
            status, note = "resolved", f"No ID supplied; unique exact-name match in source gives {vid}"
        else:
            assert len(exact) == 1, f"cannot uniquely resolve {name}"
            vid = int(exact[0])
            status, note = "conflict", (f"Supplied ID {sid} does not exist in any source file; source lists "
                                        f"'{name}' only under ID {vid}. Statistics use {vid}; please confirm.")
        resolved[(team, role, slot)] = vid
        ver_rows.append(dict(team=team, role=role, selection=slot, player=name,
                             supplied_id=sid if sid is not None else "", verified_id=vid,
                             source_name=names_by_id.get(vid, [""])[0], id_status=status, id_note=note))


# ---- 2. Statistics ----
def batting(df, pid):
    faced = df[df.striker_id == pid]
    inns_keys = pd.concat([faced[["match_id", "innings"]], df[df.batter_dismissed_id == pid][["match_id", "innings"]]]).drop_duplicates()
    if inns_keys.empty:
        return None
    balls = int(faced.is_ball_faced.sum())
    runs = int(faced.runs.sum())
    outs = int((df.batter_dismissed_id == pid).sum())
    per = faced.groupby(["match_id", "innings"]).runs.sum()
    outs_per = df[df.batter_dismissed_id == pid].groupby(["match_id", "innings"]).size()
    per = per.reindex(pd.MultiIndex.from_frame(inns_keys), fill_value=0)
    hs_key = per.idxmax()
    hs = int(per.max())
    hs_not_out = hs_key not in outs_per.index
    f4, f6 = int((faced.is_four).sum()), int((faced.is_six).sum())
    dots = int((faced.is_ball_faced & (faced.runs == 0)).sum())
    return dict(matches=int(inns_keys.match_id.nunique()), innings=int(len(inns_keys)), runs=runs, balls=balls,
                outs=outs, notOuts=int(len(inns_keys) - outs),
                average=clean(runs / outs) if outs else None, strikeRate=clean(100 * runs / balls) if balls else None,
                highest=f"{hs}{'*' if hs_not_out else ''}", fifties=int(((per >= 50) & (per < 100)).sum()),
                hundreds=int((per >= 100).sum()), fours=f4, sixes=f6,
                dotPct=clean(100 * dots / balls, 1) if balls else None,
                boundaryPct=clean(100 * (f4 + f6) / balls, 1) if balls else None)


def bowling(df, pid):
    b = df[df.bowler_id == pid]
    if b.empty:
        return None
    legal = int(b.is_legal_ball.sum())
    runs = int(b.bowler_runs_conceded.sum())
    wk = int(b.bowler_wicket.sum())
    inns = b.groupby(["match_id", "innings"]).agg(w=("bowler_wicket", "sum"), r=("bowler_runs_conceded", "sum"))
    best = inns.sort_values(["w", "r"], ascending=[False, True]).iloc[0]
    dots = int((b.is_legal_ball & (b.bowler_runs_conceded == 0)).sum())
    return dict(matches=int(b.match_id.nunique()), innings=int(len(inns)), legalBalls=legal,
                overs=f"{legal // 6}.{legal % 6}" if legal % 6 else str(legal // 6), runs=runs, wickets=wk,
                economy=clean(6 * runs / legal) if legal else None, average=clean(runs / wk) if wk else None,
                strikeRate=clean(legal / wk, 1) if wk else None, best=f"{int(best.w)}/{int(best.r)}",
                fourWickets=int((inns.w >= 4).sum()), dotPct=clean(100 * dots / legal, 1) if legal else None)


DEATH = d.legal_balls_before >= 90  # overs 16-20 (same definition as the analysis)
players = {}
for vid in sorted(set(resolved.values())):
    v = ver.loc[vid]
    rec = dict(id=int(vid), sourceName=names_by_id[vid][0], battingHand=v.batting_hand if isinstance(v.batting_hand, str) else None,
               bowlingStyle=v.bowling_type if isinstance(v.bowling_type, str) else None,
               paceOrSpin=v.pace_or_spin if isinstance(v.pace_or_spin, str) else None)
    rec["batting"] = {s: batting(d if s == "all" else d[d.scope == s], vid) for s in ["all", "ipl", "t20i"]}
    rec["bowling"] = {s: bowling(d if s == "all" else d[d.scope == s], vid) for s in ["all", "ipl", "t20i"]}
    dd = d[DEATH]
    fb = dd[dd.striker_id == vid]
    fbb = int(fb.is_ball_faced.sum())
    db = dd[dd.bowler_id == vid]
    dl = int(db.is_legal_ball.sum())
    rec["deathOvers"] = dict(ballsFaced=fbb, strikeRate=clean(100 * fb.runs.sum() / fbb) if fbb else None,
                             legalBalls=dl, economy=clean(6 * db.bowler_runs_conceded.sum() / dl) if dl else None)
    pb = bat_p.loc[vid] if vid in bat_p.index else None
    pw = bowl_p.loc[vid] if vid in bowl_p.index else None
    rec["pressure"] = dict(
        batting=None if pb is None else dict(balls=int(pb.balls), runs=int(pb.runs), dismissals=int(pb.dismissals),
                                             matches=int(pb.pressure_matches), strikeRate=clean(pb.strike_rate),
                                             average=clean(pb.runs / pb.dismissals) if pb.dismissals else None,
                                             dotPct=clean(pb.dot_pct, 1), boundaryPct=clean(pb.boundary_pct, 1)),
        bowling=None if pw is None else dict(legalBalls=int(pw.legal_balls), runs=int(pw.runs_conceded),
                                             wickets=int(pw.wickets), matches=int(pw.pressure_matches),
                                             economy=clean(pw.economy), dotPct=clean(pw.dot_pct, 1),
                                             strikeRate=clean(pw.bowling_strike_rate, 1) if pw.wickets else None))
    fa, ba = rec["batting"]["all"], rec["bowling"]["all"]
    faced, bowled = (fa or {}).get("balls", 0), (ba or {}).get("legalBalls", 0)
    rec["allRounder"] = bool(faced >= 300 and bowled >= 300)
    players[int(vid)] = rec

# Cross-check against the already-verified project file (same accounting must give same totals).
for vid, rec in players.items():
    v = ver.loc[vid]
    fa, ba = rec["batting"]["all"] or {}, rec["bowling"]["all"] or {}
    assert fa.get("runs", 0) == int(v.bat_runs) and fa.get("balls", 0) == int(v.bat_balls) and fa.get("outs", 0) == int(v.bat_outs), vid
    assert ba.get("legalBalls", 0) == int(v.bowl_legal) and ba.get("wickets", 0) == int(v.bowl_wkts) and ba.get("runs", 0) == int(v.bowl_runs), vid

# ---- 3. Selections, photos, team membership ----
img_dir = FE / "images"
photos = {p.stem: p.name for p in img_dir.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png"}} if img_dir.exists() else {}
selections = {}
for (team, role), items in SELECTIONS.items():
    selections.setdefault(team, {})[role] = [
        dict(selection=slot, name=name, playerId=resolved[(team, role, slot)],
             suppliedId=sid, idStatus=next(r["id_status"] for r in ver_rows if r["team"] == team and r["role"] == role and r["selection"] == slot))
        for slot, (name, sid) in enumerate(items, start=1)]
teams_of = {}
for team, roles in selections.items():
    for role, items in roles.items():
        for it in items:
            teams_of.setdefault(it["playerId"], set()).add(team)
for r in ver_rows:
    vid = r["verified_id"]
    p = players[vid]
    fa, ba = p["batting"]["all"], p["bowling"]["all"]
    r["photo_file"] = photos.get(str(vid), "")
    r["photo_status"] = "found" if r["photo_file"] else "missing - placeholder shown"
    if not r["photo_file"] and r["supplied_id"] != "" and str(r["supplied_id"]) in photos:
        r["photo_status"] += f" (a file named {photos[str(r['supplied_id'])]} exists under the supplied ID; rename to {vid} to use it)"
    r["in_both_teams"] = len(teams_of[vid]) > 1
    r["balls_faced"] = (fa or {}).get("balls", 0)
    r["legal_balls_bowled"] = (ba or {}).get("legalBalls", 0)
    r["ipl_data"] = "yes" if (p["batting"]["ipl"] or p["bowling"]["ipl"]) else "no IPL matches in dataset"
    r["t20i_data"] = "yes" if (p["batting"]["t20i"] or p["bowling"]["t20i"]) else "no T20I matches in dataset"
    r["pressure_stats"] = ("batting" if p["pressure"]["batting"] else "") + (" bowling" if p["pressure"]["bowling"] else "")
    r["all_rounder_by_data"] = p["allRounder"]
    r["batting_hand"], r["bowling_style"] = p["battingHand"] or NA, p["bowlingStyle"] or NA

unused_photos = sorted(set(photos) - {str(v) for v in players})

# ---- 4. Insights (computed only from the records above) ----
uniq = list(players.values())
bat_ids = {it["playerId"] for t in selections.values() for it in t["batters"]}
bowl_ids = {it["playerId"] for t in selections.values() for it in t["bowlers"]}
bowlers = [players[i] for i in sorted(bowl_ids)]
batters = [players[i] for i in sorted(bat_ids)]
name_of = {it["playerId"]: it["name"] for t in selections.values() for r in t.values() for it in r}
finishers = sorted([dict(id=p["id"], name=name_of[p["id"]], strikeRate=p["deathOvers"]["strikeRate"], balls=p["deathOvers"]["ballsFaced"])
                    for p in batters if p["deathOvers"]["ballsFaced"] >= 100], key=lambda x: -x["strikeRate"])
insights = dict(
    selections=40, uniquePlayers=len(uniq), uniqueBatters=len(bat_ids), uniqueBowlers=len(bowl_ids),
    inBothTeams=sorted([name_of[i] for i, t in teams_of.items() if len(t) > 1]),
    leftHandedBatters=sorted([name_of[p["id"]] for p in batters if p["battingHand"] == "LHB"]),
    pace=sorted([name_of[p["id"]] for p in bowlers if p["paceOrSpin"] == "Pace"]),
    spin=sorted([name_of[p["id"]] for p in bowlers if p["paceOrSpin"] == "Spin"]),
    leftArmPace=sorted([name_of[p["id"]] for p in bowlers if p["paceOrSpin"] == "Pace" and (p["bowlingStyle"] or "").startswith("Left")]),
    allRounders=sorted([name_of[p["id"]] for p in uniq if p["allRounder"]]),
    noIplInDataset=sorted([name_of[p["id"]] for p in uniq if not (p["batting"]["ipl"] or p["bowling"]["ipl"])]),
    finishers=finishers, finisherMinBalls=100)

meta = dict(matches=int(d.match_id.nunique()), deliveries=int(len(d)),
            iplMatches=int(d[d.scope == "ipl"].match_id.nunique()), t20iMatches=int(d[d.scope == "t20i"].match_id.nunique()),
            firstDate=str(d.match_date.min())[:10], lastDate=str(d.match_date.max())[:10])

OUT_DATA.mkdir(parents=True, exist_ok=True)
OUT_DOCS.mkdir(parents=True, exist_ok=True)
json.dump(selections, open(OUT_DATA / "selections.json", "w", encoding="utf-8"), indent=1)
json.dump({str(k): v for k, v in players.items()}, open(OUT_DATA / "players.json", "w", encoding="utf-8"), indent=1)
json.dump(insights, open(OUT_DATA / "insights.json", "w", encoding="utf-8"), indent=1)
json.dump(meta, open(OUT_DATA / "meta.json", "w", encoding="utf-8"), indent=1)

vr = pd.DataFrame(ver_rows)
vr.to_csv(OUT_DOCS / "player_verification.csv", index=False)
lines = ["# Player verification report", "",
         f"Generated by `scripts/build_data.py`. Data scope: IPL + T20I matches from {meta['firstDate']} to {meta['lastDate']} "
         f"({meta['matches']:,} matches: {meta['iplMatches']} IPL, {meta['t20iMatches']} T20I; {meta['deliveries']:,} deliveries). "
         "These are not career figures.", "",
         "| Team | Role | # | Player | Supplied ID | Verified ID | ID status | Photo | IPL data |", "|---|---|---:|---|---:|---:|---|---|---|"]
for r in ver_rows:
    lines.append(f"| {r['team']} | {r['role']} | {r['selection']} | {r['player']} | {r['supplied_id']} | {r['verified_id']} | "
                 f"{r['id_status']} | {r['photo_status']} | {r['ipl_data']} |")
lines += ["", "## Items needing review", ""]
for r in ver_rows:
    if r["id_status"] != "verified" or "source name" in r["id_note"]:
        lines.append(f"- {r['team']} {r['role']} #{r['selection']} {r['player']}: {r['id_note']}")
for r in {x["verified_id"]: x for x in ver_rows if not x["photo_file"]}.values():
    lines.append(f"- Photo missing for {r['player']} ({r['verified_id']}): {r['photo_status']}")
for u in unused_photos:
    lines.append(f"- images/{photos[u]} does not match any selected player's verified ID (source name: "
                 f"{names_by_id.get(int(u), ['not in source'])[0] if u.isdigit() else 'n/a'}); it is not displayed.")
lines += ["", "## Unavailable statistics", "",
          "- Players with no IPL matches in the dataset show 'Not available in source data' for IPL-only figures: "
          + ", ".join(insights["noIplInDataset"]) + ".",
          "- Batting average and bowling average/strike rate are unavailable where there are no dismissals/wickets.",
          "- Wicketkeeping and fielding are not recorded in the dataset, so they are not shown."]
(OUT_DOCS / "player_verification.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

print(json.dumps(meta))
print(vr[vr.id_status != "verified"][["team", "role", "selection", "player", "supplied_id", "verified_id", "id_status"]].to_string())
print("photos missing:", sorted({(r['player'], r['verified_id']) for r in ver_rows if not r['photo_file']}))
print("unused photos:", unused_photos)
print(json.dumps({k: v for k, v in insights.items() if k != "finishers"}))
print(insights["finishers"])

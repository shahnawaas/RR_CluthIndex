# Royal Night: Rajasthan Royals IPL 2027 Player Selection Dashboard

A data-driven cricket analytics dashboard that presents two player selection groups for a Rajasthan Royals IPL 2027 squad:

- **Team 01, Performance Leaders**: *"Players selected through pressure performance, consistency, and cricket statistics."*
- **Team 02, Auction Prospects**: *"A researched selection of potential external player options for Rajasthan Royals IPL 2027."*

Visitors can browse both selections, open a profile for each player, compare IPL and T20I statistics, look at performance in high-pressure situations, and read a short analysis of the combined squad. It is a static frontend: there is no backend, database, login or external API.

> This is an independent hackathon project. It is not affiliated with or endorsed by Rajasthan Royals or the IPL.

---

## Contents

- [Key features](#key-features)
- [Technology stack](#technology-stack)
- [Dashboard structure](#dashboard-structure)
- [Data and methodology](#data-and-methodology)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Data generation](#data-generation)
- [Production build](#production-build)
- [Deploying to Vercel](#deploying-to-vercel)
- [Player images](#player-images)
- [Privacy and repository safety](#privacy-and-repository-safety)
- [Limitations](#limitations)
- [Screenshots](#screenshots)
- [License](#license)

---

## Key features

**Design**
- "Royal Night" visual identity: deep navy, Royal Pink (`#E84B91`) and gold (`#D7B66D`), with the Big Shoulders Display and Manrope typefaces.
- A hero section with three fanned player photo frames over a drawn pink day-night cricket ball with its stitched seam.
- One coordinated page-load animation in the hero. Elsewhere, motion only responds to what the user does. Every animation respects `prefers-reduced-motion`.
- Responsive layouts, checked at 375, 768, 1280 and 1536 px widths.

**Selections**
- Two teams of 20 selections each, 40 entries in total. Six players appear in both teams on purpose, so there are 34 different players.
- Team tabs and **Batters / Bowlers** tabs, which stay pinned below the navigation bar while you scroll the squad.
- Player cards showing:
  - photo
  - selection number (1–10)
  - role and batting or bowling style
  - three headline statistics
  - data-scope label
  - a note when the player is also in the other team
  - a **View stats** button

**Player profiles**
- A modal on desktop and a full-height sheet on mobile.
- Key figures, plus a by-competition table with separate **IPL**, **T20I** and **Combined** columns.
- An **Under pressure** section, with each figure shown next to the player's overall equivalent.
- An **Overs 16 to 20** summary: strike rate for batters, economy for bowlers.
- Previous / next navigation within the current team and category. It wraps at both ends and also works with the ← and → keys.
- Closes with the close button, the Escape key or a click on the backdrop.

**Squad insights**
- The number of different players across the 40 selections.
- A horizontal bar chart of strike rate in overs 16–20 for selected batters with at least 100 balls faced in those overs, coloured by team.
- Short evidence-based notes on pace and spin resources, left-handed batting, all-round options and players with T20I-only records.

**Robustness and accessibility**
- A designed placeholder (initials over the ball-seam motif) when a player has no photo.
- Keyboard support:
  - a skip link
  - tabs that follow the ARIA tabs pattern, with arrow-key, Home and End support
  - focus kept inside the open dialog, and returned to the card that opened it
  - visible focus outlines throughout
- A compact menu on mobile.

---

## Technology stack

| Technology | Version | Role |
|---|---|---|
| [React](https://react.dev) | 18.3 | UI components and state |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Static typing (strict mode) |
| [Vite](https://vite.dev) | 6.3 | Dev server and production bundler |
| [Tailwind CSS](https://tailwindcss.com) | 4.1 | Styling; design tokens defined with `@theme` in `src/index.css` |
| [Motion](https://motion.dev) | 11.18 | Hero sequence, tab indicators and modal transitions |
| [Lucide React](https://lucide.dev) | 0.511 | Interface icons (menu, close, chevrons, download) |
| [Fontsource](https://fontsource.org) | 5.3 | Self-hosted Big Shoulders Display and Manrope variable fonts, so no font requests go to third parties |

The strike-rate chart is plain HTML and CSS, so there is no charting library. A small Python script (pandas) generates the data files. It runs only in the original analysis environment; see [Data generation](#data-generation).

---

## Dashboard structure

The dashboard is a single page with six parts:

1. **Hero**: the headline *"Building the Rajasthan Royals of 2027."*, a one-line summary, three player photos and two buttons that jump to each team.
2. **Team introduction**: side-by-side panels for the two teams. Each has its description, a short note, "10 batters / 10 bowlers" photo strips and an Explore button. A line underneath lists the players who appear in both teams.
3. **Squad explorer**: team and category tabs over a grid of 10 player cards. The grid has five columns on wide screens, four on laptops, three on tablets and two on phones.
4. **Player profiles**: the detailed statistics view described under [Key features](#key-features).
5. **Squad insights**: the squad-composition analysis and the strike-rate chart.
6. **Footer / About**: the project description, the data scope and dataset size, and a link to the full report.

### The two teams

| | Team 01: Performance Leaders | Team 02: Auction Prospects |
|---|---|---|
| Purpose | Players who have performed in tight, high-pressure situations, backed by their wider record | External options Rajasthan Royals could pursue at the 2027 auction |
| Current RR players | May be included | Deliberately excluded |
| Composition | 10 batters, 10 bowlers | 10 batters, 10 bowlers |

**Selection numbers are not rankings.** The numbers 1 to 10 show the order in which the players were selected. Both lists were chosen and ordered by hand. The dashboard shows them exactly as approved and never re-sorts them by any statistic.

---

## Data and methodology

### Scope

All statistics come from **837 IPL and T20I matches** played between **22 January 2022 and 1 November 2026**:
- 367 IPL matches
- 470 T20I matches
- 193,988 deliveries

**They are not career records.** Any match outside that window or those two competitions is not counted.

| Label in the UI | Meaning |
|---|---|
| **IPL** | IPL matches only |
| **T20I** | T20 internationals only |
| **Combined** | IPL and T20I together (the "IPL and T20I, 2022 to 2026" figures on cards) |
| **Under pressure** | Totals from deliveries the original analysis classed as high-pressure match situations, for example close run chases and the death overs. Only the resulting totals are included here, not the classification code |
| **Overs 16 to 20** | Deliveries bowled after at least 90 legal balls of the innings, which is the last five overs of a full innings |

### How the figures are calculated
- **Batting:**
  - Runs are credited to the striker.
  - Balls faced exclude wides.
  - Average is runs per dismissal.
  - Strike rate is runs per 100 balls.
  - A highest score marked `*` was not out.
  - Fifties count innings of 50–99 runs.
- **Bowling:**
  - Overs are counted from legal deliveries.
  - Runs conceded are the runs charged to the bowler.
  - Only wickets credited to the bowler count.
  - Best figures are the innings with the most wickets, then the fewest runs.
- **Dot-ball %** is the share of balls faced, or legal balls bowled, from which no runs were scored (or, for a bowler, conceded).
- **Role:** a player is labelled **All-rounder** when they have both faced and bowled at least 300 balls in this data; otherwise **Batter** or **Bowler**, by the category they were selected in. A player keeps their position in the list they were selected for whatever their label.

### Missing data
Values are **never invented**.
- In tables, a statistic that doesn't exist in the source shows as **N/A** (not available in source data). For example, a batting average with no dismissals, or the IPL column for a player with no IPL matches in the data.
- Where a whole detail is missing, such as an unknown bowling style, the text reads *"Not available in source data"*.

---

## Project structure

```text
frontend/
├── docs/
│   ├── player_verification.csv     # ID, photo and data checks for all 40 selections
│   └── player_verification.md      # The same report in readable form
├── images/                         # Player photos, named <verified player ID>.jpg|jpeg|png
├── public/
│   └── favicon.svg
├── scripts/
│   └── build_data.py               # Generates src/data/*.json from the original analysis
├── src/
│   ├── components/
│   │   ├── hero/                   # HeroSection, PinkBall (animated SVG ball and seam)
│   │   ├── insights/               # SquadInsights and the strike-rate chart
│   │   ├── layout/                 # Navbar, Footer
│   │   ├── player/                 # PlayerPhoto (with placeholder), PlayerProfileModal, StatsTable
│   │   ├── squad/                  # SquadExplorer, PlayerCard, team and category tabs
│   │   └── teams/                  # TeamIntroduction
│   ├── data/
│   │   ├── index.ts                # Typed access to the data, team names and descriptions
│   │   ├── selections.json         # Approved lists: team → category → ordered selections
│   │   ├── players.json            # One statistics record per player
│   │   ├── insights.json           # Squad-composition figures
│   │   └── meta.json               # Dataset size and date range
│   ├── hooks/                      # useMediaQuery, useScrolledPast
│   ├── lib/                        # Photo lookup, number formatting, local report link
│   ├── App.tsx                     # Page composition and shared state
│   ├── index.css                   # Tailwind import and design tokens
│   ├── main.tsx                    # Entry point and font imports
│   └── types.ts                    # Shared TypeScript types
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

| Folder | Purpose |
|---|---|
| `src/components/` | UI components, grouped by page section |
| `src/data/` | Generated static JSON plus a typed accessor module. This is the only data the site uses at runtime |
| `scripts/` | The offline data generator, which isn't needed to run or build the site |
| `images/` | Player photographs, matched to players by file name |
| `public/` | Static files copied to the build as they are |
| `docs/` | The data verification report |

Folders created locally but not committed: `node_modules/`, `dist/` and `private/`.

---

## Getting started

**Requirements:** [Node.js](https://nodejs.org) 18 or later. The project was developed on Node 22.

```powershell
git clone YOUR_REPOSITORY_URL
cd YOUR_REPOSITORY        # add \frontend if the dashboard sits in a subfolder of the repository
npm install
npm run dev
```

Vite prints a local address, by default **http://localhost:5173**. Changes to the source reload in the browser straight away.

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run typecheck` | Runs the TypeScript compiler without emitting files |
| `npm run build` | Type-checks, then builds the production site into `dist/` |
| `npm run preview` | Serves the contents of `dist/` locally to test the production build |
| `npm run build:data` | Regenerates `src/data/*.json` (requires the original analysis project; see below) |

---

## Data generation

The JSON files in `src/data/` are committed, so **you don't need to regenerate them** to run, build or deploy the dashboard.

`scripts/build_data.py` produced them inside the original analysis project, of which this frontend is a subfolder. That project holds the ball-by-ball datasets and analysis outputs, which **are not part of this repository**. Without them, `npm run build:data` won't run. It also expects the parent project's Python virtual environment at `..\venv` (Windows path).

### Inputs (read-only, from the parent project)

| File | Used for |
|---|---|
| `Data/competition_team_player_mapping.csv` | Checking player IDs and names |
| `outputs/analysis_deliveries_ipl_t20i_2022plus.csv` | Ball-by-ball IPL and T20I data, January 2022 onwards, behind every batting, bowling and overs 16–20 figure |
| `outputs/batter_pressure_stats.csv`, `outputs/bowler_pressure_stats.csv` | Under-pressure totals |
| `reports/player_data_verification.csv` | Batting hand and bowling style, plus a cross-check of totals |

### Outputs

| File | Contents |
|---|---|
| `src/data/selections.json` | The approved lists, in approved order, with supplied and verified IDs |
| `src/data/players.json` | Per-player IPL, T20I and combined statistics, pressure totals and overs 16–20 figures |
| `src/data/insights.json` | Squad-composition facts for the insights section |
| `src/data/meta.json` | Match and delivery counts and the date range |
| `docs/player_verification.csv` and `.md` | The verification report |

### Verification steps

1. **Selections are fixed in the script.** The approved team lists, with the IDs supplied for each player, are written directly into `build_data.py`. Analysis outputs provide statistics only; they never add, remove or reorder players.
2. **IDs are checked against the source mapping.**
   - **Verified:** the supplied ID exists in the mapping.
   - **Resolved:** no ID was supplied, and a unique exact-name match was found.
   - **Conflict:** the supplied ID doesn't exist and the player was found by a unique exact-name match. Conflicts are flagged in the report rather than silently fixed.
   - If a name can't be matched uniquely, the script stops instead of guessing.
3. **Totals are cross-checked.** Every player's runs, balls faced, dismissals, legal balls bowled, runs conceded and wickets are compared with the project's existing verification file, and the build stops on any difference.
4. **Photos are checked.** Each player is checked for a matching photo. Missing photos and image files that don't match a selected player are listed in the report.

---

## Production build

```powershell
npm run typecheck   # optional: npm run build already runs this
npm run build
npm run preview     # optional: serve dist/ at http://localhost:4173
```

Vite writes a fully static site to `dist/`: `index.html`, hashed JavaScript and CSS, fonts and the player photos. The result can be hosted on any static file host and needs no environment variables or server code.

---

## Deploying to Vercel

These steps haven't been run for this project yet; they describe the standard Vite workflow.

1. Push the repository to GitHub. It must include `src/`, `src/data/*.json`, `images/`, `public/`, `index.html`, `package.json`, `package-lock.json`, `tsconfig.json` and `vite.config.ts`.
2. In Vercel, choose **Add New → Project** and import the GitHub repository.
3. Use these settings:

   | Setting | Value |
   |---|---|
   | Framework Preset | Vite |
   | Root Directory | `frontend` if the dashboard is a subfolder of the repository; leave it as the repository root if this folder *is* the repository |
   | Install Command | `npm install` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. Deploy. Vercel then rebuilds automatically each time you push to the connected branch.

The deployed site has no access to the private report, so its footer shows *"The full report is kept private. It is available on request."*

---

## Player images

Photos are matched to players **strictly by verified player ID**.

| Rule | Detail |
|---|---|
| Location | `images/` |
| File name | `<verified player ID>.<extension>`, e.g. `7897.jpg`, `7260.png`, `768.jpeg` |
| Formats | JPG, JPEG, PNG (all-lowercase or all-uppercase extensions); if several exist for one ID, `.jpg` wins, then `.jpeg`, then `.png` |
| Missing photo | A designed placeholder with the player's initials and "Photo to be added" |
| Fallback | None. A different player's photo is never shown |

**To add a photo:**
1. Find the player's verified ID in `docs/player_verification.md`.
2. Save the image as `images/<ID>.jpg`, `.jpeg` or `.png`.
3. Refresh the browser. If the photo still does not appear (file watching can miss renames on Windows), restart `npm run dev`. For production, rebuild. No code changes are needed.

Portrait headshots with the face in the upper part of the frame crop best. Cards use a 4:5 frame, and per-player crop adjustments are set in `src/lib/photos.ts`.

> **Check every photo by eye.** The file name is the only link between an image and a player. Nothing checks that the face in a photo belongs to that player, so a wrongly named file will show the wrong person.

---

## Privacy and repository safety

- **Private report:** the full PDF report lives only in `private/`, which `.gitignore` excludes (`/private/`).
  - It is never imported into the bundle, copied to `public/` or written to `dist/`.
  - It can be downloaded only from the local development server (`npm run dev`), and direct requests to `/private/...` are blocked there too.
  - To confirm the ignore rule: `git check-ignore -v private/<file>.pdf`
- **Original data:** the original datasets, notebooks and analysis outputs are not part of this repository or the deployed site. The site ships only the derived JSON statistics.
- **Secrets:** the project needs no API keys or environment variables. `.gitignore` excludes `*.local` files; if `.env` files are ever added, keep secrets out of version control.
- **What to publish:** only the source files and assets listed in [Project structure](#project-structure). `node_modules/` and `dist/` are ignored.

---

## Limitations

- **Statistics cover only 22 January 2022 to 1 November 2026**, and only IPL and T20I matches. They are not career figures.
- **Some players have no IPL records in this data**: Reeza Hendricks, Towhid Hridoy and Harry Tector. Their IPL columns show N/A.
- **Fielding and wicketkeeping aren't recorded** in the source data, so they aren't shown.
- **Photos depend on correct file names.** All 34 selected players currently have a photo. A player without a correctly named file shows a placeholder, and `docs/player_verification.md` lists any that are missing.
- **Auction availability isn't confirmed.** Including a player in Auction Prospects reflects research only; it doesn't mean the player is released, registered or available for the 2027 auction.
- **This is not an official product.** It is a frontend-only analytics presentation, not an official Rajasthan Royals or IPL product, and it is not affiliated with either.

---

## Screenshots

No screenshots are included in the repository yet. To add them:

1. Run `npm run dev` and capture each view at desktop and mobile widths.
2. Save them in a new `screenshots/` folder, for example:
   - `screenshots/hero.png`
   - `screenshots/team-selection.png`
   - `screenshots/player-profile.png`
   - `screenshots/squad-insights.png`
   - `screenshots/mobile-view.png`
3. Reference them here, for example `![Hero](screenshots/hero.png)`.

---

## License

No open-source license has been declared for this project yet. Until one is added, all rights are reserved by the author. Player photographs may belong to third parties and are not covered by any license in this repository.

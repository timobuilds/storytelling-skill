# Storyteller Skills Plugin

Portable [Agent Skills](https://agentskills.io) plugin based on **Storyteller Tactics** frameworks.

**Front door:** `storyteller-start` — diagnoses your goal, routes to a recipe, drafts a story brief.  
**Recipes:** `stories-that-sell` · `motivate` · `convince` · `connect` · `explain` · `lead` · `impress`  
**Reference:** `storyteller-tactics` — arcs, cards, glossary (not the starting skill for vague asks)

Every recipe is **draft-first**: filled brief + `TBD`s, then you react — not a blank questionnaire. Each recipe ships a **fictional exemplar** so agents match density and shape (not the fake facts).

## Install (npm)

```bash
npm install storyteller-skills
```

Install hooks (`postinstall` / `prepare`) symlink all 9 skills into the project’s agent dirs:

- `.cursor/skills/`
- `.claude/skills/`
- `.codex/skills/`
- `.agents/skills/`

If hooks were skipped (some npm configs use `--ignore-scripts`), run:

```bash
npx storyteller-skills
# or
npm run sync --prefix node_modules/storyteller-skills
```

Globals (`~/.cursor/skills`, `~/.claude/skills`, …):

```bash
npx storyteller-skills --global
# or
STORYTELLER_SKILLS_GLOBAL=1 npm install storyteller-skills
```

### Before the package is on the registry

```bash
# Develop / use this repo
cd storytelling-skill && npm install

# Another project — local path
npm install /path/to/storytelling-skill --foreground-scripts
npx storyteller-skills   # if links didn’t appear

# Or from GitHub
npm install github:timobuilds/storytelling-skill --foreground-scripts
```

### Alternative: skills CLI (Git)

```bash
npx skills add timobuilds/storytelling-skill --skill '*' -y
npx skills add timobuilds/storytelling-skill -g --skill '*' -y
```

### Sync via skills CLI from node_modules

```bash
npm install storyteller-skills
npx skills experimental_sync -y
```

### ChatGPT

Upload folders under `skills/` (each must contain `SKILL.md`). Prefer `storyteller-start`, the recipe you need, and `storyteller-tactics`.

## Skills

| Skill | When to use | Artifact |
|--------|-------------|----------|
| `storyteller-start` | Vague “help me tell a story” / where do I start? | Story Intake → routes |
| `stories-that-sell` | Sell, convert, case study, POPP pitch | Sales Story Brief |
| `stories-that-motivate` | Buy-in, change, leap of faith | Motivation Story Brief |
| `stories-that-convince` | Expertise, research readout, sticky facts | Convince Story Brief |
| `stories-that-connect` | Empathy, user research, walk in their shoes | Connect Story Brief |
| `stories-that-explain` | Strategy narrative people will actually read | Explain Story Brief |
| `stories-that-lead` | Team culture, how we work, thoughtful failures | Lead Story Brief |
| `stories-that-impress` | Keynote, deck, presentation | Impress Story Brief |
| `storyteller-tactics` | Named tactic only (Man in a Hole, Movie Time…) | Reference chapters |

## Usage

```
Use storyteller-start — I need a story for [situation]
```

Or jump straight:

```
Use stories-that-sell — here’s the product and the buyer…
```

## Layout

```
package.json
scripts/install.cjs          # postinstall + npx storyteller-skills
skills/
  storyteller-start/
  stories-that-*/            # seven recipes + templates + exemplars
  storyteller-tactics/       # doctrine, chapters, glossary
README.md
```

### Exemplars (fictional)

| Recipe | Scenario |
|--------|----------|
| Sell | Yard/gate-time SaaS → VP Ops |
| Motivate | DTC furniture 7-day delivery change |
| Convince | Hospital triage research readout |
| Connect | Barista trainer + scheduling tool |
| Explain | Returns-logistics strategy all-hands |
| Lead | Eng team after a bad permissions launch |
| Impress | Security summit talk on offboarding |

## Publish

1. Edit `repository` / `homepage` in `package.json` to your GitHub URL.
2. Ensure the name `storyteller-skills` is free (or rename / scope it, e.g. `@you/storyteller-skills`).
3. Then:

```bash
npm login
npm publish
```

Consumers:

```bash
npm install storyteller-skills
npx storyteller-skills   # optional re-sync
```

## Source & rights

Frameworks synthesized for agent use from *Storyteller Tactics* Volume I. Not a substitute for the original materials; do not redistribute card art.

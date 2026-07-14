# Storyteller Skills Plugin

Agent skills that help you **build product and startup stories** — pitches, strategy narratives, user-research stories, team buy-in, and demos — using Storyteller Tactics frameworks.

Not a writing style guide. A **draft-first workshop**: the agent diagnoses the job, fills a story brief, asks only what’s missing, and revises until you can say it out loud.

## What this is good for

| You’re doing… | This plugin helps you… |
|---------------|------------------------|
| **Startup storytelling** | Investor / customer / hire pitches that land problem → proof → ask |
| **Product strategy** | Make the “why this bet” narrative stick (not a 40-page roadmap PDF) |
| **Product development** | Turn research, tradeoffs, and failures into stories the team can share |
| **GTM / sales** | Case studies and POPP pitches grounded in someone-like-you proof |
| **Leadership / culture** | Change stories, blameless failure tales, “how we build” |
| **Demos & talks** | Presentations that movie-check and don’t read the slides |

**Use it when** you have raw material (customer quote, metric, roadmap conflict, research note) and need a story shape.  
**Don’t use it for** brand identity systems, ad creative ops, or generic copy polish with no narrative job.

## How it works

1. **`storyteller-start`** — front door. Infers your job → picks one recipe → drafts a brief.
2. **Recipe skills** — run the full stack for that job (sell, motivate, convince, connect, explain, lead, impress).
3. **`storyteller-tactics`** — shared reference (arcs, cards, glossary) when you name a tactic.

Every recipe is **draft-first**: filled brief + `TBD`s → you react → agent asks only blockers → revise.  
Exemplars are **fictional product/startup scenarios** — match density and shape, not the fake facts.

## Quick start

```
Use storyteller-start — I need a story for [product / startup situation]
```

Or jump straight:

```
Use stories-that-sell — design-partner case study for our PLG wedge
Use stories-that-explain — why we’re killing Feature X for this bet
Use stories-that-connect — synthesize these five user interviews
```

## Skills

| Skill | Product / startup use | Artifact |
|--------|----------------------|----------|
| `storyteller-start` | “Where do I start?” | Story Intake → routes |
| `stories-that-sell` | Customer / investor / design-partner pitch | Sales Story Brief |
| `stories-that-motivate` | Roadmap buy-in, risky bet, org change | Motivation Story Brief |
| `stories-that-convince` | Research readout, PM/insight → leadership | Convince Story Brief |
| `stories-that-connect` | User research, JTBD, empathy for builders | Connect Story Brief |
| `stories-that-explain` | Product strategy / “why this direction” | Explain Story Brief |
| `stories-that-lead` | Team culture, launch postmortems, how we build | Lead Story Brief |
| `stories-that-impress` | Demo day, board, all-hands, launch talk | Impress Story Brief |
| `storyteller-tactics` | Named tactic only (Man in a Hole, POPP…) | Reference chapters |

## Install

```bash
npm install github:timobuilds/storytelling-skill
```

That’s it. Postinstall links the skills into `.cursor/skills`, `.claude/skills`, `.codex/skills`, and `.agents/skills` in your project.

```bash
npm install -g github:timobuilds/storytelling-skill   # all your projects
```

## Exemplars (fictional — product / startup themed)

All gold samples use a fictional B2B product company so agents learn **startup and product narrative density**:

| Recipe | Scenario |
|--------|----------|
| Intake → Sell | Seed-stage workflow SaaS → design-partner VP Product |
| Motivate | Get eng + design buy-in to kill a beloved feature for the wedge |
| Convince | PM research readout: activation cliff isn’t “more onboarding tips” |
| Connect | Builder interview — PM who lives in spreadsheets between tools |
| Explain | Strategy all-hands: why we’re a workflow OS, not another dashboard |
| Lead | Product squad culture after a failed public beta |
| Impress | Demo-day / board talk: the Tuesday 4pm “status fiction” moment |

## Layout

```
package.json
scripts/install.cjs
skills/
  storyteller-start/
  stories-that-*/
  storyteller-tactics/
README.md
```

## Source & rights

Frameworks synthesized for agent use from *Storyteller Tactics* Volume I. Not a substitute for the original materials; do not redistribute card art.

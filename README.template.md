<!--
This becomes YOUR project's README. When your project has a name:

    cp README.template.md README.md

…then fill every <placeholder>, delete these guidance comments, and land it
as a PR (a good first "docs rode along" PR). The starter's original README
always lives on in the template repo — you lose nothing by replacing it.
Everything not in <angle brackets> is already true of this codebase; keep it.
-->

# Recipe Hub

Recipe Hub helps home cooks and food lovers turn social media recipe links into organized, personalized collections with ingredients, nutritional values, instructions, equipment, and everything else you'd want from a recipe.

**Live:** not deployed yet

<!-- Optional but recommended: one screenshot or GIF of the thing working.
     A README with a picture gets read; a wall of text gets skimmed. -->

## What it does

<!-- One line per shipped feature, linking its spec — the spec is the full
     story, this list is the menu. Grows as features land. -->

- Import a recipe from a social media link and turn it into a structured recipe ([spec](docs/specs/<domain>/<feature>.md))
- <Feature> ([spec](docs/specs/<domain>/<feature>.md))

## Run it locally

No Docker, no cloud account — everything runs from npm.

```bash
pnpm install
pnpm prisma:generate     # typed DB client
pnpm dev                 # web + worker + your own Postgres + Azurite
pnpm db:seed             # demo data (with dev running)
```

Check it worked: `http://localhost:3000/api/health` → `{"status":"ok","db":"ok"}`.
All commands: see `package.json` scripts, or `CONTRIBUTING.md` for the
pre-push set (`pnpm test && pnpm typecheck && pnpm build`).

## How it's built

The web app lets users save, browse, and organize recipe collections from imported links, while the background worker parses recipe content, extracts ingredients and steps, and keeps data fresh. The database stores users, recipes, ingredients, nutrition details, instructions, equipment, tags, and saved collections so everything can be searched, organized, and revisited in one place.

The deeper story lives in the docs, organized by the question you're asking —
decisions in [`docs/adr/`](docs/adr/), behavior in [`docs/specs/`](docs/specs/),
history in [`docs/postmortems/`](docs/postmortems/), procedures in
[`docs/runbooks/`](docs/runbooks/). Start at [`docs/README.md`](docs/README.md).

## Team

<!-- Who builds this. Link GitHubs. Your team charter has the roles. -->

- Olivia Jervise — @olivia-jervise
- Alyssa Johnson — @alyssajodi2005
- Nathan Jaywin Chin - @NathanASC25

## Contributing

Workflow, ground rules, and the documentation system: [`CONTRIBUTING.md`](CONTRIBUTING.md).
Agent conventions (any harness): [`AGENTS.md`](AGENTS.md).

---

<sub>Built on the CTP C12 full-stack starter — Next.js · Prisma · Postgres · Azure.</sub>

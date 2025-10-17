# Branching Strategy

We use a staged flow with a dedicated UI integration branch.

- `frontend`: Long-lived branch for all UI features. Feature branches are created from here and merged back via PR.
- `dev`: The watchdog integration branch for full-stack integration and CI quality gates. Promotions to `staging`/`master` go through `dev`.
- `staging` → `master`: Promotion branches, only from `dev`.

## Naming
- Features: `feat/<short-name>`
- Fixes: `fix/<short-name>`
- Chores/Docs: `chore/<short-name>`, `docs/<short-name>`

## PR Bases
- UI feature PRs: base = `frontend`
- Promotion PRs: `frontend` → `dev`

## Guardrails
- CI must pass (tests + coverage gate).
- At least one approval on protected branches (`frontend`, `dev`).
- No direct pushes to protected branches.

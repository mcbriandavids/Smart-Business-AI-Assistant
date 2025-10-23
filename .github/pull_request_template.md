<<<<<<< HEAD
## Summary

Provide a short summary of the changes and the motivation. Link to any related issues.

References:
- Issue(s): Closes #
- Related PR(s):

## Type of change
=======
### Summary

Describe the change. Link to issues, designs, or specs.

### Type of change
>>>>>>> frontend

- [ ] Feature
- [ ] Fix
- [ ] Chore/Refactor
<<<<<<< HEAD
- [ ] Docs
- [ ] CI/CD
- [ ] Security

## Promotion context

This PR is for:
- [ ] dev → master (integration → default branch)
- [ ] dev → staging (pre-production validation)
- [ ] staging → production (release)

Checklist for promotion PRs:
- [ ] Source/target follows the enforced policy (dev→master, dev→staging, staging→production)
- [ ] CI is green (tests, lint, coverage)
- [ ] No critical security findings
- [ ] No unintentional secrets or large files
- [ ] Rollback plan noted
- [ ] Any DB or config migrations include forward/backward compatibility notes

## Testing notes

- [ ] Unit tests added/updated
- [ ] E2E/smoke tests updated
- [ ] Local verification steps provided

How was this tested?
- Steps:
  1. 
  2. 
  3. 
- Evidence (screenshots/logs):

## Breaking changes

- [ ] Yes (describe impact and migration steps)
- [ ] No

If breaking:
- Migration steps:
- Affected components/services:

## Release notes

User-facing summary for changelog:
- 

## Rollback plan

Describe how to revert safely if needed (e.g., revert commit/PR, data migration rollback, feature flag off, etc.).

## Additional context

Anything else reviewers should know: risks, trade-offs, follow-ups, or post-merge tasks.
=======
- [ ] Docs/CI

### Branching and base

- Source branch name follows convention (feat|fix|chore|docs)/short-name
- Base branch is correct:
  - UI work: base = `frontend`
  - Promotion: base = `dev` (from `frontend`)

### Checklist

- [ ] CI passes (tests + coverage)
- [ ] Updated docs or screenshots
- [ ] For UI: added screenshots or a short Loom/GIF
- [ ] For UI: adheres to design system tokens/components

### Screenshots / Video

Paste images or links to recordings demonstrating the change.

<!-- backend-ci-coverage marker, used by automation -->
>>>>>>> frontend

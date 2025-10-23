Param(
  [string]$Repo = "mcbriandavids/Smart-Business-AI-Assistant"
)

# Requires GitHub CLI (gh) and authentication.
# Protect 'frontend' and 'dev' with required PR reviews and status checks.

Write-Host "Configuring branch protections for $Repo..."

gh api -X PUT repos/$Repo/branches/frontend/protection `
  -F required_status_checks.strict=true `
  -F required_status_checks.contexts='["Backend CI / Install & Test"]' `
  -F enforce_admins=true `
  -F required_pull_request_reviews.required_approving_review_count=1 `
  -F restrictions=null | Out-Null

gh api -X PUT repos/$Repo/branches/dev/protection `
  -F required_status_checks.strict=true `
  -F required_status_checks.contexts='["Backend CI / Install & Test"]' `
  -F enforce_admins=true `
  -F required_pull_request_reviews.required_approving_review_count=1 `
  -F restrictions=null | Out-Null

Write-Host "Done. Verify protections in GitHub > Settings > Branches."

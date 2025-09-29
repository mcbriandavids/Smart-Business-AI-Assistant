# 🌿 Branching Strategy - Smart Business AI Assistant

## 📋 Overview

This project uses a **Dev-to-Main** branching strategy where:

- **`dev`** is the primary development branch
- **`main`** is the production branch
- All development and testing happens on `dev`
- Successful `dev` builds are automatically promoted to `main`

## 🔄 Workflow Process

### 1. 🌿 Development Phase (Dev Branch)

```
Feature Development → Dev Branch → CI/CD Checks → Auto-promote to Main
```

#### What happens on `dev` branch:

- ✅ **Full CI/CD Pipeline** runs on every push
- ✅ **Comprehensive Testing** (Backend, Frontend, Security)
- ✅ **Quality Gates** ensure code standards
- ✅ **Build Verification** confirms deployability
- ✅ **Security Audits** scan for vulnerabilities

#### Triggers:

- Push to `dev` branch
- Pull requests targeting `dev`
- Feature branches (`feature/**`, `bugfix/**`, `hotfix/**`)

### 2. 🚀 Production Phase (Main Branch)

```
Dev (All Checks Pass) → Auto-merge to Main → Production Deployment
```

#### What happens on `main` branch:

- 🚀 **Production Deployment** to live environment
- 🏷️ **Release Tagging** with version numbers
- 📧 **Deployment Notifications**
- 🧪 **Health Checks** post-deployment

#### Triggers:

- Automatic promotion from successful `dev` builds
- Manual production deployments via workflow dispatch

## 📁 Branch Structure

```
main (Production)
├── 🚀 Auto-promoted from dev
├── 🏷️ Tagged releases
└── 🔒 Protected branch

dev (Development)
├── 🧪 All development work
├── 🔍 CI/CD checks
├── ⚡ Feature integrations
└── 📦 Build testing

feature/* (Feature Branches)
├── 🎯 Individual features
├── 🔀 Merge to dev via PR
└── 🧹 Delete after merge

bugfix/* (Bug Fixes)
├── 🐛 Bug fixes
├── 🔀 Merge to dev via PR
└── 🧹 Delete after merge

hotfix/* (Emergency Fixes)
├── 🚨 Critical fixes
├── 🔀 Merge to dev (then auto to main)
└── 🧹 Delete after merge
```

## 🛠️ Developer Workflow

### For New Features:

```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# 2. Develop your feature
# ... make changes ...

# 3. Push and create PR to dev
git push origin feature/your-feature-name
# Create PR: feature/your-feature-name → dev

# 4. After PR approval and merge to dev:
# - CI/CD runs automatically
# - If all checks pass, auto-promotes to main
# - Production deployment happens automatically
```

### For Bug Fixes:

```bash
# 1. Create bugfix branch from dev
git checkout dev
git pull origin dev
git checkout -b bugfix/issue-description

# 2. Fix the bug
# ... make changes ...

# 3. Push and create PR to dev
git push origin bugfix/issue-description
# Create PR: bugfix/issue-description → dev
```

### For Hotfixes:

```bash
# 1. Create hotfix branch from dev
git checkout dev
git pull origin dev
git checkout -b hotfix/critical-fix

# 2. Apply the critical fix
# ... make changes ...

# 3. Push and create PR to dev
git push origin hotfix/critical-fix
# Create PR: hotfix/critical-fix → dev
# (Emergency: Can be fast-tracked)
```

## 🤖 Automated Workflows

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

- **Triggers**: Push to `dev`, PRs to `dev`
- **Jobs**: Setup, Test, Build, Security, Quality Gate
- **Auto-promotion**: Success → Merge to `main`

### 2. **Production Deployment** (`.github/workflows/production-deploy.yml`)

- **Triggers**: Push to `main`
- **Jobs**: Production build, Deploy, Health checks, Release creation

### 3. **Dev Validation** (`.github/workflows/dev-validation.yml`)

- **Triggers**: Push/PR to `dev`
- **Jobs**: Quick validation and structure checks

### 4. **PR Validation** (`.github/workflows/pr-validation.yml`)

- **Triggers**: Pull requests
- **Jobs**: Quick feedback for PR authors

## 🔒 Branch Protection Rules

### Dev Branch Protection:

- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes to specific people/teams

### Main Branch Protection:

- 🔒 **Auto-merge only** (no direct pushes)
- 🤖 Only GitHub Actions can push
- 🏷️ Automatic release tagging
- 🚀 Production deployment triggers

## 📊 Quality Gates

Before promotion to `main`, ALL these must pass:

- ✅ Backend tests and linting
- ✅ Frontend tests and type checking
- ✅ Security audits and secret scanning
- ✅ Build verification (both packages)
- ✅ Code quality checks

## 🎯 Benefits

### For Developers:

- 🎯 **Single source of truth**: `dev` branch
- 🔄 **Continuous integration**: Every push tested
- 🚀 **Automated deployments**: No manual promotion
- 🛡️ **Safety net**: Multiple quality checks

### For Operations:

- 🤖 **Automated promotion**: Reduces human error
- 🔒 **Consistent quality**: All code passes same checks
- 📊 **Visibility**: Clear pipeline status
- 🏷️ **Release tracking**: Automatic versioning

### For Business:

- ⚡ **Faster delivery**: Automated pipeline
- 🔒 **Higher quality**: Multiple validation layers
- 📈 **Predictable releases**: Consistent process
- 🐛 **Reduced bugs**: Comprehensive testing

## 🚨 Emergency Procedures

### Rollback Production:

```bash
# 1. Identify last good release tag
git tag --list | tail -5

# 2. Reset main to previous release
git checkout main
git reset --hard <previous-release-tag>
git push origin main --force

# 3. Production will auto-deploy the rollback
```

### Hotfix Critical Issue:

```bash
# 1. Create hotfix from current main
git checkout main
git checkout -b hotfix/critical-issue

# 2. Apply minimal fix
# ... make minimal changes ...

# 3. Push to dev for validation
git checkout dev
git merge hotfix/critical-issue
git push origin dev

# 4. Auto-promotion will handle the rest
```

## 📚 Additional Resources

- [GitHub Flow Documentation](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Continuous Integration Best Practices](https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)

---

**Remember: `dev` is your main working branch, `main` is for production! 🌿➡️🚀**

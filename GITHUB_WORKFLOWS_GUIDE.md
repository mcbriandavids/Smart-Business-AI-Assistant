# 🔄 GitHub Workflows Guide

This document explains the GitHub Actions workflows configured for the Smart Business AI Assistant project.

## 📋 Available Workflows

### 1. 🚀 CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**

- Push to `master`, `develop`, or any `feature/**`, `bugfix/**`, `hotfix/**` branch
- Pull requests to `master` or `develop`

**Jobs:**

- **🧪 Test & Lint**: Runs tests and linting for both backend and frontend
- **🏗️ Build**: Creates production builds and uploads artifacts
- **🔒 Security**: Performs security audits and CodeQL analysis
- **🚀 Deploy Dev**: Auto-deploys to development environment from `develop` branch
- **🚀 Deploy Prod**: Auto-deploys to production from `master` branch
- **📊 Health Check**: Validates deployment health and performance

### 2. 📧 Pull Request Notifications (`notifications.yml`)

**Triggers:**

- Pull request opened, closed, synchronized, or reopened
- Pull request reviews submitted

**Features:**

- Email notifications for PR events
- Slack notifications (optional)
- Discord notifications (optional)
- Rich HTML emails with PR details

### 3. 📦 Automated Release (`release.yml`)

**Triggers:**

- Push to `master` or `develop` with package.json changes
- Manual workflow dispatch

**Features:**

- Automatic version detection
- Changelog generation from commit messages
- Release creation with assets
- Docker image building (optional)

### 4. 🔄 Dependency Updates (`dependencies.yml`)

**Triggers:**

- Scheduled weekly (Mondays at 9 AM UTC)
- Manual workflow dispatch

**Features:**

- Checks for outdated dependencies
- Security audit
- Creates GitHub issues for updates

## 🔧 Setup Requirements

### Required Secrets

Add these secrets in your GitHub repository settings:

```
EMAIL_USERNAME=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
NOTIFICATION_EMAIL=notifications@yourdomain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/... (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... (optional)
```

### Gmail App Password Setup

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Navigate to Security > 2-Step Verification
3. Go to App passwords
4. Generate an app password for "Mail"
5. Use this password as `EMAIL_PASSWORD` secret

## 🌊 Branch Strategy

### Main Branches:

- **`master`**: Production-ready code
- **`develop`**: Development branch for integration

### Supporting Branches:

- **`feature/*`**: New features
- **`bugfix/*`**: Bug fixes
- **`hotfix/*`**: Emergency fixes for production

### Workflow:

1. Create feature branch from `develop`
2. Work on feature and create PR to `develop`
3. After review and testing, merge to `develop`
4. Create release PR from `develop` to `master`
5. Deploy to production from `master`

## 📊 Deployment Environments

### Development Environment

- **Triggered by**: Push to `develop` branch
- **Purpose**: Testing and integration
- **Notifications**: Email alerts on deployment

### Production Environment

- **Triggered by**: Push to `master` branch
- **Purpose**: Live application
- **Notifications**: Email alerts with release highlights

## 🛠️ Customization

### Adding New Environments

1. Create environment in GitHub repository settings
2. Add environment-specific secrets
3. Update workflow files with new environment jobs

### Modifying Notifications

Edit the `notifications.yml` file to:

- Change email templates
- Add new notification triggers
- Configure Slack/Discord integration

### Security Configuration

The workflows include:

- **npm audit**: Dependency vulnerability scanning
- **CodeQL**: Static code analysis
- **Artifact management**: Secure build artifact handling

## 🚀 Deployment Process

### Automatic Deployment

1. Code pushed to target branch
2. Tests and security checks run
3. Application builds
4. Artifacts uploaded
5. Deployment executed
6. Health checks performed
7. Notifications sent

### Manual Deployment

Use `workflow_dispatch` trigger in release workflow for manual deployments.

## 📈 Monitoring

### Build Status

- ✅ All checks must pass for deployment
- 📊 Coverage reports uploaded to Codecov
- 🔒 Security scans must complete successfully

### Performance Metrics

- Build artifact sizes tracked
- Deployment timing monitored
- Health check results recorded

## 🔍 Troubleshooting

### Common Issues:

1. **Secret Not Found**
   - Verify secrets are added to repository settings
   - Check secret names match workflow references

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are properly listed

3. **Deployment Issues**
   - Ensure environment is properly configured
   - Check deployment target accessibility

### Debug Commands:

```bash
# Check workflow status
gh workflow list

# View workflow runs
gh run list

# View specific run details
gh run view <run-id>
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)

---

_This workflow configuration supports the Smart Business AI Assistant development lifecycle with automated testing, building, and deployment processes._

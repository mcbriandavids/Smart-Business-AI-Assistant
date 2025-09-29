# 📧 Email Notifications Setup Guide

This guide will help you set up email notifications for your Smart Business AI Assistant repository.

## 🎯 What You'll Get

- **📥 Pull Request Notifications**: When PRs are opened, closed, or reviewed
- **✅ Build Success Notifications**: When builds complete successfully  
- **❌ Build Failure Notifications**: When builds fail (so you can fix them quickly)
- **🔄 Dependency Update Alerts**: Weekly dependency check notifications

## 🔧 Setup Instructions

### Step 1: Create Gmail App Password

1. **Go to Google Account Settings**:
   - Visit: https://myaccount.google.com/security
   - Sign in to your Google account

2. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to "2-Step Verification" 
   - Follow the setup process

3. **Generate App Password**:
   - In Security settings, find "App passwords"
   - Click "Generate app password"
   - Select "Mail" as the app
   - Copy the 16-character password (save it somewhere safe!)

### Step 2: Add GitHub Repository Secrets

1. **Go to your GitHub repository**:
   - Navigate to: `https://github.com/YOUR_USERNAME/Smart-Business-AI-Assistant`

2. **Access Repository Settings**:
   - Click on "Settings" tab
   - Click on "Secrets and variables" → "Actions"

3. **Add the following secrets**:

   **Click "New repository secret" and add each of these:**

   | Secret Name | Value | Description |
   |-------------|-------|-------------|
   | `EMAIL_USERNAME` | `your-email@gmail.com` | Your Gmail address |
   | `EMAIL_PASSWORD` | `your-16-char-app-password` | The app password from Step 1 |
   | `NOTIFICATION_EMAIL` | `notify-me@gmail.com` | Email where notifications will be sent |

### Step 3: Test the Setup

1. **Create a test branch**:
   ```bash
   git checkout -b test/email-notifications
   ```

2. **Make a small change and push**:
   ```bash
   echo "# Test" > test-file.md
   git add test-file.md
   git commit -m "test: email notification setup"
   git push origin test/email-notifications
   ```

3. **Create a Pull Request**:
   - Go to GitHub and create a PR from your test branch to `dev`
   - You should receive an email notification! 📧

4. **Clean up**:
   - Close the test PR
   - Delete the test branch

## 📧 Email Templates

### Pull Request Opened
```
Subject: 🚀 New Pull Request: [PR Title]

Content:
- Project name
- PR title and description  
- Author and branch info
- Files changed statistics
- Direct link to PR
```

### Build Success
```
Subject: ✅ Build Successful - Smart Business AI Assistant  

Content:
- Build status summary
- Branch and commit info
- Link to build details
```

### Build Failure  
```
Subject: ❌ Build Failed - Smart Business AI Assistant

Content:
- Which part failed (tests/build)
- Branch and commit info
- Link to build logs
- Call to action to fix
```

## 🔧 Alternative Notification Channels

### Slack Integration (Optional)
1. Create a Slack webhook in your workspace
2. Add `SLACK_WEBHOOK_URL` secret to GitHub
3. Enable Slack notifications in `.github/workflows/notifications.yml`

### Discord Integration (Optional)  
1. Create a Discord webhook in your server
2. Add `DISCORD_WEBHOOK_URL` secret to GitHub
3. Enable Discord notifications in `.github/workflows/notifications.yml`

## 🛠️ Customization

### Modify Email Content
Edit the HTML templates in:
- `.github/workflows/notifications.yml` - PR notifications
- `.github/workflows/ci-cd.yml` - Build notifications

### Change Email Provider
Replace Gmail SMTP settings with your provider:
```yaml
server_address: smtp.your-provider.com
server_port: 587  # or your provider's port
```

### Add More Notification Types
You can add notifications for:
- New releases
- Security alerts  
- Deployment success/failure
- Code review requests

## 🔍 Troubleshooting

### Not Receiving Emails?
1. **Check spam folder** - GitHub emails sometimes land there
2. **Verify secrets** - Make sure all three secrets are set correctly
3. **Check app password** - Ensure it's the 16-character app password, not your regular password
4. **Gmail settings** - Ensure "Less secure app access" is not blocking it

### Build Notifications Not Working?
1. **Check workflow syntax** - YAML indentation must be perfect
2. **Verify secret names** - They are case-sensitive
3. **Check Actions logs** - Go to repository Actions tab to see error details

### Email Content Issues?
1. **HTML formatting** - Test your HTML in an email client
2. **GitHub variables** - Ensure `${{ github.* }}` variables are available in that context
3. **Character encoding** - Use UTF-8 for special characters

## 📋 Security Best Practices

✅ **Use app passwords**, never your main Gmail password  
✅ **Limit repository access** to secrets  
✅ **Regularly rotate** app passwords  
✅ **Use separate email** for notifications if desired  
✅ **Monitor secret usage** in GitHub's audit logs

## 🎯 Next Steps

Once email notifications are working:
1. **Customize templates** to match your preferences
2. **Add team members** to notification emails
3. **Set up Slack/Discord** if your team uses them
4. **Configure mobile notifications** for critical alerts

---

**🎉 You're all set!** Your Smart Business AI Assistant will now keep you informed of all important repository activities via email.

*Need help? Check the troubleshooting section or create an issue in the repository.*
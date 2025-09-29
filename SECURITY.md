# 🔒 Security Guidelines - Smart Business AI Assistant

## 🚨 Critical Security Rules

### ❌ NEVER COMMIT THESE TO VERSION CONTROL:

- `.env` files with real values
- API keys, tokens, or passwords
- Private keys or certificates
- Database connection strings with credentials
- JWT secrets
- Third-party service credentials (Twilio, OpenAI, etc.)

### ✅ SAFE TO COMMIT:

- `.env.example` files with placeholder values
- Public configuration files
- Documentation
- Source code without embedded secrets

## 🔐 Environment Variables Security

### Required Environment Variables (Production)

Create a `.env` file in `packages/backend/` with these variables:

```bash
# Database
DATABASE_TYPE=sqlite
DATABASE_PATH=data/business.db

# JWT - Generate with: openssl rand -base64 32
JWT_SECRET=your_randomly_generated_jwt_secret_here

# Server
PORT=3001
NODE_ENV=production

# Twilio (SMS) - Get from Twilio Console
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# OpenAI - Get from OpenAI Platform
OPENAI_API_KEY=your_openai_api_key

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# WhatsApp Business API (Optional)
WHATSAPP_BUSINESS_PHONE_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

### Generating Secure Secrets

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate UUID
node -e "console.log(require('crypto').randomUUID())"
```

## 🛡️ GitHub Repository Security

### Secrets Management

Use GitHub Secrets for CI/CD environments:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `TWILIO_AUTH_TOKEN`
   - `SMTP_PASSWORD`
   - Any other sensitive values

### Example GitHub Action Usage:

```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 🔍 Security Scanning

### Automated Security Checks

Our GitHub workflows include:

- **Secret Detection**: Scans for hardcoded secrets
- **Dependency Audit**: Checks for vulnerable packages
- **Environment Security**: Validates .env file handling
- **Private Key Detection**: Prevents key commits

### Manual Security Audit

Run these commands regularly:

```bash
# Check for secrets in code
grep -r -i "password\|secret\|key\|token" packages/ --exclude-dir=node_modules

# Audit dependencies
npm audit

# Check .gitignore coverage
git check-ignore .env
```

## 🚀 Production Deployment Security

### Environment Setup

1. **Never use development secrets in production**
2. **Use strong, unique passwords for all services**
3. **Enable two-factor authentication on all accounts**
4. **Use environment-specific secrets**
5. **Regularly rotate API keys and tokens**

### Database Security

- Use strong database passwords
- Enable database encryption
- Regular backup with encryption
- Limit database access permissions

### API Security

- Rate limiting implementation
- Input validation and sanitization
- HTTPS enforcement
- CORS configuration
- Authentication middleware

## 📋 Security Checklist

### Before Each Commit:

- [ ] No `.env` files committed
- [ ] No hardcoded secrets in code
- [ ] No private keys in repository
- [ ] `.env.example` updated with new variables
- [ ] Secrets use placeholder values

### Before Production Deployment:

- [ ] All secrets properly configured
- [ ] JWT secret is randomly generated
- [ ] Database credentials are secure
- [ ] API keys are production-ready
- [ ] HTTPS is enforced
- [ ] Security headers are configured

### Regular Maintenance:

- [ ] Rotate JWT secrets (quarterly)
- [ ] Update API keys (as needed)
- [ ] Review dependency vulnerabilities
- [ ] Check for new security best practices
- [ ] Audit user access permissions

## 🆘 Security Incident Response

### If Secrets Are Accidentally Committed:

1. **Immediate Actions:**

   ```bash
   # Remove from latest commit
   git reset HEAD~1
   git add .
   git commit -m "Remove sensitive data"
   git push --force
   ```

2. **Rotate All Exposed Secrets:**
   - Change JWT secret
   - Regenerate API keys
   - Update database passwords
   - Notify team members

3. **Clean Git History:**
   ```bash
   # Remove from entire history (use carefully)
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch packages/backend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   ```

### If Repository Is Compromised:

1. Immediately rotate all secrets
2. Review access logs
3. Check for unauthorized changes
4. Update all team members
5. Consider making repository private temporarily

## 📞 Security Contacts

- **Security Issues**: Report to repository maintainer
- **Vulnerability Disclosure**: Create private security advisory
- **Emergency**: Contact project lead immediately

## 📚 Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Remember: Security is everyone's responsibility! 🛡️**

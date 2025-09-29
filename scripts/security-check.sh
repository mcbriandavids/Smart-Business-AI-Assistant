#!/bin/bash

# 🔒 Security Validation Script for Smart Business AI Assistant
# This script checks for common security issues before commits

echo "🔒 Security Validation - Smart Business AI Assistant"
echo "=================================================="

# Check for .env files in version control
echo "🔍 Checking for .env files in version control..."
if find . -name ".env" -not -path "./node_modules/*" -not -path "./.next/*" | grep -q .; then
    echo "❌ ERROR: .env files found in version control!"
    echo "🚨 Remove these files immediately:"
    find . -name ".env" -not -path "./node_modules/*" -not -path "./.next/*"
    exit 1
else
    echo "✅ No .env files found in version control"
fi

# Check for hardcoded secrets
echo "🔍 Scanning for hardcoded secrets..."
secret_patterns=(
    "password.*=.*['\"][^'\"]*['\"]"
    "secret.*=.*['\"][^'\"]*['\"]"
    "key.*=.*['\"][^'\"]*['\"]"
    "token.*=.*['\"][^'\"]*['\"]"
    "api_key.*=.*['\"][^'\"]*['\"]"
    "sk_[a-zA-Z0-9]+"
    "pk_[a-zA-Z0-9]+"
    "AKIA[0-9A-Z]{16}"
)

secrets_found=false
for pattern in "${secret_patterns[@]}"; do
    if grep -r -E "$pattern" packages/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -q .; then
        if [ "$secrets_found" = false ]; then
            echo "⚠️ WARNING: Potential secrets found:"
            secrets_found=true
        fi
        grep -r -E "$pattern" packages/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next"
    fi
done

if [ "$secrets_found" = false ]; then
    echo "✅ No hardcoded secrets detected"
fi

# Check for private keys
echo "🔍 Checking for private keys..."
if grep -r -E "(BEGIN.*PRIVATE.*KEY|BEGIN.*RSA.*PRIVATE.*KEY)" packages/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" --include="*.pem" --include="*.key" 2>/dev/null; then
    echo "❌ ERROR: Private keys found in source code!"
    exit 1
else
    echo "✅ No private keys found"
fi

# Check .env.example file
echo "🔍 Validating .env.example..."
if [ -f "packages/backend/.env.example" ]; then
    if grep -q "your_" packages/backend/.env.example; then
        echo "✅ .env.example uses placeholder values"
    else
        echo "⚠️ WARNING: .env.example may contain real values"
    fi
    
    if grep -q "openssl rand" packages/backend/.env.example; then
        echo "✅ JWT secret generation guidance provided"
    else
        echo "ℹ️ Consider adding JWT secret generation guidance"
    fi
else
    echo "⚠️ .env.example file not found"
fi

# Check dependencies for vulnerabilities
echo "🔍 Checking for dependency vulnerabilities..."
if command -v npm &> /dev/null; then
    cd packages/backend
    if npm audit --audit-level=high 2>/dev/null; then
        echo "✅ Backend dependencies security check passed"
    else
        echo "⚠️ Backend dependencies have security issues"
    fi
    
    cd ../frontend
    if npm audit --audit-level=high 2>/dev/null; then
        echo "✅ Frontend dependencies security check passed"
    else
        echo "⚠️ Frontend dependencies have security issues"
    fi
    cd ../..
fi

echo ""
echo "🎯 Security Validation Complete"
echo "================================"

if [ "$secrets_found" = true ]; then
    echo "⚠️ Please review and fix security warnings above"
    echo "📚 See SECURITY.md for detailed guidelines"
    exit 1
else
    echo "✅ All security checks passed!"
    echo "🚀 Safe to commit"
fi
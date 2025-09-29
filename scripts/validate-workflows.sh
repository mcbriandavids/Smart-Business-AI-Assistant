#!/bin/bash

# 🧪 GitHub Workflow Validation and Test Script
echo "🧪 GitHub Workflow Test Validation"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d ".github/workflows" ]; then
    echo "❌ ERROR: Not in project root or .github/workflows not found"
    exit 1
fi

echo "📁 Checking workflow files..."

# List all workflow files
echo "📋 Available workflows:"
ls -la .github/workflows/

echo ""
echo "🔍 Validating workflow syntax..."

# Check each workflow file
for workflow in .github/workflows/*.yml; do
    echo "📄 Checking: $(basename $workflow)"
    
    # Basic YAML syntax check (if yq is available)
    if command -v yq &> /dev/null; then
        if yq eval . "$workflow" > /dev/null 2>&1; then
            echo "  ✅ YAML syntax: VALID"
        else
            echo "  ❌ YAML syntax: INVALID"
        fi
    else
        echo "  ℹ️  YAML syntax: yq not available, skipping validation"
    fi
    
    # Check for required GitHub Actions structure
    if grep -q "^name:" "$workflow" && grep -q "^on:" "$workflow" && grep -q "^jobs:" "$workflow"; then
        echo "  ✅ Structure: VALID (has name, on, jobs)"
    else
        echo "  ❌ Structure: INVALID (missing name, on, or jobs)"
    fi
    
    echo ""
done

echo "🔍 Testing workflow triggers..."

# Check CI/CD workflow
if [ -f ".github/workflows/ci-cd.yml" ]; then
    echo "📄 CI/CD Pipeline:"
    if grep -q "branches.*dev" .github/workflows/ci-cd.yml; then
        echo "  ✅ Triggers on dev branch: YES"
    else
        echo "  ❌ Triggers on dev branch: NO"
    fi
    
    if grep -q "pull_request" .github/workflows/ci-cd.yml; then
        echo "  ✅ Triggers on PRs: YES"
    else
        echo "  ❌ Triggers on PRs: NO"
    fi
fi

# Check production workflow
if [ -f ".github/workflows/production-deploy.yml" ]; then
    echo "📄 Production Deployment:"
    if grep -q "branches.*main" .github/workflows/production-deploy.yml; then
        echo "  ✅ Triggers on main branch: YES"
    else
        echo "  ❌ Triggers on main branch: NO"
    fi
fi

echo ""
echo "🎯 Test Commit Status:"
echo "📝 Latest commit: $(git log --oneline -1)"
echo "🌿 Current branch: $(git branch --show-current)"
echo "📡 Remote status: $(git status --porcelain)"

echo ""
echo "🔗 Next Steps:"
echo "1. 👀 Open: https://github.com/mcbriandavids/Smart-Business-AI-Assistant/actions"
echo "2. 🔍 Look for: '🚀 Smart Business AI - CI/CD Pipeline' workflow"
echo "3. 📊 Check job status (should show running or completed)"
echo "4. 🎯 Verify all jobs pass (green checkmarks)"

echo ""
echo "⏰ Test initiated at: $(date)"
echo "🎉 Workflow validation complete!"
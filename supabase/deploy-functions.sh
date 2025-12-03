#!/bin/bash

# ============================================
# DEPLOY ALL EDGE FUNCTIONS
# Run this script after linking your Supabase project
# Usage: ./deploy-functions.sh
# ============================================

set -e

echo "🚀 Deploying Scan The Table Edge Functions..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed."
    echo "   Install it with: npm install -g supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/project.toml" ] && [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Warning: Project may not be linked."
    echo "   Run: supabase link --project-ref YOUR_PROJECT_ID"
    echo ""
fi

echo "📦 Deploying functions..."
echo ""

# Deploy each function
FUNCTIONS=(
    "create-razorpay-order"
    "verify-razorpay-payment"
    "generate-payment-url"
    "create-tenant-user"
    "update-tenant-user"
    "razorpay-webhook"
    "create-subscription-order"
    "verify-subscription-payment"
    "process-plan-change"
)

FAILED=0
SUCCEEDED=0

for func in "${FUNCTIONS[@]}"; do
    echo "  → Deploying $func..."
    if supabase functions deploy "$func" --no-verify-jwt 2>/dev/null || supabase functions deploy "$func" 2>/dev/null; then
        echo "    ✅ $func deployed successfully"
        ((SUCCEEDED++))
    else
        echo "    ❌ $func failed to deploy"
        ((FAILED++))
    fi
done

echo ""
echo "============================================"
echo "📊 Deployment Summary"
echo "============================================"
echo "   ✅ Succeeded: $SUCCEEDED"
echo "   ❌ Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "⚠️  Some functions failed to deploy."
    echo "   Check the error messages above and try again."
    exit 1
else
    echo "🎉 All functions deployed successfully!"
fi

echo ""
echo "📝 Next Steps:"
echo "   1. Configure secrets in Supabase Dashboard > Project Settings > Secrets"
echo "   2. Required secrets:"
echo "      - SUPABASE_URL (your project URL)"
echo "      - SUPABASE_SERVICE_ROLE_KEY (from Settings > API)"
echo ""

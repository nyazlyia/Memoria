#!/bin/bash
# Railway Deployment Automation Script

echo "🚀 Photo Booth - Railway Deployment Setup"
echo ""
echo "This script will prepare your app for Railway deployment"
echo ""

# Step 1: Optimize for production
echo "📦 Step 1: Optimizing dependencies..."
composer install --no-dev --optimize-autoloader
npm ci

echo "✅ Dependencies optimized!"
echo ""

# Step 2: Build frontend
echo "🎨 Step 2: Building frontend..."
npm run build

echo "✅ Frontend built!"
echo ""

# Step 3: Prepare git
echo "📝 Step 3: Preparing Git repository..."
git add .
git commit -m "Prepare for Railway deployment" || true

echo ""
echo "✅ Git repository ready!"
echo ""

# Step 4: Display instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete! Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Go to https://railway.app"
echo "3. Login with GitHub"
echo "4. Create New Project"
echo "5. Deploy from GitHub"
echo "6. Select 'web-tania' repository"
echo "7. Railway auto-setup MySQL + Redis"
echo "8. Add environment variables:"
echo "   - MIDTRANS_SERVER_KEY (production)"
echo "   - MIDTRANS_CLIENT_KEY (production)"
echo "9. Deploy!"
echo ""
echo "📖 For detailed guide, see RAILWAY_QUICK_START.md"
echo ""

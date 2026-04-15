#!/bin/bash
# Vercel Environment Variables Setup Script

echo "Setting up Vercel environment variables for email..."

vercel env add EMAIL_SERVICE production
# Enter: gmail

vercel env add EMAIL_USER production  
# Enter: ashmit.sahu181207@gmail.com

vercel env add EMAIL_PASS production
# Enter: amto csot olsy pyaz

vercel env add EMAIL_FROM production
# Enter: "Prompt Forge Team" <ashmit.sahu181207@gmail.com>

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-vercel-app.vercel.app

echo "✅ Environment variables added! Deploy to apply changes."
echo "Run: vercel --prod"
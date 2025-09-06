#!/bin/bash

echo "🚀 FluidVault Somnia Testnet Deployment Setup"
echo "=============================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ .env.local created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your:"
    echo "   - PRIVATE_KEY (without 0x prefix)"
    echo "   - WALLETCONNECT_PROJECT_ID (optional)"
    echo ""
    echo "Press Enter when you've updated .env.local..."
    read
else
    echo "✅ .env.local already exists"
fi

# Check if private key is set
if ! grep -q "PRIVATE_KEY=your_private_key_here" .env.local; then
    echo "✅ Private key appears to be configured"
else
    echo "❌ Please set your PRIVATE_KEY in .env.local"
    echo "   Example: PRIVATE_KEY=1234567890abcdef..."
    exit 1
fi

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "📦 Compiling smart contracts..."
npm run compile

echo ""
echo "🧪 Running tests..."
npm run test

echo ""
echo "🎯 Ready for deployment!"
echo ""
echo "To deploy to Somnia testnet, run:"
echo "  npm run deploy:quick"
echo ""
echo "Or for full deployment with file generation:"
echo "  npm run deploy:testnet"
echo ""
echo "Make sure you have STT tokens for gas fees!"
echo "Get them from: https://discord.gg/somnia"

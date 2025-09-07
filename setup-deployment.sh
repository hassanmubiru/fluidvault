#!/bin/bash

echo "🚀 FluidVault Deployment Setup"
echo "==============================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file..."
    cp .env.template .env
    echo "✅ .env file created"
else
    echo "📄 .env file already exists"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Edit .env file and add your private key:"
echo "   nano .env"
echo ""
echo "2. Replace this line:"
echo "   PRIVATE_KEY=your_private_key_here"
echo ""
echo "3. With your actual private key:"
echo "   PRIVATE_KEY=0x1234567890abcdef..."
echo ""
echo "4. Get STT tokens from Somnia testnet faucet"
echo ""
echo "5. Test deployment:"
echo "   npm run test:deploy"
echo ""
echo "6. Deploy contracts:"
echo "   npm run deploy:simple"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_SETUP.md"
echo ""
echo "⚠️  Security: Never share your private key!"
# FluidVault Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

## 🔧 Environment Variables Setup

After deployment, you'll need to set these environment variables in your Vercel dashboard:

### Required Environment Variables:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
SOMNIA_CHAIN_ID=50312
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_APP_ENV=production
```

### How to Set Environment Variables:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value

## 📋 Pre-Deployment Checklist

- [ ] Vercel CLI installed and logged in
- [ ] WalletConnect Project ID obtained
- [ ] Smart contracts deployed (optional for demo)
- [ ] Environment variables ready

## 🎯 Post-Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Get WalletConnect Project ID** from https://cloud.walletconnect.com/
3. **Deploy Smart Contracts** (if needed)
4. **Update Contract Addresses** in environment variables
5. **Test the Application** on the live URL

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Somnia Network Explorer](https://shannon-explorer.somnia.network/)

## 📝 Notes

- The application will work in demo mode without deployed contracts
- All wallet connections and transactions will work on Somnia testnet
- The app is fully responsive and production-ready

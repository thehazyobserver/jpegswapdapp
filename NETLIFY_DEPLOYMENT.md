# JPEG Swap DApp - Netlify Deployment Guide

## 🚀 Deploy to Netlify

Your React dapp is ready for Netlify deployment! Here are three ways to deploy:

### Method 1: Direct Netlify Deploy (Recommended)

1. **Build your project locally:**
   ```bash
   cd jpeg-swap
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Drag and drop your `build` folder to Netlify
   - Your site will be live in seconds!

### Method 2: Git Integration (Best for Updates)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub repo
   - Build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `build`
   - Deploy!

### Method 3: Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and deploy:**
   ```bash
   netlify login
   cd jpeg-swap
   npm run build
   netlify deploy --prod --dir=build
   ```

## 📋 Pre-deployment Checklist

✅ **Package.json** - All dependencies included
✅ **Build script** - `npm run build` configured
✅ **netlify.toml** - Created for SPA routing
✅ **Contract ABIs** - All 4 contract ABIs included
✅ **Config.json** - Contract addresses configured
✅ **Ethers v6** - Compatible with modern Web3

## 🔧 Configuration Files Added

### `netlify.toml`
- Handles React Router routing
- Sets build configuration
- Specifies Node.js version

## 🌐 Features Your Deployed Dapp Will Have

- ✅ **Wallet Connection** - MetaMask integration
- ✅ **NFT Staking** - StonerFeePool integration
- ✅ **Stake Receipts** - StakeReceipt NFT display
- ✅ **Pool Factory** - Create new swap pools
- ✅ **NFT Swapping** - SwapPool functionality
- ✅ **Real-time Stats** - Live blockchain data
- ✅ **Responsive Design** - Mobile-friendly
- ✅ **Network Detection** - Sonic Mainnet validation

## 🔗 Post-Deployment

After deployment, your dapp will be accessible via:
- **Netlify URL:** `https://your-site-name.netlify.app`
- **Custom Domain:** Configure in Netlify settings

## 📱 Testing Your Deployed Dapp

1. **Connect Wallet** - Ensure MetaMask connects
2. **Check Network** - Verify Sonic Mainnet (Chain ID: 146)
3. **Test Contract Calls** - Try staking/swapping
4. **Mobile Test** - Check responsive design

## 🛠 Troubleshooting

### Common Issues:
- **Blank page:** Check console for errors
- **Routing issues:** Ensure netlify.toml is in root
- **Contract errors:** Verify network and addresses
- **Build failures:** Check Node.js version compatibility

### Environment Variables (if needed):
```
REACT_APP_NETWORK_ID=146
REACT_APP_NETWORK_NAME=Sonic Mainnet
```

## 🔄 Continuous Deployment

With Git integration, every push to main branch will:
1. Trigger automatic build
2. Deploy updated version
3. Provide deploy preview for branches

Your JPEG Swap DApp is production-ready! 🎉

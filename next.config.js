/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };
    
    // Handle WebSocket for WalletConnect
    config.externals = config.externals || [];
    config.externals.push({
      'ws': 'ws',
    });
    
    return config;
  },
  env: {
    NEXT_PUBLIC_SOMNIA_RPC_URL: process.env.NEXT_PUBLIC_SOMNIA_RPC_URL,
    NEXT_PUBLIC_SOMNIA_CHAIN_ID: process.env.NEXT_PUBLIC_SOMNIA_CHAIN_ID,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  },
};

module.exports = nextConfig;

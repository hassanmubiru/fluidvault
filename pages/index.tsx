import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight,
  ArrowRightLeft,
  DollarSign,
  Clock,
  CheckCircle,
  Vote,
  Brain,
  Star,
  Globe,
  Lock,
  Activity,
  BarChart3,
  Sparkles
} from 'lucide-react';
import VaultCard from '../components/VaultCard';
import StatsCard from '../components/StatsCard';
import WalletConnect from '../components/WalletConnect';
import NetworkHelper from '../components/NetworkHelper';
import MobileNavigation from '../components/MobileNavigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  const [totalTVL, setTotalTVL] = useState('4.5M');
  const [totalUsers, setTotalUsers] = useState(1250);
  const [averageAPY, setAverageAPY] = useState(4.5);

  useEffect(() => {
    // Mock data for demo
    setTotalTVL('4.5M');
    setTotalUsers(1250);
    setAverageAPY(4.5);
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Sub-second finality with Somnia Network's high-performance infrastructure",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "Audited smart contracts with multi-layer security protocols",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Competitive Yields",
      description: "Earn up to 5.2% APY with real-time interest calculations",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description: "Decentralized governance with transparent decision-making",
      color: "from-purple-400 to-pink-500"
    }
  ];

  const stats = [
    {
      label: "Total Value Locked",
      value: `$${totalTVL}`,
      icon: <DollarSign className="w-6 h-6" />,
      change: "+12.5%",
      changeType: "positive" as const,
      color: "from-green-500 to-emerald-600"
    },
    {
      label: "Active Users",
      value: totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      change: "+8.2%",
      changeType: "positive" as const,
      color: "from-blue-500 to-cyan-600"
    },
    {
      label: "Average APY",
      value: `${averageAPY}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      change: "+0.3%",
      changeType: "positive" as const,
      color: "from-purple-500 to-pink-600"
    },
    {
      label: "Transaction Speed",
      value: "<1s",
      icon: <Clock className="w-6 h-6" />,
      change: "Somnia Network",
      changeType: "positive" as const,
      color: "from-orange-500 to-red-600"
    }
  ];

  const platforms = [
    {
      name: "Yield Strategies",
      description: "Advanced yield farming with AI optimization",
      icon: <TrendingUp className="w-6 h-6" />,
      href: "/strategies",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Cross-Chain Bridge",
      description: "Seamless asset transfers across networks",
      icon: <ArrowRightLeft className="w-6 h-6" />,
      href: "/cross-chain",
      color: "from-indigo-500 to-blue-500"
    },
    {
      name: "Analytics Dashboard",
      description: "AI-powered insights and risk assessment",
      icon: <Brain className="w-6 h-6" />,
      href: "/analytics",
      color: "from-cyan-500 to-teal-500"
    },
    {
      name: "Governance",
      description: "Decentralized decision-making system",
      icon: <Vote className="w-6 h-6" />,
      href: "/governance",
      color: "from-emerald-500 to-green-500"
    }
  ];

  return (
    <>
      <Head>
        <title>FluidVault - The Future of DeFi Savings</title>
        <meta name="description" content="Experience the next generation of decentralized savings with FluidVault. Earn competitive yields with instant liquidity on Somnia Network." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Network Helper */}
        <NetworkHelper />
        
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <img src="/logo-icon.svg" alt="FluidVault Logo" className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    FluidVault
                  </span>
                </div>
                
                {/* Navigation Links */}
                <nav className="hidden lg:flex items-center space-x-8">
                  <a href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                    Home
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </a>
                  <a href="/strategies" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                    <TrendingUp className="w-4 h-4" />
                    Strategies
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </a>
                  <a href="/cross-chain" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                    <ArrowRightLeft className="w-4 h-4" />
                    Cross-Chain
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </a>
                  <a href="/analytics" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                    <Brain className="w-4 h-4" />
                    Analytics
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </a>
                  <a href="/governance" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                    <Vote className="w-4 h-4" />
                    Governance
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <WalletConnect />
                <MobileNavigation />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-2 mb-8 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Powered by Somnia Network</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  DeFi Savings
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Experience next-generation decentralized savings with competitive yields, 
                instant liquidity, and institutional-grade security on Somnia Network.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <button
                        onClick={connected ? openAccountModal : openConnectModal}
                        className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        {connected ? 'Manage Wallet' : 'Start Earning'}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    );
                  }}
                </ConnectButton.Custom>
                <button className="group border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-2xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center backdrop-blur-sm bg-white/50">
                  <Globe className="w-5 h-5 mr-2" />
                  Explore Platform
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Audited Smart Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Non-Custodial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Real-time Yields</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600 mb-2">{stat.label}</div>
                    <div className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose FluidVault?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built on cutting-edge technology with a focus on security, performance, and user experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Vaults Section */}
        <section className="py-24 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                High-Yield Vaults
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Earn competitive yields with our carefully curated selection of stablecoin vaults
              </p>
            </div>
            
            {/* Production Status Notice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 ml-4">Fully Operational</h3>
              </div>
              <p className="text-green-700 text-center mb-6 text-lg">
                FluidVault is live with deployed smart contracts on Somnia testnet. 
                All deposits, withdrawals, and interest calculations are fully functional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://shannon-explorer.somnia.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
                >
                  View Network Explorer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
                <a 
                  href="https://dream-rpc.somnia.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center justify-center font-semibold"
                >
                  RPC Endpoint
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <VaultCard
                name="USDC Vault"
                apy={5.2}
                tvl="$2.5M"
                token="USDC"
                address="0x420f8ab112fa8b14c706e277204c8fc3eb0f4c92"
              />
              <VaultCard
                name="USDT Vault"
                apy={4.8}
                tvl="$1.8M"
                token="USDT"
                address="0xb98c15a0dc1e271132e341250703c7e94c059e8d"
              />
              <VaultCard
                name="DAI Vault"
                apy={4.3}
                tvl="$1.2M"
                token="DAI"
                address="0xe7cf68c601f103e6daaeb75e1268019098815ea2"
              />
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Complete DeFi Ecosystem
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Access a full suite of DeFi tools designed for maximum yield and minimal risk
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {platforms.map((platform, index) => (
                <a
                  key={index}
                  href={platform.href}
                  className="group block"
                >
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform flex-shrink-0`}>
                        {platform.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {platform.name}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">
                          {platform.description}
                        </p>
                        <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                          Explore Feature
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl p-16 text-white relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20"></div>
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Start Earning?
                </h2>
                <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                  Join thousands of users earning competitive yields with instant liquidity and institutional-grade security
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <ConnectButton.Custom>
                    {({
                      account,
                      chain,
                      openAccountModal,
                      openChainModal,
                      openConnectModal,
                      authenticationStatus,
                      mounted,
                    }) => {
                      const ready = mounted && authenticationStatus !== 'loading';
                      const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                          authenticationStatus === 'authenticated');

                      return (
                        <button
                          onClick={connected ? openAccountModal : openConnectModal}
                          className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          {connected ? 'Manage Wallet' : 'Connect Wallet'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      );
                    }}
                  </ConnectButton.Custom>
                  <button className="border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <img src="/logo-icon.svg" alt="FluidVault Logo" className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold">FluidVault</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  The next generation of decentralized savings platform built on Somnia Network.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-6">Product</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="/" className="hover:text-white transition-colors">Vaults</a></li>
                  <li><a href="/strategies" className="hover:text-white transition-colors">Yield Strategies</a></li>
                  <li><a href="/cross-chain" className="hover:text-white transition-colors">Cross-Chain Bridge</a></li>
                  <li><a href="/analytics" className="hover:text-white transition-colors">Analytics</a></li>
                  <li><a href="/governance" className="hover:text-white transition-colors">Governance</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-6">Resources</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-6">Community</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Medium</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Reddit</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 FluidVault. All rights reserved. Built with ❤️ on Somnia Network.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
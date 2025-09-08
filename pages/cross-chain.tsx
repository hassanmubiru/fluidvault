import { useState } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { 
  ArrowRightLeft, 
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CrossChainBridge from '../components/CrossChainBridge';
import { useCrossChain } from '../hooks/useCrossChain';

export default function CrossChain() {
  const { address, isConnected } = useAccount();
  const { supportedChains, userBridgeRequests, currentChainId } = useCrossChain();
  
  const [activeTab, setActiveTab] = useState<'bridge' | 'stats' | 'history'>('bridge');

  // Calculate stats
  const stats = {
    totalChains: supportedChains.length,
    activeChains: supportedChains.filter(chain => chain.isActive).length,
    totalBridges: userBridgeRequests.length,
    successfulBridges: userBridgeRequests.filter(req => req.status === 2).length, // Executed
    currentChain: currentChainId
  };

  return (
    <>
      <Head>
        <title>Cross-Chain Bridge - FluidVault</title>
        <meta name="description" content="Transfer assets seamlessly between blockchain networks with FluidVault's cross-chain bridge" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/logo-icon.svg" alt="FluidVault Logo" className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    FluidVault Cross-Chain
                  </span>
                </div>
                
                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-6">
                  <a 
                    href="/" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Home
                  </a>
                  <a 
                    href="/strategies" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Strategies
                  </a>
                  <a 
                    href="/governance" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Governance
                  </a>
                  <a 
                    href="/cross-chain" 
                    className="text-blue-600 font-medium"
                  >
                    Cross-Chain
                  </a>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <ConnectButton.Custom>
                  {({
                    account, chain, openAccountModal, openConnectModal, authenticationStatus, mounted,
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
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                      >
                        {connected ? 'Manage Wallet' : 'Connect Wallet'}
                      </button>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cross-Chain Bridge
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transfer your assets seamlessly between supported blockchain networks. 
              Access yield strategies across multiple chains with our secure, fast, and cost-effective bridge.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Supported Chains</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChains}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Networks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeChains}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Bridges</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBridges}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <ArrowRightLeft className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalBridges > 0 ? Math.round((stats.successfulBridges / stats.totalBridges) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('bridge')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'bridge'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    Bridge Transfer
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Network Stats
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Bridge History
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'bridge' && <CrossChainBridge />}
              
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Network Statistics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Current Network</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chain ID:</span>
                          <span className="font-medium">{stats.currentChain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-green-600 font-medium">Connected</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Bridge Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bridges:</span>
                          <span className="font-medium">{stats.totalBridges}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Successful:</span>
                          <span className="text-green-600 font-medium">{stats.successfulBridges}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-medium">
                            {stats.totalBridges > 0 ? Math.round((stats.successfulBridges / stats.totalBridges) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your Bridge History</h3>
                  
                  {userBridgeRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Bridge Transactions</h4>
                      <p className="text-gray-600">You haven't made any cross-chain transfers yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userBridgeRequests.map(request => (
                        <div key={request.requestId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                Bridge #{request.requestId}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 2 ? 'text-green-600 bg-green-50' :
                                request.status === 0 ? 'text-yellow-600 bg-yellow-50' :
                                'text-red-600 bg-red-50'
                              }`}>
                                {request.status === 2 ? 'Completed' :
                                 request.status === 0 ? 'Pending' : 'Failed'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(request.timestamp * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">From:</span>
                              <span className="ml-2 font-medium">Chain {request.sourceChainId}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">To:</span>
                              <span className="ml-2 font-medium">Chain {request.targetChainId}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span>
                              <span className="ml-2 font-medium">{parseFloat(request.amount).toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="p-3 bg-blue-50 rounded-full w-12 h-12 mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Trustless</h3>
              <p className="text-gray-600">
                Our bridge uses advanced cryptographic proofs and validator networks to ensure the security of your assets.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="p-3 bg-green-50 rounded-full w-12 h-12 mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">
                Experience lightning-fast transfers with minimal fees. Most bridges complete in under 10 minutes.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="p-3 bg-purple-50 rounded-full w-12 h-12 mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Chain Support</h3>
              <p className="text-gray-600">
                Connect to major blockchain networks including Ethereum, Polygon, Arbitrum, and more.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { 
  Plus, 
  RefreshCw, 
  Filter,
  Search,
  TrendingUp,
  Shield,
  Star,
  Zap,
  BarChart3,
  Target
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import StrategyCard from '../components/StrategyCard';
import { useYieldStrategies, Strategy } from '../hooks/useYieldStrategies';

export default function Strategies() {
  const { address, isConnected } = useAccount();
  const { 
    strategies, 
    userPositions,
    isLoading, 
    error, 
    deposit, 
    withdraw, 
    harvest,
    loadStrategies 
  } = useYieldStrategies();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter strategies
  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = filterRisk === 'all' || strategy.riskLevel.toString() === filterRisk;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && strategy.isActive) ||
                         (filterStatus === 'inactive' && !strategy.isActive);
    const matchesVerified = filterVerified === null || strategy.isVerified === filterVerified;
    
    return matchesSearch && matchesRisk && matchesStatus && matchesVerified;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStrategies();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeposit = async (strategyId: number, amount: string, token: string) => {
    try {
      await deposit(strategyId, amount, token);
      // Refresh strategies after deposit
      setTimeout(() => loadStrategies(), 2000);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async (strategyId: number, shares: string, token: string) => {
    try {
      await withdraw(strategyId, shares, token);
      // Refresh strategies after withdraw
      setTimeout(() => loadStrategies(), 2000);
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  const handleHarvest = async (strategyId: number) => {
    try {
      await harvest(strategyId);
      // Refresh strategies after harvest
      setTimeout(() => loadStrategies(), 2000);
    } catch (error) {
      console.error('Harvest failed:', error);
    }
  };

  // Calculate portfolio stats
  const portfolioStats = {
    totalStrategies: strategies.length,
    activeStrategies: strategies.filter(s => s.isActive).length,
    verifiedStrategies: strategies.filter(s => s.isVerified).length,
    totalDeposits: strategies.reduce((sum, s) => sum + parseFloat(s.totalDeposits), 0),
    userPositions: userPositions.size
  };

  return (
    <>
      <Head>
        <title>Yield Strategies - FluidVault</title>
        <meta name="description" content="Discover and invest in advanced yield strategies on FluidVault" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/logo-icon.svg" alt="FluidVault Logo" className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    FluidVault Strategies
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
                    href="/governance" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Governance
                  </a>
                  <a 
                    href="/strategies" 
                    className="text-blue-600 font-medium"
                  >
                    Strategies
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
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
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
              Advanced Yield Strategies
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover and invest in community-created yield strategies. 
              Maximize your returns with automated yield farming and risk management.
            </p>
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Strategies</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolioStats.totalStrategies}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Strategies</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolioStats.activeStrategies}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolioStats.verifiedStrategies}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Deposits</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolioStats.totalDeposits.toFixed(1)}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Your Positions</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolioStats.userPositions}</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-50">
                  <Target className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search strategies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="1">Very Low Risk</option>
                  <option value="2">Low Risk</option>
                  <option value="3">Low-Medium Risk</option>
                  <option value="4">Medium Risk</option>
                  <option value="5">Medium-High Risk</option>
                  <option value="6">High Risk</option>
                  <option value="7">Very High Risk</option>
                  <option value="8">Extremely High Risk</option>
                  <option value="9">Maximum Risk</option>
                  <option value="10">Ultra High Risk</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  value={filterVerified === null ? 'all' : filterVerified.toString()}
                  onChange={(e) => setFilterVerified(e.target.value === 'all' ? null : e.target.value === 'true')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Verification</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                {isConnected && (
                  <button
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Strategy
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Strategies List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading strategies...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <TrendingUp className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to Load Strategies
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredStrategies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <TrendingUp className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Strategies Found
                </h3>
                <p className="text-gray-600 mb-4">
                  {strategies.length === 0 
                    ? "No yield strategies have been created yet. Be the first to create one!"
                    : "No strategies match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {isConnected && strategies.length === 0 && (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Create First Strategy
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Yield Strategies ({filteredStrategies.length})
                  </h2>
                </div>
                
                <div className="grid gap-6">
                  {filteredStrategies.map((strategy) => (
                    <StrategyCard
                      key={strategy.id}
                      strategy={strategy}
                      userPosition={userPositions.get(strategy.id)}
                      onDeposit={handleDeposit}
                      onWithdraw={handleWithdraw}
                      onHarvest={handleHarvest}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

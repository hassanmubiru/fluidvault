import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { 
  Plus, 
  RefreshCw, 
  Filter,
  Search,
  Users,
  Vote,
  Clock,
  TrendingUp,
  User,
  Shield,
  Timer,
  BarChart3
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ProposalCard from '../components/ProposalCard';
import CreateProposal from '../components/CreateProposal';
import GovernanceStats from '../components/GovernanceStats';
import { DelegationManager } from '../components/DelegationManager';
import { AdvancedVotingInterface } from '../components/AdvancedVotingInterface';
import { TimelockDisplay } from '../components/TimelockDisplay';
import { EscrowManager } from '../components/EscrowManager';
import { useGovernance, Proposal } from '../hooks/useGovernance';

export default function Governance() {
  const { address, isConnected } = useAccount();
  const { 
    proposals, 
    isLoading, 
    error, 
    vote, 
    executeProposal, 
    cancelProposal,
    loadProposals 
  } = useGovernance();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposals' | 'delegation' | 'voting' | 'timelock' | 'escrow'>('proposals');
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  // Filter proposals
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || proposal.proposalType.toString() === filterType;
    
    const now = Math.floor(Date.now() / 1000);
    const isActive = now >= proposal.startTime && now <= proposal.endTime && !proposal.executed && !proposal.cancelled;
    const canExecute = now > proposal.endTime && !proposal.executed && !proposal.cancelled;
    
    let matchesStatus = true;
    if (filterStatus === 'active') matchesStatus = isActive;
    else if (filterStatus === 'executed') matchesStatus = proposal.executed;
    else if (filterStatus === 'cancelled') matchesStatus = proposal.cancelled;
    else if (filterStatus === 'ready') matchesStatus = canExecute;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProposals();
    } finally {
      setRefreshing(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    try {
      await vote(proposalId, support);
      // Refresh proposals after voting
      setTimeout(() => loadProposals(), 2000);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleExecute = async (proposalId: number) => {
    try {
      await executeProposal(proposalId);
      // Refresh proposals after execution
      setTimeout(() => loadProposals(), 2000);
    } catch (error) {
      console.error('Execute failed:', error);
    }
  };

  const handleCancel = async (proposalId: number) => {
    try {
      await cancelProposal(proposalId);
      // Refresh proposals after cancellation
      setTimeout(() => loadProposals(), 2000);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const handleProposalCreated = () => {
    // Refresh proposals after creation
    setTimeout(() => loadProposals(), 2000);
  };

  return (
    <>
      <Head>
        <title>Governance - FluidVault</title>
        <meta name="description" content="Participate in FluidVault governance and vote on platform proposals" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/logo-icon.svg" alt="FluidVault Logo" className="w-8 h-8" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  FluidVault Governance
                </span>
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
              Advanced Governance
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Participate in decentralized decision-making with delegation, advanced voting, 
              timelock, and escrow features. Shape the future of FluidVault.
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'proposals', label: 'Proposals', icon: Vote },
                  { id: 'delegation', label: 'Delegation', icon: User },
                  { id: 'voting', label: 'Advanced Voting', icon: BarChart3 },
                  { id: 'timelock', label: 'Timelock', icon: Timer },
                  { id: 'escrow', label: 'Escrow', icon: Shield }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Governance Stats */}
          <div className="mb-8">
            <GovernanceStats />
          </div>

          {/* Tab Content */}
          {activeTab === 'proposals' && (
            <>
              {/* Controls */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search proposals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                      />
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="0">Interest Rate Update</option>
                      <option value="1">Platform Fee Update</option>
                      <option value="2">Vault Creation</option>
                      <option value="3">Vault Deactivation</option>
                      <option value="4">Operator Management</option>
                      <option value="5">Emergency Pause</option>
                      <option value="6">Parameter Update</option>
                    </select>
                    
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="ready">Ready to Execute</option>
                      <option value="executed">Executed</option>
                      <option value="cancelled">Cancelled</option>
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
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create Proposal
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Proposals List */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading proposals...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                      <Vote className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Failed to Load Proposals
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredProposals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Vote className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Proposals Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {proposals.length === 0 
                        ? "No proposals have been created yet. Be the first to create one!"
                        : "No proposals match your current filters. Try adjusting your search criteria."
                      }
                    </p>
                    {isConnected && proposals.length === 0 && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        Create First Proposal
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Proposals ({filteredProposals.length})
                      </h2>
                    </div>
                    
                    <div className="grid gap-6">
                      {filteredProposals.map((proposal) => (
                        <ProposalCard
                          key={proposal.id}
                          proposal={proposal}
                          onVote={handleVote}
                          onExecute={handleExecute}
                          onCancel={handleCancel}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === 'delegation' && (
            <DelegationManager />
          )}

          {activeTab === 'voting' && (
            <div className="space-y-6">
              {selectedProposal ? (
                <AdvancedVotingInterface proposalId={selectedProposal} />
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Proposal</h3>
                  <p className="text-gray-600 mb-4">Choose a proposal from the Proposals tab to use advanced voting</p>
                  <button
                    onClick={() => setActiveTab('proposals')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    View Proposals
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timelock' && (
            <div className="space-y-6">
              {selectedProposal ? (
                <TimelockDisplay proposalId={selectedProposal} />
              ) : (
                <div className="text-center py-12">
                  <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Proposal</h3>
                  <p className="text-gray-600 mb-4">Choose a proposal from the Proposals tab to view timelock information</p>
                  <button
                    onClick={() => setActiveTab('proposals')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    View Proposals
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'escrow' && (
            <EscrowManager />
          )}
        </main>

        {/* Create Proposal Modal */}
        {showCreateModal && (
          <CreateProposal
            onClose={() => setShowCreateModal(false)}
            onProposalCreated={handleProposalCreated}
          />
        )}
      </div>
    </>
  );
}

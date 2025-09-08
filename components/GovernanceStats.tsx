import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Users, 
  Vote, 
  Clock, 
  TrendingUp, 
  Shield,
  Activity,
  BarChart3
} from 'lucide-react';
import { useGovernance, Proposal } from '../hooks/useGovernance';

export default function GovernanceStats() {
  const { address, isConnected } = useAccount();
  const { proposals, userVotingPower, governanceParams, loadProposals } = useGovernance();
  
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    executedProposals: 0,
    totalVotes: 0,
    participationRate: 0
  });

  // Calculate stats from proposals
  useEffect(() => {
    if (proposals.length === 0) return;

    const totalProposals = proposals.length;
    const activeProposals = proposals.filter(p => {
      const now = Math.floor(Date.now() / 1000);
      return now >= p.startTime && now <= p.endTime && !p.executed && !p.cancelled;
    }).length;
    
    const executedProposals = proposals.filter(p => p.executed).length;
    
    const totalVotes = proposals.reduce((sum, p) => {
      return sum + parseFloat(p.forVotes) + parseFloat(p.againstVotes);
    }, 0);

    // Calculate participation rate (simplified)
    const participationRate = totalProposals > 0 ? (executedProposals / totalProposals) * 100 : 0;

    setStats({
      totalProposals,
      activeProposals,
      executedProposals,
      totalVotes,
      participationRate
    });
  }, [proposals]);

  const statCards = [
    {
      title: 'Total Proposals',
      value: stats.totalProposals.toString(),
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Proposals',
      value: stats.activeProposals.toString(),
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Executed Proposals',
      value: stats.executedProposals.toString(),
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Votes Cast',
      value: stats.totalVotes.toFixed(0),
      icon: <Vote className="w-6 h-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* User Voting Power */}
      {isConnected && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Your Voting Power</h3>
              <p className="text-blue-100 text-sm">
                Participate in governance decisions
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {parseFloat(userVotingPower).toFixed(2)}
              </div>
              <div className="text-blue-100 text-sm">
                Voting Power
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Governance Parameters */}
      {governanceParams && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Governance Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Voting Period</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.floor(governanceParams.votingPeriod / 86400)} days
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Quorum Threshold</div>
              <div className="text-lg font-semibold text-gray-900">
                {(governanceParams.quorumThreshold / 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Majority Threshold</div>
              <div className="text-lg font-semibold text-gray-900">
                {(governanceParams.majorityThreshold / 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participation Rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Community Participation
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Proposal Execution Rate</span>
              <span>{stats.participationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.participationRate, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {stats.executedProposals} out of {stats.totalProposals} proposals have been successfully executed by the community.
          </p>
        </div>
      </div>
    </div>
  );
}

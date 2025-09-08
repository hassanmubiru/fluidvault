import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Plus, X, AlertCircle } from 'lucide-react';
import { useGovernance, PROPOSAL_TYPES } from '../hooks/useGovernance';

interface CreateProposalProps {
  onClose: () => void;
  onProposalCreated?: (proposalId: number) => void;
}

export default function CreateProposal({ onClose, onProposalCreated }: CreateProposalProps) {
  const { address, isConnected } = useAccount();
  const { createProposal, isLoading, error } = useGovernance();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const txHash = await createProposal(title.trim(), description.trim(), proposalType);
      console.log('Proposal created:', txHash);
      
      // Reset form
      setTitle('');
      setDescription('');
      setProposalType(0);
      
      // Close modal and notify parent
      onClose();
      if (onProposalCreated) {
        onProposalCreated(0); // We don't have the actual proposal ID yet
      }
      
      alert('Proposal created successfully! Transaction: ' + txHash);
    } catch (err: any) {
      console.error('Failed to create proposal:', err);
      alert('Failed to create proposal: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to create a proposal.
            </p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Proposal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, concise title for your proposal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of your proposal, including the rationale and expected outcomes"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Proposal Type */}
          <div>
            <label htmlFor="proposalType" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Type *
            </label>
            <select
              id="proposalType"
              value={proposalType}
              onChange={(e) => setProposalType(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {Object.entries(PROPOSAL_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the type of proposal you want to create
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting || isLoading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Proposal Guidelines
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Be clear and specific about what you want to change</li>
            <li>• Provide reasoning and expected benefits</li>
            <li>• Consider the impact on all stakeholders</li>
            <li>• Proposals require community voting to be executed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

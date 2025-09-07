import { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export default function DeploymentGuide() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = async (text: string, commandId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const deploymentSteps = [
    {
      id: 'setup',
      title: '1. Setup Environment',
      description: 'Create your environment file and configure the network',
      commands: [
        'cp env.example .env.local',
        'npm install'
      ]
    },
    {
      id: 'configure',
      title: '2. Configure Environment',
      description: 'Add your private key and network configuration',
      commands: [
        '# Edit .env.local with your private key',
        'PRIVATE_KEY=your_private_key_here',
        'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id'
      ]
    },
    {
      id: 'deploy',
      title: '3. Deploy Contracts',
      description: 'Deploy the smart contracts to Somnia testnet',
      commands: [
        'npm run compile',
        'npm run deploy:testnet'
      ]
    },
    {
      id: 'update',
      title: '4. Update Frontend',
      description: 'Update the frontend with deployed contract addresses',
      commands: [
        '# Copy contract addresses from deployment output',
        '# Update .env.local with contract addresses'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <AlertCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Deployment Guide</h3>
      </div>

      <div className="space-y-6">
        {deploymentSteps.map((step) => (
          <div key={step.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-medium text-gray-900">{step.title}</h4>
            </div>
            <p className="text-gray-600 mb-4">{step.description}</p>
            
            <div className="space-y-2">
              {step.commands.map((command, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded p-2">
                  <code className="flex-1 text-sm text-gray-800 font-mono">
                    {command}
                  </code>
                  <button
                    onClick={() => copyToClipboard(command, `${step.id}-${index}`)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedCommand === `${step.id}-${index}` ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-blue-800 mb-2">Need Help?</h4>
          <p className="text-blue-700 mb-3">
            Check out the detailed deployment guide and documentation:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="https://github.com/your-username/fluidvault/blob/main/DEPLOYMENT_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <span>Deployment Guide</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/your-username/fluidvault"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Make sure you have STT tokens for gas fees on Somnia testnet</li>
            <li>• Keep your private key secure and never commit it to version control</li>
            <li>• Test the deployment on a local network first if possible</li>
            <li>• Verify contract deployment on the block explorer after deployment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

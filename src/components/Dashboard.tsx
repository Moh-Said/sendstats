import React, { useState } from 'react';
import { useLiveTransfers } from '../hooks/useLiveTransfers';
import { TransfersTab } from './TransfersTab';
import { StatsTab } from './StatsTab';
import { TokenInfoCard } from './TokenInfoCard';
import { ConnectionStatus } from './ConnectionStatus';
import GithubIcon from '../assets/github.svg';

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (fallbackErr) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transfers' | 'stats'>('transfers');
  const [copied, setCopied] = useState(false);
  const { events, newEventIds, isAnimating } = useLiveTransfers();

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col bg-black min-h-screen font-mono text-white">
      <div className="flex-1 mx-auto px-4 md:px-15 py-8 container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="flex items-center gap-0 font-bold text-gray-100 text-4xl">
            <span className="font-bold text-green-400">/s</span>
            end stats
          </h1>
          <ConnectionStatus />
        </div>

        <div className='flex lg:flex-row flex-col gap-5'>

        {/* Tabs */}
        <div className="flex flex-1 justify-center order-1 mb-6">
          <div className="flex gap-1.5 lg:order-0 bg-gray-900 p-1 rounded-lg w-full lg:h-full">
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-6 py-2 rounded-md cursor-pointer border-[#1b613f] border font-medium transition-colors ${
                activeTab === 'transfers'
                  ? 'bg-green-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2 rounded-md cursor-pointer  border-[#1b613f] border font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-green-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stats
            </button>
          </div>
        </div>

        <TokenInfoCard  />

        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 p-2 lg:p-6 rounded-lg">
          {activeTab === 'transfers' && <TransfersTab events={events} newEventIds={newEventIds} isAnimating={isAnimating} />}
          {activeTab === 'stats' && <StatsTab />}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mx-auto mb-6 px-4 md:px-15 text-center container" >
        <div className='bg-gray-900 rounded-lg'>
        <p className="p-5 text-white text-sm">
          if you like this tiny app, please consider sending to this Sendtag : {' '}/
          <button
            onClick={() => handleCopy('mohus000')}
            className={`font-mono cursor-pointer transition-colors duration-200 ${
              copied ? 'text-yellow-300' : 'hover:text-green-300 text-green-400'
            }`}
          >
            mohus000
          </button>
        </p>
        <p className='text-sm'>
          EVM address : <button
            onClick={() => handleCopy('0x77f6919281214a47C7962D7F3741f6d995D50D59')}
            className={`font-mono cursor-pointer transition-colors duration-200 ${
              copied ? 'text-yellow-300' : 'hover:text-green-300 text-green-400'
            }`}
          >
            0x77f6919281214a47C7962D7F3741f6d995D50D59
          </button>
        </p>
        <div className="flex justify-center items-center">
          <a
            href="https://github.com/example/repo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-1.5 p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <img src={GithubIcon} alt="GitHub" className="w-6 h-6" />
            Github
          </a>
        </div>
        </div>
      </footer>
    </div>
  );
};
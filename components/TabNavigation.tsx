import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Tab } from '../types';
import { Pickaxe, HandCoins, Trophy, Wallet } from 'lucide-react';

const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useGame();

  const tabs = [
    { id: Tab.EXCHANGE, label: 'Игра', icon: <HandCoins size={24} /> },
    { id: Tab.MINE, label: 'Улучшения', icon: <Pickaxe size={24} /> },
    { id: Tab.TOP, label: 'Топ', icon: <Trophy size={24} /> },
    { id: Tab.AIRDROP, label: 'Airdrop', icon: <Wallet size={24} /> },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 h-20 bg-[#1c1c1e]/90 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-around px-2 z-50 shadow-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
            activeTab === tab.id 
              ? 'text-yellow-400 scale-105' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className={`${activeTab === tab.id ? 'animate-bounce-subtle' : ''}`}>
             {tab.icon}
          </div>
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
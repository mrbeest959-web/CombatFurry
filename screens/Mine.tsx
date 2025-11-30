import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { UPGRADES } from '../constants';
import { UpgradeItem } from '../types';

const Mine: React.FC = () => {
  const { state, buyUpgrade, calculateUpgradeCost } = useGame();
  const [filter, setFilter] = useState<'Технологии' | 'Арт' | 'Ивенты' | 'Крипта'>('Технологии');

  const categories = ['Технологии', 'Арт', 'Ивенты', 'Крипта'];

  const handleBuy = (item: UpgradeItem) => {
    buyUpgrade(item);
  };

  return (
    <div className="flex flex-col h-full pb-24 pt-4 px-4 overflow-hidden">
      
      {/* Header Info */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Прибыль в час</p>
        <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] font-bold text-black">$</div>
            <h2 className="text-3xl font-mono font-bold text-white">+{state.profitPerHour.toLocaleString()}</h2>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-[#1c1c1e] p-4 rounded-xl flex justify-between items-center mb-6 border border-white/5">
        <span className="text-gray-400 text-sm">Баланс кошелька</span>
        <span className="text-xl font-bold font-mono">{Math.floor(state.balance).toLocaleString()}</span>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[#1c1c1e] rounded-xl mb-6">
        {categories.map((cat) => (
            <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    filter === cat 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3 pb-20">
        {UPGRADES.filter(u => u.category === filter).map(item => {
            const currentLevel = state.purchasedUpgrades[item.id] || 0;
            const cost = calculateUpgradeCost(item.basePrice, currentLevel);
            const canAfford = state.balance >= cost;

            return (
                <div 
                    key={item.id}
                    onClick={() => canAfford && handleBuy(item)}
                    className={`bg-[#1c1c1e] rounded-2xl p-4 border transition-all active:scale-95 flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                        canAfford ? 'border-white/10 cursor-pointer hover:border-yellow-400/50' : 'border-red-500/20 opacity-70 cursor-not-allowed'
                    }`}
                >
                    {/* Level Badge */}
                    <div className="absolute top-0 right-0 bg-white/10 px-2 py-1 rounded-bl-lg text-[10px] text-gray-400">
                        Ур {currentLevel}
                    </div>

                    <div className="flex items-start space-x-3 mb-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                            <h3 className="text-sm font-bold text-white leading-tight mb-1">{item.name}</h3>
                            <p className="text-[10px] text-gray-500">{item.description}</p>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="text-[10px] text-gray-400 mb-1">Доход/ч: <span className="text-white font-mono">+{item.baseProfit * (currentLevel + 1)}</span></div>
                        <div className="flex items-center space-x-1">
                            <div className={`w-full py-2 rounded-lg text-xs font-bold text-center ${canAfford ? 'bg-white/10 text-white' : 'bg-red-900/20 text-red-400'}`}>
                                {cost.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

    </div>
  );
};

export default Mine;
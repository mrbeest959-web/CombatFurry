import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Crown, Trophy, Medal, Globe } from 'lucide-react';
import { LEVEL_THRESHOLDS } from '../constants';

const Leaderboard: React.FC = () => {
  const { state, leaderboard } = useGame();
  
  const currentLevelName = LEVEL_THRESHOLDS[Math.min(state.level - 1, LEVEL_THRESHOLDS.length - 1)].name;

  // Find user's rank
  const userRank = leaderboard.find(u => u.isCurrentUser)?.rank || 0;

  return (
    <div className="flex flex-col h-full pt-6 px-4 pb-24 overflow-hidden relative">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-yellow-900/20 to-transparent pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center space-x-3">
                <Globe className="text-blue-400 animate-pulse" size={24} />
                <span className="tracking-tight">Global Ranking</span>
            </h1>
            <div className="flex items-center justify-center space-x-2">
                 <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-black"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-black"></div>
                    <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-black"></div>
                 </div>
                 <p className="text-gray-400 text-xs font-mono">
                    12,402,931 игроков
                </p>
            </div>
        </div>

        {/* Current League Display */}
        <div className="bg-gradient-to-br from-[#1c1c1e] to-black border border-yellow-500/20 rounded-2xl p-6 mb-6 text-center relative overflow-hidden shadow-2xl z-10 animate-slide-in-bottom">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 font-black text-2xl mb-1 uppercase tracking-widest">{currentLevelName}</h2>
            <div className="flex justify-center items-center space-x-2 text-gray-400 text-xs mt-2">
                <Trophy size={12} className="text-yellow-500" />
                <span>Ваш ранг: <span className="text-white font-bold">#{userRank}</span></span>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 z-10 relative">
            
            {leaderboard.map((user, index) => {
                const isTop3 = user.rank <= 3;
                const isMe = user.isCurrentUser;
                
                return (
                    <div 
                        key={user.id} 
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={`
                            rounded-xl p-4 flex items-center justify-between border relative overflow-hidden transition-all duration-300 animate-slide-in-bottom
                            ${isMe 
                                ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-[1.02]' 
                                : 'bg-[#1c1c1e] border-white/5 opacity-90 hover:opacity-100'
                            }
                            ${isTop3 ? 'mb-2' : ''}
                        `}
                    >
                        {isMe && <div className="absolute inset-0 bg-yellow-400/5 animate-pulse pointer-events-none"></div>}
                        
                        <div className="flex items-center space-x-4 relative z-10">
                            {/* Rank Badge */}
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2
                                ${user.rank === 1 ? 'bg-yellow-400 text-black border-yellow-200 shadow-[0_0_10px_#facc15]' : 
                                  user.rank === 2 ? 'bg-gray-300 text-black border-white shadow-[0_0_10px_#d1d5db]' : 
                                  user.rank === 3 ? 'bg-orange-400 text-black border-orange-200 shadow-[0_0_10px_#fb923c]' : 
                                  'bg-white/5 text-gray-500 border-transparent'}
                            `}>
                                {user.rank <= 3 ? <Crown size={16} fill="currentColor" /> : user.rank}
                            </div>

                            <div className="flex flex-col">
                                <span className={`font-bold ${isMe ? 'text-yellow-400' : 'text-gray-200'} ${isTop3 ? 'text-lg' : 'text-sm'}`}>
                                    {user.name} {isMe && '(Вы)'}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                    {Math.floor(user.balance).toLocaleString()} монет
                                </span>
                            </div>
                        </div>
                        
                        {isTop3 && <Medal className={`
                            ${user.rank === 1 ? 'text-yellow-400' : 
                              user.rank === 2 ? 'text-gray-300' : 
                              'text-orange-400'}
                        `} size={24} />}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default Leaderboard;
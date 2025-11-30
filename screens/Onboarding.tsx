import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Globe, ArrowRight } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { registerUser } = useGame();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      registerUser(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md flex flex-col items-center animate-fade-in">
        <div className="mb-8 relative">
           <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"></div>
           <Globe size={80} className="text-yellow-400 relative z-10 animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 text-center tracking-tight">FurryCombat</h1>
        <p className="text-gray-400 mb-8 text-center text-sm uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-white/5">
          Официальный релиз 1.0
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Введите ваш никнейм..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1c1c1e] text-white border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-colors text-lg placeholder:text-gray-600"
              maxLength={15}
            />
          </div>

          <button 
            type="submit" 
            disabled={!name.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <span>Начать фарминг</span>
            <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="mt-8 text-xs text-green-500 flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>База данных подключена</span>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
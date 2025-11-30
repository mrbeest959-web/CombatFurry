import React, { useState, useEffect } from 'react';
import { UserState, GameTab, Upgrade } from './types';
import { INITIAL_UPGRADES, MAX_ENERGY_BASE, ENERGY_REGEN_RATE, LEVEL_THRESHOLDS } from './constants';
import GameTabComponent from './components/GameTab';
import MineTabComponent from './components/MineTab';
import WalletTabComponent from './components/WalletTab';
import TopTabComponent from './components/TopTab';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameTab>(GameTab.EXCHANGE);
  
  // Game State - Initialized synchronously from localStorage to avoid loading screens
  const [userState, setUserState] = useState<UserState>(() => {
    const defaultState: UserState = {
        username: null,
        balance: 0,
        profitPerHour: 0,
        energy: MAX_ENERGY_BASE,
        maxEnergy: MAX_ENERGY_BASE,
        level: 0,
        tapPower: 1,
        lastSync: Date.now(),
        unlockedSkins: ['default'],
        currentSkin: 'default'
    };

    try {
        const storedUser = localStorage.getItem('fc_user_data');
        if (storedUser) {
            return { ...defaultState, ...JSON.parse(storedUser) };
        }
    } catch (e) {
        // Ignore privacy mode errors
    }
    return defaultState;
  });

  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);

  // Save Loop & Passive Income
  useEffect(() => {
    if (!userState.username) return; // Don't run game loop if not onboarded

    const interval = setInterval(() => {
      const now = Date.now();
      setUserState(prev => {
        const timeDiff = (now - prev.lastSync) / 1000; // in seconds
        if (timeDiff < 0.1) return prev; 

        const profitPerSecond = prev.profitPerHour / 3600;
        const generatedIncome = profitPerSecond * timeDiff;
        const energyRegen = ENERGY_REGEN_RATE * timeDiff;

        // Calculate Level
        let newLevel = prev.level;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if ((prev.balance + generatedIncome) >= LEVEL_THRESHOLDS[i]) {
                newLevel = i;
                break;
            }
        }
        
        const newTapPower = 1 + (newLevel * 2) + Math.floor(prev.profitPerHour / 1000);
        
        const newState = {
          ...prev,
          balance: prev.balance + generatedIncome,
          energy: Math.min(prev.maxEnergy, prev.energy + energyRegen),
          level: newLevel,
          tapPower: newTapPower,
          lastSync: now,
        };

        // Auto Save to LocalStorage
        try {
          localStorage.setItem('fc_user_data', JSON.stringify({
              username: newState.username,
              balance: newState.balance,
              profitPerHour: newState.profitPerHour,
              level: newState.level,
              unlockedSkins: newState.unlockedSkins,
              currentSkin: newState.currentSkin,
              lastSync: now
          }));
        } catch (e) {
          // Ignore save errors
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userState.username]);

  const handleOnboardingComplete = (username: string) => {
    const newUserState = {
        ...userState,
        username: username
    };
    setUserState(newUserState);
    try {
      localStorage.setItem('fc_user_data', JSON.stringify(newUserState));
    } catch (e) {
      console.warn("Save failed");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case GameTab.EXCHANGE:
        return <GameTabComponent userState={userState} setUserState={setUserState} />;
      case GameTab.MINE:
        return <MineTabComponent userState={userState} setUserState={setUserState} upgrades={upgrades} setUpgrades={setUpgrades} />;
      case GameTab.AIRDROP:
        return <WalletTabComponent />;
      case GameTab.TOP:
        return <TopTabComponent userState={userState} />;
      default:
        return null;
    }
  };

  if (!userState.username) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="bg-black text-white min-h-screen font-sans flex flex-col items-center">
      {/* Container simulating mobile screen width on desktop */}
      <div className="w-full max-w-md h-[100dvh] bg-[#050505] relative flex flex-col shadow-2xl overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-purple-900/20 blur-[100px] pointer-events-none rounded-full"></div>

        {/* Main Content Area */}
        <div className="flex-1 w-full overflow-hidden relative z-10">
             {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <BottomNav currentTab={activeTab} setTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;

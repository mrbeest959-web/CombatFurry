import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserState, UpgradeItem, SkinItem, Tab, LeaderboardUser } from '../types';
import { UPGRADES, SKINS, LEVEL_THRESHOLDS, INITIAL_LEADERBOARD_BOTS } from '../constants';

const INITIAL_STATE: UserState = {
  username: '',
  isOnboarded: false,
  balance: 0,
  profitPerHour: 0,
  energy: 2000,
  maxEnergy: 2000,
  lastLogin: Date.now(),
  level: 1,
  purchasedUpgrades: {},
  unlockedSkins: ['furcoin'],
  activeSkin: 'furcoin',
  walletConnected: false
};

interface GameContextType {
  state: UserState;
  activeTab: Tab;
  leaderboard: LeaderboardUser[];
  setActiveTab: (tab: Tab) => void;
  registerUser: (name: string) => void;
  handleTap: (amount: number) => boolean;
  buyUpgrade: (upgrade: UpgradeItem) => boolean;
  buySkin: (skin: SkinItem) => boolean;
  equipSkin: (skinId: string) => void;
  calculateUpgradeCost: (basePrice: number, level: number) => number;
  connectWallet: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.EXCHANGE);
  const [bots, setBots] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD_BOTS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initialize Game State from Storage
  useEffect(() => {
    const initGame = async () => {
        try {
            const storageAvailable = typeof window !== 'undefined' && window.localStorage;
            if (storageAvailable) {
                // Load User Data
                const saved = localStorage.getItem('furry_combat_save');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    
                    // Offline Calc
                    const now = Date.now();
                    const lastLogin = parsed.lastLogin || now;
                    const secondsPassed = (now - lastLogin) / 1000;
                    
                    // Max 3 hours of offline earnings to prevent abuse
                    const validSeconds = Math.min(secondsPassed, 3 * 3600); 
                    const offlineEarnings = Math.floor((parsed.profitPerHour / 3600) * validSeconds);
                    
                    // Energy Regen
                    const energyRecovery = Math.floor(secondsPassed * 4);
                    const newEnergy = Math.min(parsed.maxEnergy, parsed.energy + energyRecovery);

                    setState({
                        ...parsed,
                        balance: parsed.balance + (Number.isNaN(offlineEarnings) ? 0 : offlineEarnings),
                        energy: Number.isNaN(newEnergy) ? 2000 : newEnergy,
                        lastLogin: now,
                        walletConnected: parsed.walletConnected || false
                    });
                }

                // Load Bot Data
                const savedBots = localStorage.getItem('furry_combat_bots');
                if (savedBots) {
                    setBots(JSON.parse(savedBots));
                }
            }
        } catch (e) {
            console.error("Initialization error:", e);
        } finally {
            setLoaded(true);
        }
    };
    
    initGame();
  }, []);

  // Bot Logic (Fake Live Leaderboard)
  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
        setBots(prevBots => {
            const updatedBots = prevBots.map(bot => ({
                ...bot,
                balance: bot.balance + Math.floor(Math.random() * 800)
            }));

            // Auto-Save Bots
            try {
               localStorage.setItem('furry_combat_bots', JSON.stringify(updatedBots));
            } catch {}
            
            return updatedBots;
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [loaded]);

  // Leaderboard Construction
  useEffect(() => {
    if (!state.isOnboarded) return;

    const currentUserEntry: LeaderboardUser = {
        id: 'user_current',
        rank: 0,
        name: state.username,
        balance: state.balance,
        isCurrentUser: true
    };

    const allUsers = [...bots, currentUserEntry];
    allUsers.sort((a, b) => b.balance - a.balance);
    const ranked = allUsers.map((u, i) => ({ ...u, rank: i + 1 }));
    
    setLeaderboard(ranked);
  }, [state.balance, state.username, state.isOnboarded, bots]);

  // Game Loop (Passive Income & Save)
  useEffect(() => {
    if (!loaded || !state.isOnboarded) return;

    const interval = setInterval(() => {
      setState(prev => {
        const profitPerSecond = prev.profitPerHour / 3600;
        const newBalance = prev.balance + profitPerSecond;
        const newEnergy = Math.min(prev.maxEnergy, prev.energy + 4);
        
        const newState = {
          ...prev,
          balance: newBalance,
          energy: newEnergy,
          lastLogin: Date.now()
        };
        
        // Auto-Save User
        try {
            localStorage.setItem('furry_combat_save', JSON.stringify(newState));
        } catch {}

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loaded, state.isOnboarded]);

  const registerUser = (name: string) => {
    const newState = {
      ...state,
      username: name,
      isOnboarded: true
    };
    setState(newState);
    try {
        localStorage.setItem('furry_combat_save', JSON.stringify(newState));
    } catch {}
  };

  const handleTap = (amount: number) => {
    if (state.energy < amount) return false;
    setState(prev => {
        // Recalculate level
        let level = 1;
        const newBalance = prev.balance + amount;
        for(let i=0; i<LEVEL_THRESHOLDS.length; i++) {
            if (newBalance >= LEVEL_THRESHOLDS[i].threshold) {
                level = i + 1;
            }
        }

        return {
            ...prev,
            balance: newBalance,
            energy: prev.energy - amount,
            level: level
        };
    });
    return true;
  };

  const calculateUpgradeCost = (basePrice: number, level: number) => {
    return Math.floor(basePrice * Math.pow(1.25, level)); // Increased scaling slightly
  };

  const buyUpgrade = (upgrade: UpgradeItem) => {
    const currentLevel = state.purchasedUpgrades[upgrade.id] || 0;
    const cost = calculateUpgradeCost(upgrade.basePrice, currentLevel);

    if (state.balance >= cost) {
      setState(prev => ({
        ...prev,
        balance: prev.balance - cost,
        profitPerHour: prev.profitPerHour + upgrade.baseProfit * (currentLevel + 1),
        purchasedUpgrades: {
          ...prev.purchasedUpgrades,
          [upgrade.id]: currentLevel + 1
        }
      }));
      return true;
    }
    return false;
  };

  const buySkin = (skin: SkinItem) => {
    if (state.unlockedSkins.includes(skin.id)) return true;
    if (state.balance >= skin.price) {
      setState(prev => ({
        ...prev,
        balance: prev.balance - skin.price,
        unlockedSkins: [...prev.unlockedSkins, skin.id],
        activeSkin: skin.id
      }));
      return true;
    }
    return false;
  };

  const equipSkin = (skinId: string) => {
    if (state.unlockedSkins.includes(skinId)) {
        setState(prev => ({ ...prev, activeSkin: skinId }));
    }
  };

  const connectWallet = () => {
    setState(prev => {
        const newState = { ...prev, walletConnected: true };
        localStorage.setItem('furry_combat_save', JSON.stringify(newState));
        return newState;
    });
  };

  // If loading takes too long, render a blank screen (black) to avoid FOUC
  if (!loaded) {
      return <div className="h-screen w-full bg-black" />;
  }

  return (
    <GameContext.Provider value={{ 
      state, 
      activeTab, 
      leaderboard,
      setActiveTab, 
      registerUser, 
      handleTap, 
      buyUpgrade, 
      calculateUpgradeCost,
      buySkin, 
      equipSkin,
      connectWallet
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
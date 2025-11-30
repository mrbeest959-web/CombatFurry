import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserState, UpgradeItem, SkinItem, Tab, LeaderboardUser } from '../types';
import { UPGRADES, SKINS, LEVEL_THRESHOLDS, INITIAL_LEADERBOARD_BOTS } from '../constants';
// Removed Loader2 import to prevent crash if icon lib fails to load initially

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

  // Load from local storage with Robust Error Handling
  useEffect(() => {
    const initGame = async () => {
        try {
            // Check if storage is available
            const storageAvailable = typeof window !== 'undefined' && window.localStorage;
            
            if (storageAvailable) {
                // Load User
                const saved = localStorage.getItem('furry_combat_save');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        
                        // Calculate offline earnings
                        const now = Date.now();
                        const secondsPassed = (now - (parsed.lastLogin || now)) / 1000;
                        const offlineEarnings = Math.floor((parsed.profitPerHour / 3600) * secondsPassed);
                        
                        // Energy Recovery
                        const energyRecovery = Math.floor(secondsPassed * 4);
                        const newEnergy = Math.min(parsed.maxEnergy, parsed.energy + energyRecovery);

                        setState({
                            ...parsed,
                            balance: parsed.balance + (Number.isNaN(offlineEarnings) ? 0 : offlineEarnings),
                            energy: Number.isNaN(newEnergy) ? 2000 : newEnergy,
                            lastLogin: now,
                            walletConnected: parsed.walletConnected || false 
                        });
                    } catch (parseError) {
                        console.error("Error parsing save file, resetting:", parseError);
                        // Optional: localStorage.removeItem('furry_combat_save');
                    }
                }

                // Load Leaderboard DB (Bots)
                const savedBots = localStorage.getItem('furry_combat_bots');
                if (savedBots) {
                    try {
                        setBots(JSON.parse(savedBots));
                    } catch (e) { console.error("Error parsing bots", e); }
                }
            }
        } catch (e) {
            console.error("Critical storage error:", e);
        } finally {
            // Always set loaded to true so the app starts even if storage fails
            setLoaded(true);
        }
    };
    
    // Small timeout to ensure DOM is ready and prevent race conditions
    setTimeout(initGame, 100);
  }, []);

  // Simulate Live Leaderboard (Bots gaining score) & Persist to DB
  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
        setBots(prevBots => {
            const updatedBots = prevBots.map(bot => ({
                ...bot,
                balance: bot.balance + Math.floor(Math.random() * 500) // Bots farm too!
            }));

            // Save to "Database" (LocalStorage)
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem('furry_combat_bots', JSON.stringify(updatedBots));
                }
            } catch (e) {
                // Silent fail for storage quotas
            }
            
            return updatedBots;
        });
    }, 2000); // Updates every 2 seconds

    return () => clearInterval(interval);
  }, [loaded]);

  // Combine Bots + User to form Leaderboard
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
    
    // Sort descending
    allUsers.sort((a, b) => b.balance - a.balance);
    
    // Assign Ranks
    const ranked = allUsers.map((u, i) => ({ ...u, rank: i + 1 }));
    
    setLeaderboard(ranked);
  }, [state.balance, state.username, state.isOnboarded, bots]);

  // Save User State loop & Passive Income & Energy Regen
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
        
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('furry_combat_save', JSON.stringify(newState));
            }
        } catch(e) {
            // Ignore storage errors in loop
        }
        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loaded, state.isOnboarded]);

  const registerUser = (name: string) => {
    setState(prev => ({
      ...prev,
      username: name,
      isOnboarded: true
    }));
  };

  const handleTap = (amount: number) => {
    if (state.energy < amount) return false;
    setState(prev => {
        // Check level up logic
        let currentLevelNameIdx = 0;
        const newBalance = prev.balance + amount;
        
        for(let i=0; i<LEVEL_THRESHOLDS.length; i++) {
            if (newBalance >= LEVEL_THRESHOLDS[i].threshold) {
                currentLevelNameIdx = i;
            }
        }

        return {
            ...prev,
            balance: newBalance,
            energy: prev.energy - amount,
            level: currentLevelNameIdx + 1
        };
    });
    return true;
  };

  const calculateUpgradeCost = (basePrice: number, level: number) => {
    return Math.floor(basePrice * Math.pow(1.2, level));
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
    setState(prev => ({ ...prev, walletConnected: true }));
  };

  // RENDER LOADING SCREEN INSTEAD OF NULL
  if (!loaded) {
      return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white space-y-4">
            {/* CSS Only Spinner to avoid dependency crashes */}
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono animate-pulse text-sm text-gray-400">Загрузка данных...</p>
        </div>
      );
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
import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { Tab } from './types';
import TabNavigation from './components/TabNavigation';
import Onboarding from './screens/Onboarding';
import Exchange from './screens/Exchange';
import Mine from './screens/Mine';
import Leaderboard from './screens/Leaderboard';
import Airdrop from './screens/Airdrop';

const GameContent: React.FC = () => {
  const { state, activeTab } = useGame();

  if (!state.isOnboarded) {
    return <Onboarding />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case Tab.EXCHANGE: return <Exchange />;
      case Tab.MINE: return <Mine />;
      case Tab.TOP: return <Leaderboard />;
      case Tab.AIRDROP: return <Airdrop />;
      default: return <Exchange />;
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white relative overflow-hidden flex flex-col font-sans">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-md mx-auto relative z-10 bg-black h-full overflow-hidden">
            {/* Background noise/grain could be added here */}
            {renderScreen()}
        </main>

        {/* Navigation */}
        <div className="max-w-md mx-auto w-full relative z-20">
            <TabNavigation />
        </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default App;

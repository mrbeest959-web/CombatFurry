import React, { ErrorInfo, ReactNode } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { Tab } from './types';
import TabNavigation from './components/TabNavigation';
import Onboarding from './screens/Onboarding';
import Exchange from './screens/Exchange';
import Mine from './screens/Mine';
import Leaderboard from './screens/Leaderboard';
import Airdrop from './screens/Airdrop';

// --- Error Boundary ---
interface Props { children?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Ошибка приложения</h2>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg"
          >
            Сброс данных
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main Content ---
const GameContent: React.FC = () => {
  const { state, activeTab } = useGame();

  // If not onboarded, show Onboarding screen (no nav)
  if (!state.isOnboarded) {
    return <Onboarding />;
  }

  // Active Screen Renderer
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
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden relative font-sans">
        <main className="flex-1 w-full max-w-md mx-auto relative z-10 h-full overflow-hidden">
            {renderScreen()}
        </main>
        <div className="max-w-md mx-auto w-full relative z-20">
            <TabNavigation />
        </div>
    </div>
  );
};

// --- App Root ---
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </ErrorBoundary>
  );
};

export default App;
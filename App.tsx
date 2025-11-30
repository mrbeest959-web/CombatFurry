import React, { ErrorInfo, ReactNode } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { Tab } from './types';
import TabNavigation from './components/TabNavigation';
import Onboarding from './screens/Onboarding';
import Exchange from './screens/Exchange';
import Mine from './screens/Mine';
import Leaderboard from './screens/Leaderboard';
import Airdrop from './screens/Airdrop';

// ERROR BOUNDARY COMPONENT
interface Props {
  children?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Что-то пошло не так</h1>
          <p className="text-gray-400 mb-6 text-sm bg-gray-900 p-4 rounded-lg overflow-auto max-w-full">
            {this.state.error?.message || "Unknown Error"}
          </p>
          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-xl hover:bg-yellow-300"
          >
            Сбросить данные и перезагрузить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </ErrorBoundary>
  );
};

export default App;
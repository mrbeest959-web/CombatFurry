import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertTriangle } from 'lucide-react';

// Standard React Error Boundary to catch crashes
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'black', 
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          fontFamily: 'sans-serif' 
        }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Application Error</h2>
          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Something went wrong while loading the game interface.</p>
          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}
          >
            Reset App Data
          </button>
          <pre style={{ marginTop: '20px', fontSize: '10px', color: '#4b5563', textAlign: 'left', overflow: 'auto', maxWidth: '100%' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

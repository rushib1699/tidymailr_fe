import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { auth } from '../services/api';

export default function GoogleConnect() {
  const { state, actions } = useApp();
  const [loading, setLoading] = useState({});

  const handleConnect = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    actions.setError(null);

    try {
      await auth.connectGoogle({ type });
      actions.setConnectedAccount(type, true);
    } catch (error) {
      actions.setError(`Failed to connect ${type} account: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const ConnectionButton = ({ type, label }) => {
    const isConnected = state.connectedAccounts[type];
    const isLoading = loading[type];

    return (
      <button
        onClick={() => handleConnect(type)}
        disabled={isConnected || isLoading}
        className={`w-full flex items-center justify-center px-6 py-3 border rounded-lg font-medium transition-all ${
          isConnected
            ? 'bg-accent-50 border-accent-200 text-accent-700 cursor-not-allowed'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>
            {isLoading ? 'Connecting...' : isConnected ? `${label} Connected` : `Connect ${label}`}
          </span>
          {isConnected && (
            <svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <ConnectionButton type="workspace" label="Google Workspace" />
      <ConnectionButton type="personal" label="Google Personal" />
      
      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}
    </div>
  );
}
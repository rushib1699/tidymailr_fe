import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { auth } from '../services/api';

export default function ConnectAccountsPage() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasConnectedAccounts = state.connectedAccounts.workspace || state.connectedAccounts.personal;
  console.log("state",state)

  const handleContinue = () => {
    navigate('/onboarding');
  };

  const googleClientId = '136600463717-s9b1drgvo8nckums2kqfvqr0qd2509o6.apps.googleusercontent.com';
 const googleRedirectUri = 'http://localhost:5173/connect-accounts'
//  `${window.location.origin}/connect-accounts`;
 

  // const googleClientId = useMemo(() => (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined, []);
  // const googleRedirectUri = useMemo(() => (
  //   ((import.meta as any).env?.VITE_GOOGLE_REDIRECT_URI as string | undefined) || `${window.location.origin}/connect-accounts`
  // ), []);

  const buildGoogleAuthUrl = (stateParam: 'workspace' | 'personal') => {
    const scopes = [
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.events.readonly',
    ];

    const scopeParam = encodeURIComponent(scopes.join(' '));
    const redirectParam = encodeURIComponent(googleRedirectUri);

    const url = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}` +
      `&redirect_uri=${redirectParam}` +
      `&response_type=code` +
      `&scope=${scopeParam}` +
      `&access_type=offline&prompt=consent&state=${stateParam}`;

    return url;
  };

  const startGoogleConnect = (type: 'workspace' | 'personal') => {
    setError(null);
    if (!googleClientId) {
      setError('Google client is not configured');
      return;
    }
    const authUrl = buildGoogleAuthUrl(type);
    window.location.href = authUrl;
  };

  // On mount, if we have an auth code, exchange it with the backend via save-token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    console.log("code", code)
    const stateParam = params.get('state') as 'workspace' | 'personal' | null;

    if (!code || !stateParam) return;
    if (sessionStorage.getItem(`${stateParam}TokenProcessed`) === 'true') {
      // Clean URL if stale params remain
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const exchange = async () => {
      try {
        setIsExchanging(true);
        actions.setError(null);
        setError(null);

        const userId = Number(state.user?.id ?? 0);
        const accountType: 'personal' | 'business' = stateParam === 'personal' ? 'personal' : 'business';
        const response = await auth.saveGoogleToken({ type: accountType, code, user_id: userId });
        // Mark processed to avoid double submissions on refresh
        sessionStorage.setItem(`${stateParam}TokenProcessed`, 'true');

        // If backend returns user info, hydrate it
        const userPayload = (response && (response as any).user) ? (response as any).user : response;
        if (userPayload) {
          actions.setUser({
            id: userPayload?.id ?? state.user?.id ?? '',
            name: userPayload?.name ?? state.user?.name,
            username: userPayload?.username ?? state.user?.username,
            email: userPayload?.email ?? state.user?.email ?? '',
            google_email_personal: userPayload?.google_email_personal ?? state.user?.google_email_personal,
            google_email_business: userPayload?.google_email_business ?? state.user?.google_email_business,
          });
        }

        // Flip the connected flag per account type
        actions.setConnectedAccount(stateParam, true);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to connect Google account';
        setError(errorMessage);
        actions.setError(errorMessage);
      } finally {
        setIsExchanging(false);
        // Clean the URL to remove auth params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    exchange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ConnectionButton = ({ type, label }: { type: 'workspace' | 'personal'; label: string }) => {
    const isConnected = state.connectedAccounts[type];
    const isLoading = isExchanging; // during code exchange on return

    return (
      <button
        onClick={() => startGoogleConnect(type)}
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connect Your Accounts
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your Google accounts to start managing your emails
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <ConnectionButton type="workspace" label="Google Workspace" />
            <ConnectionButton type="personal" label="Google Personal" />
            {(state.error || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{state.error || error}</p>
              </div>
            )}
          </div>
          
          {hasConnectedAccounts && (
            <div className="mt-8">
              <button
                onClick={handleContinue}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Continue to Setup
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={handleContinue}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
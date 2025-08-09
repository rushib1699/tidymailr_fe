import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { accounts, mail } from '../services/api';

interface ConnectedAccount {
  id: string;
  email: string;
  provider: string;
  emailCount?: number;
  lastSync?: string;
  status?: string;
}

export default function ProfilePage() {
  const { state, actions } = useApp();
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Seed from login payload and then augment from API if needed
  useEffect(() => {
    const seeded: ConnectedAccount[] = [];
    if (state.user?.google_email_business) {
      seeded.push({
        id: 'google-business',
        email: state.user.google_email_business,
        provider: 'Google (Workspace)'
      });
    }
    if (state.user?.google_email_personal) {
      seeded.push({
        id: 'google-personal',
        email: state.user.google_email_personal,
        provider: 'Google (Personal)'
      });
    }
    if (seeded.length > 0) {
      setConnectedAccounts(seeded);
      setIsLoading(false);
    } else {
      loadConnectedAccounts();
    }
  }, [state.user?.google_email_business, state.user?.google_email_personal]);

  const loadConnectedAccounts = async (): Promise<void> => {
    try {
      const response = await accounts.getConnectedAccounts();
      setConnectedAccounts(response.accounts || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (accountId: string): Promise<void> => {
    if (!confirm('Disconnect this Google account? This will remove access and synced data.')) {
      return;
    }

    const target = connectedAccounts.find(a => a.id === accountId);
    if (!target) return;

    setIsDisconnecting(accountId);
    try {
      const userId = state.user?.id ?? 0;
      await accounts.removeGoogleAccount({ email: target.email, user_id: userId });

      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));

      // Reflect in global state
      if (accountId === 'google-personal') {
        actions.setConnectedAccount('personal', false);
        actions.setUser({
          ...(state.user as any),
          google_email_personal: ''
        } as any);
      }
      if (accountId === 'google-business') {
        actions.setConnectedAccount('workspace', false);
        actions.setUser({
          ...(state.user as any),
          google_email_business: ''
        } as any);
      }

      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(errorMessage);
    } finally {
      setIsDisconnecting(null);
    }
  };

  const handleSyncAccount = async (accountId: string): Promise<void> => {
    setIsSyncing(accountId);
    try {
      await mail.sync({ accountId });
      actions.setError(null);
      // Show success message or update UI
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(errorMessage);
    } finally {
      setIsSyncing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile & Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your connected accounts and sync settings</p>
        </div>

        {/* User Info */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {state.user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900">{state.user?.name || 'User'}</p>
                <p className="text-gray-600">{state.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Connected Accounts</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage your connected email accounts. Each account syncs up to 200 emails.
            </p>
          </div>

          <div className="px-6 py-4">
            {connectedAccounts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connected accounts</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by connecting an email account.</p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.href = '/connect-accounts'}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Connect Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{account.email}</p>
                          <p className="text-sm text-gray-500">
                            {account.provider}
                          </p>
                          <p className="text-xs text-gray-400">
                            Last sync: {account.lastSync ? new Date(account.lastSync).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSyncAccount(account.id)}
                          disabled={isSyncing === account.id}
                          className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSyncing === account.id ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(account.id)}
                          disabled={isDisconnecting === account.id}
                          className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDisconnecting === account.id ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-50 rounded-md p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Email Limit:</span>
                        <span className="font-medium">200 emails per sync</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${account.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                          {account.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => window.location.href = '/connect-accounts'}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Connect Another Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
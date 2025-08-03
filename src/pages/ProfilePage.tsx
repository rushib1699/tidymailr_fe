import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { accounts, mail } from '../services/api';

export default function ProfilePage() {
  const { state, actions } = useApp();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(null);
  const [isSyncing, setIsSyncing] = useState(null);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const response = await accounts.getConnectedAccounts();
      setConnectedAccounts(response.accounts || []);
    } catch (error) {
      actions.setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this account? This will remove all synced emails.')) {
      return;
    }

    setIsDisconnecting(accountId);
    try {
      await accounts.disconnectAccount(accountId);
      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      actions.setError(null);
    } catch (error) {
      actions.setError(error.message);
    } finally {
      setIsDisconnecting(null);
    }
  };

  const handleSyncAccount = async (accountId) => {
    setIsSyncing(accountId);
    try {
      const response = await mail.sync({ accountId });
      actions.setError(null);
      // Show success message or update UI
    } catch (error) {
      actions.setError(error.message);
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
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{account.email}</p>
                          <p className="text-sm text-gray-500">
                            {account.provider} • {account.emailCount || 0} emails synced
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
                        <span className={`font-medium ${
                          account.status === 'active' ? 'text-green-600' : 'text-yellow-600'
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
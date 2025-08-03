import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { mail } from '../services/api';
import MailSyncList from '../components/MailSyncList';

type SyncStatus = 'idle' | 'syncing' | 'completed' | 'error';

export default function DashboardPage() {
  const { state, actions } = useApp();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    const syncEmails = async (): Promise<void> => {
      setSyncStatus('syncing');
      actions.setLoading(true);
      actions.setError(null);

      try {
        const response = await mail.sync({ limit: 200 });
        actions.setEmails(response.emails || []);
        setSyncStatus('completed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        actions.setError(`Email sync failed: ${errorMessage}`);
        setSyncStatus('error');
      } finally {
        actions.setLoading(false);
      }
    };

    syncEmails();
  }, [actions]);

  const handleRefreshSync = async (): Promise<void> => {
    setSyncStatus('syncing');
    actions.setLoading(true);
    actions.setError(null);

    try {
      const response = await mail.sync({ limit: 200 });
      actions.setEmails(response.emails || []);
      setSyncStatus('completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(`Email sync failed: ${errorMessage}`);
      setSyncStatus('error');
    } finally {
      actions.setLoading(false);
    }
  };

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-800" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Syncing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="-ml-1 mr-2 h-4 w-4 text-green-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Completed
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <svg className="-ml-1 mr-2 h-4 w-4 text-red-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm text-gray-600">Welcome back, {state.user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {getSyncStatusBadge()}
              <button
                onClick={handleRefreshSync}
                disabled={state.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Emails</dt>
                    <dd className="text-lg font-medium text-gray-900">{state.emails.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Connected Accounts</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.values(state.connectedAccounts).filter(Boolean).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Sync</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {syncStatus === 'completed' ? 'Just now' : syncStatus === 'syncing' ? 'In progress' : 'Never'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Email List */}
        <MailSyncList emails={state.emails} />
      </div>
    </div>
  );
}
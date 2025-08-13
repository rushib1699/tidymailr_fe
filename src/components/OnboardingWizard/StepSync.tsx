import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { onboarding } from '../../services/api';
import { StepProps } from '../../pages/OnboardingPage';

interface SyncStatus {
  type: 'success' | 'error';
  message: string;
  details?: any;
}

export default function StepSync({ data, updateData, onStepComplete }: StepProps) {
  const { state, actions } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

 
   const handleSync = async (): Promise<void> => {
    setIsLoading(true);
    actions.setError(null);
    setSyncStatus(null);

    try {
      // Prepare the payload for SyncEmail
      const user_emails = [state.user?.google_email_business, state.user?.google_email_personal];
      const calendar_email = state.onboardingData?.selectedCalendar?.name;
      const user_id = state.user?.id;
      onStepComplete(true);

      const response = await onboarding.SyncEmailOnboarding({
        user_emails,
        calendar_email,
        user_id
      });

      setSyncStatus({
        type: 'success',
        message: `Successfully synced emails`,
        details: response
      });

      // Mark step as complete when sync is successful
      onStepComplete(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setSyncStatus({
        type: 'error',
        message: errorMessage
      });
      actions.setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sync Your Emails</h2>
        <p className="text-gray-600">
          Ready to sync your emails with the settings you've configured? This will sync up to 200 emails per connected account.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Sync Summary</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-blue-900">Email Filters:</span>
            <div className="mt-1 space-y-2">
              {data.email_filter_inclusion.length > 0 && (
                <div>
                  <span className="text-xs text-green-700 font-medium">Included:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.email_filter_inclusion.map((filter) => (
                      <span key={filter} className="px-2 py-1 bg-green-100 text-green-800 rounded-md capitalize text-xs">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.email_filter_exclusion.length > 0 && (
                <div>
                  <span className="text-xs text-red-700 font-medium">Excluded:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.email_filter_exclusion.map((filter) => (
                      <span key={filter} className="px-2 py-1 bg-red-100 text-red-800 rounded-md capitalize text-xs">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.email_filter_inclusion.length === 0 && data.email_filter_exclusion.length === 0 && (
                <span className="text-gray-500 text-xs">No filters configured</span>
              )}
            </div>
          </div>
          <div>
            <span className="font-medium text-blue-900">Working Hours:</span>
            <span className="ml-2 text-blue-700">
              {data.working_hours ? `${data.working_hours.slice(0, 2)}:${data.working_hours.slice(2)}` : '09:00'} - {data.working_hours_end ? `${data.working_hours_end.slice(0, 2)}:${data.working_hours_end.slice(2)}` : '17:00'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Break Hours:</span>
            <span className="ml-2 text-blue-700">
              {data.break_hours ? `${data.break_hours.slice(0, 2)}:${data.break_hours.slice(2)}` : '12:00'} - {data.break_hours_end ? `${data.break_hours_end.slice(0, 2)}:${data.break_hours_end.slice(2)}` : '13:00'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Email Limit:</span>
            <span className="ml-2 text-blue-700">200 emails per connected account</span>
          </div>
        </div>
      </div>

      {syncStatus && (
        <div className={`border rounded-lg p-4 ${syncStatus.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {syncStatus.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${syncStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                {syncStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {syncStatus?.type !== "success" &&
        <div className="flex justify-center">
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing Emails...
              </span>
            ) : (
              'Start Email Sync'
            )}
          </button>
        </div>
      }
      <div className="text-center">
        <p className="text-sm text-gray-500">
          You can always sync more emails later from your dashboard or profile settings.
        </p>
      </div>
    </div>
  );
}
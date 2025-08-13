import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { StepProps } from '../../pages/OnboardingPage';

interface Calendar {
  id: string;
  name?: string;
  summary?: string;
  description?: string;
  primary?: boolean;
}

interface ConnectedAccount {
  id: string;
  email: string;
  provider: string;
}

export default function StepCalendar({ data, updateData, onStepComplete }: StepProps) {
  const { state, actions } = useApp();
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | undefined>(
    state.onboardingData.selectedCalendar?.id
  );

  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  // Seed connected accounts from state.user only
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
    setConnectedAccounts(seeded);
  }, [state.user?.google_email_business, state.user?.google_email_personal]);

  const handleCalendarSelect = (calendar: Calendar) => {
    actions.setSelectedCalendar(calendar);
    // Save to onboarding data
    updateData({ primary_calendar: [calendar] });
    onStepComplete(true);
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedCalendar(accountId);

    const account = connectedAccounts.find(acc => acc.id === accountId);
    if (account) {
      const calendarData = { id: accountId, name: account.email };
      // Store the account selection in global state
      actions.setSelectedCalendar(calendarData);
      // Save to onboarding data
      updateData({ primary_calendar: [calendarData] });
    }

    // Immediately mark the step as complete
    onStepComplete(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-base font-medium text-gray-900 mb-2">Calendar Setup</h4>
            <p className="text-sm text-gray-600 mb-4">
              Select your primary calendar for event integration
            </p>

            {/* Connected Calendars */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connected Calendars
              </label>
              {connectedAccounts.length === 0 ? (
                <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">No connected accounts found</p>
                  <button
                    onClick={() => (window.location.href = '/connect-accounts')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Connect an account first
                  </button>
                </div>
              ) : (
                <Select value={selectedCalendar} onValueChange={handleAccountSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a calendar account" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectedAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center">
                          <span className="mr-2">
                            {account.provider.includes('Workspace') ? '💼' : '📅'}
                          </span>
                          <span>{account.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* List of calendars from the selected account */}
            {loadingCalendars ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              calendars.length > 0 && (
                <div className="space-y-3">
                  {calendars.map((cal) => (
                    <label
                      key={cal.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="calendar"
                        value={cal.id}
                        checked={state.onboardingData.selectedCalendar?.id === cal.id}
                        onChange={() => handleCalendarSelect(cal)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{cal.name || cal.summary}</h3>
                          {cal.primary && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        {cal.description && (
                          <p className="text-sm text-gray-600">{cal.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Pro tip */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="ml-3 text-sm text-gray-600">
            {connectedAccounts.length === 0
              ? "You'll need to connect a Google account first to sync your calendar."
              : "Your calendar events will sync automatically with the selected account."}
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calendar } from '../../services/api';

interface Calendar {
  id: string;
  name?: string;
  summary?: string;
  description?: string;
  primary?: boolean;
}

export default function StepCalendar() {
  const { state, actions } = useApp();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        actions.setError(null);
        const data = await calendar.listCalendars();
        setCalendars(data.calendars || []);
        
        if (!state.onboardingData.selectedCalendar && data.calendars?.length > 0) {
          const primaryCalendar = data.calendars.find((cal: Calendar) => cal.primary) || data.calendars[0];
          actions.setSelectedCalendar(primaryCalendar);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        actions.setError(`Failed to load calendars: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, [actions, state.onboardingData.selectedCalendar]);

  const handleCalendarSelect = (selectedCalendar: Calendar): void => {
    actions.setSelectedCalendar(selectedCalendar);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Calendar</h2>
          <p className="text-gray-600">Choose your primary calendar for scheduling.</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Calendar</h2>
        <p className="text-gray-600">Choose your primary calendar for scheduling email processing time.</p>
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <div className="space-y-3">
        {calendars.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No calendars found. Please connect your Google account first.</p>
          </div>
        ) : (
          calendars.map((cal) => (
            <label key={cal.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
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
          ))
        )}
      </div>
    </div>
  );
}
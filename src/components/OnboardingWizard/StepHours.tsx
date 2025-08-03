import { useApp } from '../../context/AppContext';
import TimePicker from '../TimePicker';

export default function StepHours() {
  const { state, actions } = useApp();

  const handleWorkingHoursChange = (field, value) => {
    actions.updateWorkingHours({ [field]: value });
  };

  const handleBreakHoursChange = (field, value) => {
    actions.updateBreakHours({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Working Hours</h2>
        <p className="text-gray-600">Set your working hours and break times for optimal email processing.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimePicker
              label="Start Time"
              id="work-start"
              value={state.onboardingData.workingHours.start}
              onChange={(value) => handleWorkingHoursChange('start', value)}
            />
            <TimePicker
              label="End Time"
              id="work-end"
              value={state.onboardingData.workingHours.end}
              onChange={(value) => handleWorkingHoursChange('end', value)}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimePicker
              label="Break Start"
              id="break-start"
              value={state.onboardingData.break.start}
              onChange={(value) => handleBreakHoursChange('start', value)}
            />
            <TimePicker
              label="Break End"
              id="break-end"
              value={state.onboardingData.break.end}
              onChange={(value) => handleBreakHoursChange('end', value)}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Emails will be processed during your working hours, excluding break time. 
                You can adjust these settings later in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
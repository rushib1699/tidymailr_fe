import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export default function SettingsPage() {
  const { state } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); // This would come from your app state
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Settings sections
  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      id: 'security',
      title: 'Security',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  // Onboarding form state
  const [emailFilters, setEmailFilters] = useState({
    promotions: true,
    social: true,
    updates: false,
    forums: false
  });

  const [workingHours, setWorkingHours] = useState({
    start: '09:00',
    end: '17:00',
    timezone: 'America/New_York',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  });

  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncFrequency: '15'
  });

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
    // Save onboarding data
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              defaultValue={state.user?.name?.split(' ')[0] || ''}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              defaultValue={state.user?.name?.split(' ')[1] || ''}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              defaultValue={state.user?.email || ''}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-end">
          <button className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderOnboardingStatus = () => {
    if (isOnboardingComplete) {
      return (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            🎉 Congratulations!
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
            You have successfully completed the onboarding process.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-3">Your Setup Summary:</h4>
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Email filters configured
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Calendar connected
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Working hours set
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Email sync active
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOnboardingComplete(false)}
            className="mt-6 text-sm text-blue-600 hover:text-blue-700"
          >
            Update onboarding settings
          </button>
        </div>
      );
    }

    // Onboarding form
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Setup</h3>
          <p className="text-sm text-gray-600">
            Finish setting up your account to get the most out of our platform.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {onboardingStep} of 4
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round((onboardingStep / 4) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(onboardingStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Email Filters */}
        {onboardingStep === 1 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Email Filters</h4>
              <p className="text-sm text-gray-600 mb-4">
                Choose which types of emails you want to automatically filter
              </p>
              <div className="space-y-3">
                {Object.entries(emailFilters).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setEmailFilters({ ...emailFilters, [key]: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Calendar Setup */}
        {onboardingStep === 2 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Calendar Setup</h4>
              <p className="text-sm text-gray-600 mb-4">
                Select your primary calendar for event integration
              </p>
              <select
                value={selectedCalendar}
                onChange={(e) => setSelectedCalendar(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Select a calendar</option>
                <option value="personal">Personal Calendar</option>
                <option value="work">Work Calendar</option>
                <option value="family">Family Calendar</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Working Hours */}
        {onboardingStep === 3 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Working Hours</h4>
              <p className="text-sm text-gray-600 mb-4">
                Set your typical working schedule
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={workingHours.start}
                    onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={workingHours.end}
                    onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = workingHours.workingDays.includes(day)
                          ? workingHours.workingDays.filter(d => d !== day)
                          : [...workingHours.workingDays, day];
                        setWorkingHours({ ...workingHours, workingDays: newDays });
                      }}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        workingHours.workingDays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Sync Settings */}
        {onboardingStep === 4 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Email Sync Settings</h4>
              <p className="text-sm text-gray-600 mb-4">
                Configure how often your emails should sync
              </p>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={syncSettings.autoSync}
                    onChange={(e) => setSyncSettings({ ...syncSettings, autoSync: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Enable automatic sync</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
                  <select
                    value={syncSettings.syncFrequency}
                    onChange={(e) => setSyncSettings({ ...syncSettings, syncFrequency: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    disabled={!syncSettings.autoSync}
                  >
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every hour</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between gap-3">
          <button
            onClick={() => setOnboardingStep(Math.max(1, onboardingStep - 1))}
            disabled={onboardingStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {onboardingStep < 4 ? (
            <button
              onClick={() => setOnboardingStep(onboardingStep + 1)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleOnboardingComplete}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Complete Setup
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs sm:text-sm text-gray-500">Receive email updates about your account activity</p>
            </div>
            <button 
              type="button" 
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="switch"
              aria-checked="true"
            >
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-xs sm:text-sm text-gray-500">Receive push notifications on your devices</p>
            </div>
            <button 
              type="button" 
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="switch"
              aria-checked="false"
            >
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <p className="text-xs sm:text-sm text-gray-500">Update your account password</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs sm:text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'onboarding':
        return renderOnboardingStatus();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile: Horizontal scroll */}
          <div className="sm:hidden">
            <div className="flex space-x-1 overflow-x-auto pb-2 -mx-4 px-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-2 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`}>
                    {section.icon}
                  </span>
                  {section.title}
                  {section.id === 'onboarding' && !isOnboardingComplete && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      !
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Tab layout */}
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeSection === section.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className={`mr-2 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`}>
                      {section.icon}
                    </span>
                    {section.title}
                    {section.id === 'onboarding' && !isOnboardingComplete && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Incomplete
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-6 sm:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
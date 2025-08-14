import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProfilePage from './ProfilePage';
import { accounts } from '../services/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SettingsSection {
    id: string;
    title: string;
    icon: React.ReactNode;
}

interface ConnectedAccount {
    id: string;
    email: string;
    provider: string;
    emailCount?: number;
    lastSync?: string;
    status?: string;
}

export default function SettingsPage() {
    const { state, actions } = useApp();
    const [activeSection, setActiveSection] = useState('profile');
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); // This would come from your app state
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

    // Connected accounts UI now handled by embedded ProfilePage

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
            id: 'schedule',
            title: 'Schedule Setup',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

    // Schedule setup form state
    const [workingHours, setWorkingHours] = useState({
        start: '09:00',
        end: '17:00',
        timezone: 'America/New_York',
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });

    const [breakHours, setBreakHours] = useState({
        lunchStart: '12:00',
        lunchEnd: '13:00',
        enableBreaks: true
    });

    const [selectedCalendar, setSelectedCalendar] = useState('');

    // Load connected accounts - similar to ProfilePage
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
            setIsLoadingAccounts(false);
        } 
    }, [state.user?.google_email_business, state.user?.google_email_personal]);

    const handleScheduleComplete = () => {
        setIsOnboardingComplete(true);
        // Save schedule data
    };

    const renderProfileSettings = () => (
        <div className="space-y-6">
            {/* Use ProfilePage embedded within settings */}
            <ProfilePage embedded />
        </div>
    );

    // const renderScheduleSetup = () => {
    //     if (isOnboardingComplete) {
    //         return (
    //             <div className="text-center py-8 sm:py-12">
    //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    //                     <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    //                     </svg>
    //                 </div>
    //                 <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
    //                     🎉 Schedule Setup Complete!
    //                 </h3>
    //                 <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
    //                     Your calendar and working hours have been configured successfully.
    //                 </p>
    //                 <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
    //                     <h4 className="font-medium text-gray-900 mb-3">Your Setup Summary:</h4>
    //                     <div className="space-y-2 text-sm text-left">
    //                         <div className="flex items-center">
    //                             <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    //                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    //                             </svg>
    //                             Calendar connected: {connectedAccounts.find(acc => acc.id === selectedCalendar)?.email || 'Selected'}
    //                         </div>
    //                         <div className="flex items-center">
    //                             <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    //                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    //                             </svg>
    //                             Working hours: {workingHours.start} - {workingHours.end}
    //                         </div>
    //                         <div className="flex items-center">
    //                             <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    //                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    //                             </svg>
    //                             Break hours configured
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <button
    //                     onClick={() => setIsOnboardingComplete(false)}
    //                     className="mt-6 text-sm text-blue-600 hover:text-blue-700"
    //                 >
    //                     Update schedule settings
    //                 </button>
    //             </div>
    //         );
    //     }

    //     // Schedule setup form
    //     return (
    //         <div>
    //             <div className="mb-6">
    //                 <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Schedule Setup</h3>
    //                 <p className="text-sm text-gray-600">
    //                     Configure your calendar and working hours for better productivity.
    //                 </p>
    //             </div>

    //             {/* Progress indicator */}
    //             <div className="mb-6 sm:mb-8">
    //                 <div className="flex items-center justify-between mb-2">
    //                     <span className="text-sm font-medium text-gray-700">
    //                         Step {onboardingStep} of 2
    //                     </span>
    //                     <span className="text-sm font-medium text-gray-700">
    //                         {Math.round((onboardingStep / 2) * 100)}% Complete
    //                     </span>
    //                 </div>
    //                 <div className="w-full bg-gray-200 rounded-full h-2">
    //                     <div
    //                         className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
    //                         style={{ width: `${(onboardingStep / 2) * 100}%` }}
    //                     />
    //                 </div>
    //             </div>

    //             {/* Step 1: Calendar Setup */}
    //             {onboardingStep === 1 && (
    //                 <div className="space-y-6">
    //                     <div className="bg-blue-50 rounded-xl p-6">
    //                         <div className="flex items-start space-x-3">
    //                             <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
    //                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    //                                 </svg>
    //                             </div>
    //                             <div className="flex-1">
    //                                 <h4 className="text-base font-medium text-gray-900 mb-2">Calendar Setup</h4>
    //                                 <p className="text-sm text-gray-600 mb-4">
    //                                     Select your primary calendar for event integration
    //                                 </p>

    //                                 {/* Connected Calendars */}
    //                                 <div className="mb-4">
    //                                     <label className="block text-sm font-medium text-gray-700 mb-2">
    //                                         Connected Calendars
    //                                     </label>
    //                                     {isLoadingAccounts ? (
    //                                         <div className="flex items-center justify-center py-4">
    //                                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    //                                         </div>
    //                                     ) : connectedAccounts.length === 0 ? (
    //                                         <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
    //                                             <p className="text-sm text-gray-600 mb-2">No connected accounts found</p>
    //                                             <button
    //                                                 onClick={() => window.location.href = '/connect-accounts'}
    //                                                 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
    //                                             >
    //                                                 Connect an account first
    //                                             </button>
    //                                         </div>
    //                                     ) : (
    //                                         <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
    //                                             <SelectTrigger className="w-full">
    //                                                 <SelectValue placeholder="Select a calendar" />
    //                                             </SelectTrigger>
    //                                             <SelectContent>
    //                                                 {connectedAccounts.map((account) => (
    //                                                     <SelectItem key={account.id} value={account.id}>
    //                                                         <div className="flex items-center">
    //                                                             <span className="mr-2">
    //                                                                 {account.provider.includes('Workspace') ? '💼' : '📅'}
    //                                                             </span>
    //                                                             <span>{account.email}</span>
    //                                                         </div>
    //                                                     </SelectItem>
    //                                                 ))}
    //                                             </SelectContent>
    //                                         </Select>
    //                                     )}
    //                                 </div>

    //                                 {/* Calendar preview or status */}
    //                                 {selectedCalendar && (
    //                                     <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
    //                                         <div className="flex items-center space-x-2">
    //                                             <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    //                                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    //                                             </svg>
    //                                             <div>
    //                                                 <span className="text-sm text-gray-700">Calendar connected successfully</span>
    //                                                 {(() => {
    //                                                     const selectedAccount = connectedAccounts.find(acc => acc.id === selectedCalendar);
    //                                                     return selectedAccount && (
    //                                                         <p className="text-xs text-gray-500 mt-1">
    //                                                             {selectedAccount.email} • {selectedAccount.provider}
    //                                                         </p>
    //                                                     );
    //                                                 })()}
    //                                             </div>
    //                                         </div>
    //                                     </div>
    //                                 )}
    //                             </div>
    //                         </div>
    //                     </div>

    //                     {/* Pro tip */}
    //                     <div className="bg-gray-50 rounded-lg p-4">
    //                         <div className="flex">
    //                             <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    //                             </svg>
    //                             <p className="ml-3 text-sm text-gray-600">
    //                                 {connectedAccounts.length === 0
    //                                     ? "You'll need to connect a Google account first to sync your calendar."
    //                                     : "Your calendar events will sync automatically with the selected account."}
    //                             </p>
    //                         </div>
    //                     </div>
    //                 </div>
    //             )}

    //             {/* Step 2: Working Hours & Breaks */}
    //             {onboardingStep === 2 && (
    //                 <div className="space-y-6">
    //                     <div className="bg-blue-50 rounded-xl p-6">
    //                         <div className="flex items-start space-x-3">
    //                             <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
    //                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    //                                 </svg>
    //                             </div>
    //                             <div className="flex-1">
    //                                 <h4 className="text-base font-medium text-gray-900 mb-4">Working Hours & Breaks</h4>

    //                                 {/* Working Hours */}
    //                                 <div className="space-y-4">
    //                                     <div className="grid grid-cols-2 gap-4">
    //                                         <div>
    //                                             <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
    //                                             <input
    //                                                 type="time"
    //                                                 value={workingHours.start}
    //                                                 onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
    //                                                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
    //                                             />
    //                                         </div>
    //                                         <div>
    //                                             <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
    //                                             <input
    //                                                 type="time"
    //                                                 value={workingHours.end}
    //                                                 onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
    //                                                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
    //                                             />
    //                                         </div>
    //                                     </div>

    //                                     {/* Break Hours */}
    //                                     <div className="pt-4 border-t border-gray-200">
    //                                         <div className="flex items-center justify-between mb-3">
    //                                             <label className="text-sm font-medium text-gray-700">Break Hours</label>
    //                                             <button
    //                                                 type="button"
    //                                                 onClick={() => setBreakHours({ ...breakHours, enableBreaks: !breakHours.enableBreaks })}
    //                                                 className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${breakHours.enableBreaks ? 'bg-blue-600' : 'bg-gray-200'
    //                                                     }`}
    //                                             >
    //                                                 <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${breakHours.enableBreaks ? 'translate-x-5' : 'translate-x-0'
    //                                                     }`} />
    //                                             </button>
    //                                         </div>

    //                                         {breakHours.enableBreaks && (
    //                                             <div className="grid grid-cols-2 gap-4 mt-3">
    //                                                 <div>
    //                                                     <label className="block text-sm font-medium text-gray-700 mb-1">Lunch Start</label>
    //                                                     <input
    //                                                         type="time"
    //                                                         value={breakHours.lunchStart}
    //                                                         onChange={(e) => setBreakHours({ ...breakHours, lunchStart: e.target.value })}
    //                                                         className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
    //                                                     />
    //                                                 </div>
    //                                                 <div>
    //                                                     <label className="block text-sm font-medium text-gray-700 mb-1">Lunch End</label>
    //                                                     <input
    //                                                         type="time"
    //                                                         value={breakHours.lunchEnd}
    //                                                         onChange={(e) => setBreakHours({ ...breakHours, lunchEnd: e.target.value })}
    //                                                         className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
    //                                                     />
    //                                                 </div>
    //                                             </div>
    //                                         )}
    //                                     </div>

    //                                     {/* Working Days */}
    //                                     <div>
    //                                         <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
    //                                         <div className="flex flex-wrap gap-2">
    //                                             {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
    //                                                 <button
    //                                                     key={day}
    //                                                     onClick={() => {
    //                                                         const newDays = workingHours.workingDays.includes(day)
    //                                                             ? workingHours.workingDays.filter(d => d !== day)
    //                                                             : [...workingHours.workingDays, day];
    //                                                         setWorkingHours({ ...workingHours, workingDays: newDays });
    //                                                     }}
    //                                                     className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${workingHours.workingDays.includes(day)
    //                                                             ? 'bg-blue-600 text-white'
    //                                                             : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
    //                                                         }`}
    //                                                 >
    //                                                     {day}
    //                                                 </button>
    //                                             ))}
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>

    //                     {/* Pro tip */}
    //                     <div className="bg-gray-50 rounded-lg p-4">
    //                         <div className="flex">
    //                             <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    //                             </svg>
    //                             <p className="ml-3 text-sm text-gray-600">
    //                                 Set different hours for different days to match your flexible schedule.
    //                             </p>
    //                         </div>
    //                     </div>
    //                 </div>
    //             )}

    //             {/* Navigation buttons */}
    //             <div className="mt-8 flex justify-between gap-3">
    //                 <button
    //                     onClick={() => setOnboardingStep(Math.max(1, onboardingStep - 1))}
    //                     disabled={onboardingStep === 1}
    //                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    //                 >
    //                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    //                     </svg>
    //                     Previous
    //                 </button>

    //                 {onboardingStep < 2 ? (
    //                     <button
    //                         onClick={() => {
    //                             if (onboardingStep === 1 && !selectedCalendar) {
    //                                 alert('Please select a calendar to continue');
    //                                 return;
    //                             }
    //                             setOnboardingStep(onboardingStep + 1);
    //                         }}
    //                         className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center"
    //                     >
    //                         Continue
    //                         <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    //                         </svg>
    //                     </button>
    //                 ) : (
    //                     <button
    //                         onClick={handleScheduleComplete}
    //                         className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 flex items-center"
    //                     >
    //                         Complete Setup
    //                         <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    //                         </svg>
    //                     </button>
    //                 )}
    //             </div>
    //         </div>
    //     );
    // };

const renderScheduleSetup = () => {
    return (
        <div>
            {/* Heading */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Schedule Setup</h3>
                <p className="text-sm text-gray-500">
                    Select your primary calendar and configure your working hours.
                </p>
            </div>

            {/* Calendar Selection */}
            <div className="space-y-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-base font-medium text-gray-900 mb-2">Calendar</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Select your primary calendar for event integration.
                            </p>

                            {isLoadingAccounts ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : connectedAccounts.length === 0 ? (
                                <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">No connected accounts found</p>
                                    <button
                                        onClick={() => window.location.href = '/connect-accounts'}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Connect an account first
                                    </button>
                                </div>
                            ) : (
                                <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a calendar" />
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
                    </div>
                </div>
            </div>

            {/* Working Hours & Breaks */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Working Hours & Breaks</h4>

                        {/* Working Hours */}
                        <div className="grid grid-cols-2 gap-4 border-b py-5 border-gray-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={workingHours.start}
                                    onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={workingHours.end}
                                    onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                                />
                            </div>
                        </div>

                        {/* Break Hours */}
                        <div className="py-5 border-b border-gray-300">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700">Break Hours</label>
                                <button
                                    type="button"
                                    onClick={() => setBreakHours({ ...breakHours, enableBreaks: !breakHours.enableBreaks })}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${breakHours.enableBreaks ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${breakHours.enableBreaks ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {breakHours.enableBreaks && (
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lunch Start</label>
                                        <input
                                            type="time"
                                            value={breakHours.lunchStart}
                                            onChange={(e) => setBreakHours({ ...breakHours, lunchStart: e.target.value })}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lunch End</label>
                                        <input
                                            type="time"
                                            value={breakHours.lunchEnd}
                                            onChange={(e) => setBreakHours({ ...breakHours, lunchEnd: e.target.value })}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Working Days */}
                        <div className="py-5">
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
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-150 shadow-sm ${workingHours.workingDays.includes(day)
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => {
                        console.log({
                            selectedCalendar,
                            workingHours,
                            breakHours
                        });
                        alert('Settings saved!');
                    }}
                    className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 shadow-md"
                >
                    Save Settings
                </button>
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
            case 'schedule':
                return renderScheduleSetup();
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
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeSection === section.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className={`mr-2 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {section.icon}
                                    </span>
                                    {section.title}
                                    {section.id === 'schedule' && !isOnboardingComplete && (
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
                                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeSection === section.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className={`mr-2 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {section.icon}
                                        </span>
                                        {section.title}
                                        {/* {section.id === 'schedule' && !isOnboardingComplete && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Incomplete
                                            </span>
                                        )} */}
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
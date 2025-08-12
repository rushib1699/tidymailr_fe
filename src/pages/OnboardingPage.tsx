import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepQuestionnaire from '../components/OnboardingWizard/StepQuestionnaire';
import StepFilters from '../components/OnboardingWizard/StepFilters';
import StepCalendar from '../components/OnboardingWizard/StepCalendar';
import StepHours from '../components/OnboardingWizard/StepHours';
import StepSync from '../components/OnboardingWizard/StepSync';

import { onboarding } from '../services/api';

interface Step {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType;
  icon: React.ReactNode;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Updated from 4 to 5

  const steps: Step[] = [
    { 
      id: 1, 
      title: 'Questionnaire', 
      description: 'Help us understand your work style',
      component: StepQuestionnaire,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 2, 
      title: 'Email Filters', 
      description: 'Set up smart filters to organize your inbox',
      component: StepFilters,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      )
    },
    { 
      id: 3, 
      title: 'Calendar Setup', 
      description: 'Connect and configure your calendar preferences',
      component: StepCalendar,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 4, 
      title: 'Working Hours', 
      description: 'Define your working schedule for smart notifications',
      component: StepHours,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 5, 
      title: 'Sync Emails', 
      description: 'Start syncing your emails and get organized',
      component: StepSync,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = (): void => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepId: number): void => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome! Let's get you set up
          </h1>
          <p className="text-lg text-gray-600">
            Just a few quick steps to personalize your experience
          </p>
        </div>

        {/* Progress Bar - Mobile */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                {currentStepData?.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{currentStepData?.title}</h3>
                <p className="text-sm text-gray-500">{currentStepData?.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Progress - Desktop */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Setup Progress</h3>
              
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      step.id === currentStep
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : step.id < currentStep
                        ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                        : 'bg-white cursor-not-allowed opacity-60'
                    }`}
                    disabled={step.id > currentStep}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.id < currentStep
                          ? 'bg-green-100 text-green-600'
                          : step.id === currentStep
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.id < currentStep ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className={`text-sm font-medium ${
                            step.id === currentStep ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h4>
                          {step.id < currentStep && (
                            <span className="ml-2 text-xs text-green-600 font-medium">✓ Complete</span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          step.id === currentStep ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Time estimate */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estimated time: {6 - currentStep} minutes remaining
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Step Header */}
              <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    {currentStepData?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {currentStepData?.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                      {currentStepData?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Component */}
              <div className="p-6 sm:p-8">
                {CurrentStepComponent && <CurrentStepComponent />}
              </div>

              {/* Navigation */}
              <div className="px-6 py-4 sm:px-8 sm:py-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="order-2 sm:order-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="order-1 sm:order-2 flex items-center justify-center sm:hidden">
                    <span className="text-sm text-gray-500">
                      Step {currentStep} of {totalSteps}
                    </span>
                  </div>

                  <button
                    onClick={handleNext}
                    className="order-3 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
                  >
                    {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips - Optional */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 sm:p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-900">
                    Pro tip
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    {currentStep === 1 && "Be honest with your answers - this helps us customize the perfect workflow for you."}
                    {currentStep === 2 && "You can always adjust these filters later from your settings."}
                    {currentStep === 3 && "Connect multiple calendars to see all your events in one place."}
                    {currentStep === 4 && "Set different hours for different days to match your schedule."}
                    {currentStep === 5 && "Initial sync may take a few minutes depending on your inbox size."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
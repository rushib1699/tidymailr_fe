import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepFilters from '../components/OnboardingWizard/StepFilters';
import StepCalendar from '../components/OnboardingWizard/StepCalendar';
import StepHours from '../components/OnboardingWizard/StepHours';
import StepSync from '../components/OnboardingWizard/StepSync';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Email Filters', component: StepFilters },
    { id: 2, title: 'Calendar Setup', component: StepCalendar },
    { id: 3, title: 'Working Hours', component: StepHours },
    { id: 4, title: 'Sync Emails', component: StepSync },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData.component;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleStepClick(step.id)}
                        className={`relative w-8 h-8 flex items-center justify-center rounded-full ${
                          step.id === currentStep
                            ? 'bg-primary-600 text-white'
                            : step.id < currentStep
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-500'
                        } hover:bg-primary-700 hover:text-white transition-colors`}
                      >
                        {step.id < currentStep ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </button>
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div className="absolute top-4 left-4 -ml-px w-8 sm:w-20 h-0.5 bg-gray-300" />
                    )}
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm font-medium ${
                      step.id === currentStep ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 md:px-12 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8">
                <CurrentStepComponent />
              </div>
              <div className="md:col-span-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Guide</h3>
                  <div className="space-y-4">
                    {steps.map((step) => (
                      <div key={step.id} className="flex items-start">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          step.id < currentStep
                            ? 'bg-primary-600 text-white'
                            : step.id === currentStep
                            ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.id < currentStep ? '✓' : step.id}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${
                            step.id === currentStep ? 'text-primary-600' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between rounded-b-lg md:px-12">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
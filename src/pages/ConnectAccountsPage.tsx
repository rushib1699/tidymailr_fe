import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import GoogleConnect from '../components/GoogleConnect';

export default function ConnectAccountsPage() {
  const navigate = useNavigate();
  const { state } = useApp();

  const hasConnectedAccounts = state.connectedAccounts.workspace || state.connectedAccounts.personal;

  const handleContinue = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connect Your Accounts
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your Google accounts to start managing your emails
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <GoogleConnect />
          
          {hasConnectedAccounts && (
            <div className="mt-8">
              <button
                onClick={handleContinue}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Continue to Setup
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={handleContinue}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
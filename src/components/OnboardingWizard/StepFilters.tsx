import { useApp } from '../../context/AppContext';

export default function StepFilters() {
  const { state, actions } = useApp();

  const handleToggle = (filterName) => {
    actions.updateOnboardingFilters({
      [filterName]: !state.onboardingData.filters[filterName],
    });
  };

  const filterOptions = [
    { key: 'important', label: 'Important', description: 'High priority emails' },
    { key: 'promotion', label: 'Promotion', description: 'Marketing and promotional emails' },
    { key: 'social', label: 'Social', description: 'Social media notifications' },
    { key: 'forum', label: 'Forum', description: 'Forum and discussion emails' },
    { key: 'updates', label: 'Updates', description: 'Product updates and newsletters' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Filters</h2>
        <p className="text-gray-600">Choose which types of emails you want to include in your workflow.</p>
      </div>

      <div className="space-y-4">
        {filterOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{option.label}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <button
              onClick={() => handleToggle(option.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                state.onboardingData.filters[option.key] ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.onboardingData.filters[option.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
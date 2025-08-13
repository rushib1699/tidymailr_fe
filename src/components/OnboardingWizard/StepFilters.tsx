import { useState, useEffect } from 'react';
import { StepProps } from '../../pages/OnboardingPage';

interface FilterOption {
  key: string;
  label: string;
  description: string;
}

export default function StepFilters({ data, updateData, onStepComplete }: StepProps) {
  const [includedFilters, setIncludedFilters] = useState(data.email_filter_inclusion || []);
  const [excludedFilters, setExcludedFilters] = useState(data.email_filter_exclusion || []);

  // Mark step as complete on mount and initialize exclusions
  useEffect(() => {
    // Initialize exclusions with all unchecked filters
    const allFilterKeys = filterOptions.map(option => option.key);
    const initialExclusions = allFilterKeys.filter(key => !includedFilters.includes(key));

    if (initialExclusions.length > 0 && excludedFilters.length === 0) {
      setExcludedFilters(initialExclusions);
      updateData({
        email_filter_inclusion: includedFilters,
        email_filter_exclusion: initialExclusions
      });
    }

    onStepComplete(true);
  }, []);

  const filterOptions: FilterOption[] = [
    { key: 'important', label: 'Important', description: 'High priority emails' },
    { key: 'promotion', label: 'Promotion', description: 'Marketing and promotional emails' },
    { key: 'social', label: 'Social', description: 'Social media notifications' },
    { key: 'forum', label: 'Forum', description: 'Forum and discussion emails' },
    { key: 'updates', label: 'Updates', description: 'Product updates and newsletters' },
  ];

  const handleToggle = (filterKey: string): void => {
    const isCurrentlyIncluded = includedFilters.includes(filterKey);

    let newIncluded = [...includedFilters];
    let newExcluded = [...excludedFilters];

    if (isCurrentlyIncluded) {
      // If currently included, remove from included and add to excluded
      newIncluded = newIncluded.filter(f => f !== filterKey);
      if (!newExcluded.includes(filterKey)) {
        newExcluded = [...newExcluded, filterKey];
      }
    } else {
      // If not included, add to included and remove from excluded
      newIncluded = [...newIncluded, filterKey];
      newExcluded = newExcluded.filter(f => f !== filterKey);
    }

    setIncludedFilters(newIncluded);
    setExcludedFilters(newExcluded);
    updateData({
      email_filter_inclusion: newIncluded,
      email_filter_exclusion: newExcluded
    });
  };

  const getFilterState = (filterKey: string): 'included' | 'excluded' => {
    return includedFilters.includes(filterKey) ? 'included' : 'excluded';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Filters</h2>
        <p className="text-gray-600">Choose which types of emails you want to include in your workflow.</p>
        <p className="text-sm text-gray-500 mt-2">
          Toggle to include (green) or exclude (red) each email type. Unchecked filters are automatically excluded.
        </p>
      </div>

      <div className="space-y-4">
        {filterOptions.map((option) => {
          const filterState = getFilterState(option.key);
          return (
            <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{option.label}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: {filterState === 'included' ? 'Included' : 'Excluded'}
                </p>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  filterState === 'included'
                    ? 'bg-green-600 focus:ring-green-500'
                    : 'bg-red-600 focus:ring-red-500'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    filterState === 'included' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
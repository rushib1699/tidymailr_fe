import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  connectedAccounts: {
    workspace: false,
    personal: false,
  },
  onboardingData: {
    filters: {
      important: true,
      promotion: false,
      social: false,
      forum: false,
      updates: true,
    },
    selectedCalendar: null,
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    break: {
      start: '12:00',
      end: '13:00',
    },
  },
  emails: [],
  isLoading: false,
  error: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_CONNECTED_ACCOUNT':
      return {
        ...state,
        connectedAccounts: {
          ...state.connectedAccounts,
          [action.payload.type]: action.payload.connected,
        },
      };
    case 'UPDATE_ONBOARDING_FILTERS':
      return {
        ...state,
        onboardingData: {
          ...state.onboardingData,
          filters: {
            ...state.onboardingData.filters,
            ...action.payload,
          },
        },
      };
    case 'SET_SELECTED_CALENDAR':
      return {
        ...state,
        onboardingData: {
          ...state.onboardingData,
          selectedCalendar: action.payload,
        },
      };
    case 'UPDATE_WORKING_HOURS':
      return {
        ...state,
        onboardingData: {
          ...state.onboardingData,
          workingHours: {
            ...state.onboardingData.workingHours,
            ...action.payload,
          },
        },
      };
    case 'UPDATE_BREAK_HOURS':
      return {
        ...state,
        onboardingData: {
          ...state.onboardingData,
          break: {
            ...state.onboardingData.break,
            ...action.payload,
          },
        },
      };
    case 'SET_EMAILS':
      return {
        ...state,
        emails: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'SET_USER', payload: parsedState.user });
        if (parsedState.connectedAccounts) {
          Object.entries(parsedState.connectedAccounts).forEach(([type, connected]) => {
            dispatch({ type: 'SET_CONNECTED_ACCOUNT', payload: { type, connected } });
          });
        }
        if (parsedState.onboardingData) {
          if (parsedState.onboardingData.filters) {
            dispatch({ type: 'UPDATE_ONBOARDING_FILTERS', payload: parsedState.onboardingData.filters });
          }
          if (parsedState.onboardingData.selectedCalendar) {
            dispatch({ type: 'SET_SELECTED_CALENDAR', payload: parsedState.onboardingData.selectedCalendar });
          }
          if (parsedState.onboardingData.workingHours) {
            dispatch({ type: 'UPDATE_WORKING_HOURS', payload: parsedState.onboardingData.workingHours });
          }
          if (parsedState.onboardingData.break) {
            dispatch({ type: 'UPDATE_BREAK_HOURS', payload: parsedState.onboardingData.break });
          }
        }
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      user: state.user,
      connectedAccounts: state.connectedAccounts,
      onboardingData: state.onboardingData,
    };
    localStorage.setItem('appState', JSON.stringify(stateToSave));
  }, [state.user, state.connectedAccounts, state.onboardingData]);

  const actions = {
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    setConnectedAccount: (type, connected) => dispatch({ type: 'SET_CONNECTED_ACCOUNT', payload: { type, connected } }),
    updateOnboardingFilters: (filters) => dispatch({ type: 'UPDATE_ONBOARDING_FILTERS', payload: filters }),
    setSelectedCalendar: (calendar) => dispatch({ type: 'SET_SELECTED_CALENDAR', payload: calendar }),
    updateWorkingHours: (hours) => dispatch({ type: 'UPDATE_WORKING_HOURS', payload: hours }),
    updateBreakHours: (hours) => dispatch({ type: 'UPDATE_BREAK_HOURS', payload: hours }),
    setEmails: (emails) => dispatch({ type: 'SET_EMAILS', payload: emails }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
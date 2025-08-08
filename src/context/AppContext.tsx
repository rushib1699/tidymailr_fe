import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface User {
  id: number | string;
  email: string;
  name?: string;
  username?: string;
  token?: string;
  google_email_personal?: string;
  google_email_business?: string;
  isLoggedIn?: boolean;
}

interface ConnectedAccounts {
  workspace: boolean;
  personal: boolean;
}

export interface OnboardingFilters {
  important: boolean;
  promotion: boolean;
  social: boolean;
  forum: boolean;
  updates: boolean;
}

interface WorkingHours {
  start: string;
  end: string;
}

interface Calendar {
  id: string;
  name?: string;
  summary?: string;
  description?: string;
  primary?: boolean;
}

interface OnboardingData {
  filters: OnboardingFilters;
  selectedCalendar: Calendar | null;
  workingHours: WorkingHours;
  break: WorkingHours;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  connectedAccounts: ConnectedAccounts;
  onboardingData: OnboardingData;
  emails: any[];
  isLoading: boolean;
  error: string | null;
}

interface AppActions {
  setUser: (user: User | null) => void;
  setConnectedAccount: (type: 'workspace' | 'personal', connected: boolean) => void;
  updateOnboardingFilters: (filters: Partial<OnboardingFilters>) => void;
  setSelectedCalendar: (calendar: Calendar | null) => void;
  updateWorkingHours: (hours: Partial<WorkingHours>) => void;
  updateBreakHours: (hours: Partial<WorkingHours>) => void;
  setEmails: (emails: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

interface AppContextType {
  state: AppState;
  actions: AppActions;
}

const AppContext = createContext<AppContextType | null>(null);

const initialState: AppState = {
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

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CONNECTED_ACCOUNT'; payload: { type: 'workspace' | 'personal'; connected: boolean } }
  | { type: 'UPDATE_ONBOARDING_FILTERS'; payload: Partial<OnboardingFilters> }
  | { type: 'SET_SELECTED_CALENDAR'; payload: Calendar | null }
  | { type: 'UPDATE_WORKING_HOURS'; payload: Partial<WorkingHours> }
  | { type: 'UPDATE_BREAK_HOURS'; payload: Partial<WorkingHours> }
  | { type: 'SET_EMAILS'; payload: any[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

function appReducer(state: AppState, action: AppAction): AppState {
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

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Lazy initializer to hydrate synchronously from localStorage
  const [state, dispatch] = useReducer(appReducer, undefined as unknown as AppState, () => {
    try {
      const savedStateRaw = localStorage.getItem('appState');
      if (!savedStateRaw) {
        return initialState;
      }
      const saved = JSON.parse(savedStateRaw) as Partial<Pick<AppState, 'user' | 'connectedAccounts' | 'onboardingData'>>;
      const hydrated: AppState = {
        ...initialState,
        user: saved.user ?? null,
        isAuthenticated: !!saved.user,
        connectedAccounts: {
          workspace: saved.connectedAccounts?.workspace ?? initialState.connectedAccounts.workspace,
          personal: saved.connectedAccounts?.personal ?? initialState.connectedAccounts.personal,
        },
        onboardingData: {
          filters: {
            ...initialState.onboardingData.filters,
            ...(saved.onboardingData?.filters ?? {}),
          },
          selectedCalendar: saved.onboardingData?.selectedCalendar ?? initialState.onboardingData.selectedCalendar,
          workingHours: {
            ...initialState.onboardingData.workingHours,
            ...(saved.onboardingData?.workingHours ?? {}),
          },
          break: {
            ...initialState.onboardingData.break,
            ...(saved.onboardingData?.break ?? {}),
          },
        },
      };
      return hydrated;
    } catch (error) {
      console.error('Failed to hydrate state from localStorage:', error);
      return initialState;
    }
  });

  useEffect(() => {
    const stateToSave = {
      user: state.user,
      connectedAccounts: state.connectedAccounts,
      onboardingData: state.onboardingData,
    };
    localStorage.setItem('appState', JSON.stringify(stateToSave));
  }, [state.user, state.connectedAccounts, state.onboardingData]);

  const actions: AppActions = {
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', payload: user }),
    setConnectedAccount: (type: 'workspace' | 'personal', connected: boolean) => dispatch({ type: 'SET_CONNECTED_ACCOUNT', payload: { type, connected } }),
    updateOnboardingFilters: (filters: Partial<OnboardingFilters>) => dispatch({ type: 'UPDATE_ONBOARDING_FILTERS', payload: filters }),
    setSelectedCalendar: (calendar: Calendar | null) => dispatch({ type: 'SET_SELECTED_CALENDAR', payload: calendar }),
    updateWorkingHours: (hours: Partial<WorkingHours>) => dispatch({ type: 'UPDATE_WORKING_HOURS', payload: hours }),
    updateBreakHours: (hours: Partial<WorkingHours>) => dispatch({ type: 'UPDATE_BREAK_HOURS', payload: hours }),
    setEmails: (emails: any[]) => dispatch({ type: 'SET_EMAILS', payload: emails }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined || context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
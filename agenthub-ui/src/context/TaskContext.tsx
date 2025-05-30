import { createContext, useContext, type ReactNode, useState } from 'react';
import { ApiService } from '../services/api';

/** Valid mode slugs for the application */
export type ModeSlug = 'ask' | 'code' | 'architect' | 'debug';

/** Mode configuration interface */
export interface Mode {
  name: string;
  slug: ModeSlug;
}

/** Available modes with their configurations */
export const defaultModes: Mode[] = [
  { name: '🧠 Auto-Coder', slug: 'code' },
  { name: '🏗️ Architect', slug: 'architect' },
  { name: '❓ Ask', slug: 'ask' },
  { name: '🪲 Debugger', slug: 'debug' }
];

/** API response type for task submission */
interface TaskResponse {
  message: string;
  success: boolean;
}

/** API response type for mode switching */
interface ModeSwitchResponse {
  success: boolean;
  error?: string;
}

/** Loading states for different operations */
interface LoadingState {
  task: boolean;
  modeSwitch: boolean;
}

/** Error state with type information */
interface ErrorState {
  /** Error message if any */
  message: string | null;
  /** Type of operation that caused the error */
  type?: 'task' | 'modeSwitch';
}

/** Task context interface defining available operations and state */
interface TaskContextType {
  /** Current active mode */
  currentMode: ModeSlug;
  /** Loading states for different operations */
  isLoading: LoadingState;
  /** Error information if any operation fails */
  error: ErrorState;
  /** Response from the last successful task */
  response: string;
  /** Submit a new task to the current mode */
  submitTask: (task: string, mode: ModeSlug) => Promise<void>;
  /** Switch to a different mode */
  switchMode: (mode: ModeSlug) => Promise<void>;
}

/** Default loading state */
const defaultLoadingState: LoadingState = {
  task: false,
  modeSwitch: false
};

/** Default error state */
const defaultErrorState: ErrorState = {
  message: null,
  type: undefined
};

/** Default context values */
const defaultContext: TaskContextType = {
  currentMode: 'ask',
  isLoading: defaultLoadingState,
  error: defaultErrorState,
  response: '',
  submitTask: async (_task: string, _mode: ModeSlug) => {},
  switchMode: async () => {},
};

export const TaskContext = createContext<TaskContextType>(defaultContext);

/**
 * Custom hook to access the TaskContext
 * @throws {Error} If used outside of a TaskProvider
 */
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
  apiService?: ApiService;
}

/**
 * Provider component for task management context
 */
export const TaskProvider = ({ children, apiService = new ApiService() }: TaskProviderProps) => {
  const [currentMode, setCurrentMode] = useState<ModeSlug>('ask');
  const [isLoading, setIsLoading] = useState<LoadingState>(defaultLoadingState);
  const [error, setError] = useState<ErrorState>(defaultErrorState);
  const [response, setResponse] = useState('');

  /**
   * Submit a task to the current mode
   * @param task The task to submit
   */
  const submitTask = async (task: string, mode: ModeSlug) => {
    try {
      setIsLoading(prev => ({ ...prev, task: true }));
      setError({ message: null, type: undefined });
      setResponse('');
      
      const result = await apiService.submitTask(task, mode);
      setResponse(result.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError({ message: errorMessage, type: 'task' });
      setResponse('');
    } finally {
      setIsLoading(prev => ({ ...prev, task: false }));
    }
  };

  /**
   * Switch to a different mode
   * @param mode The mode to switch to
   */
  const switchMode = async (mode: ModeSlug) => {
    try {
      setIsLoading(prev => ({ ...prev, modeSwitch: true }));
      setError({ message: null, type: undefined });
      
      const result = await apiService.switchMode(mode);
      if (result.success) {
        setCurrentMode(mode);
      } else {
        throw new Error('Failed to switch mode');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch mode';
      setError({ message: errorMessage, type: 'modeSwitch' });
    } finally {
      setIsLoading(prev => ({ ...prev, modeSwitch: false }));
    }
  };

  return (
    <TaskContext.Provider
      value={{
        currentMode,
        isLoading,
        error,
        response,
        submitTask,
        switchMode,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
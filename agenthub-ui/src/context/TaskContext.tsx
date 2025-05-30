import { createContext, useContext, type ReactNode, useState } from 'react';

type Mode = 'ask' | 'code' | 'architect' | 'debug';

interface TaskContextType {
  currentMode: Mode;
  isLoading: boolean;
  error: string;
  response: string;
  submitTask: (task: string) => Promise<void>;
  switchMode: (mode: Mode) => void;
}

const defaultContext: TaskContextType = {
  currentMode: 'ask',
  isLoading: false,
  error: '',
  response: '',
  submitTask: async () => {},
  switchMode: () => {},
};

export const TaskContext = createContext<TaskContextType>(defaultContext);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [currentMode, setCurrentMode] = useState<Mode>('ask');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');

  const submitTask = async (task: string) => {
    try {
      setIsLoading(true);
      setError('');
      setResponse('');
      
      // Simulate API call
      const mockFetch = global.fetch || (() => Promise.reject(new Error('API Error')));
      await mockFetch('/api/task', {
        method: 'POST',
        body: JSON.stringify({ task }),
      });
      
      setResponse('Response received');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode: Mode) => {
    setCurrentMode(mode);
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
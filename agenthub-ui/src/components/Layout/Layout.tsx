import React from 'react';
import type { ModeSlug } from '../../context/TaskContext';
import Navigation from '../Navigation/Navigation';
import TaskInput from '../TaskInput/TaskInput';
import ResponseDisplay from '../ResponseDisplay/ResponseDisplay';

/** Represents a mode in the application */
interface Mode {
  name: string;
  slug: ModeSlug;
}

/** Props for the Layout component */
interface LayoutProps {
  /** List of available modes */
  modes: Mode[];
  /** Currently active mode */
  activeMode: ModeSlug;
  /** Callback when a mode is selected */
  onModeSelect: (mode: ModeSlug) => void;
  /** Callback when a task is submitted */
  onTaskSubmit: (data: { task: string; mode: ModeSlug }) => void;
  /** Loading states */
  isLoading: {
    /** Loading state for task submission */
    task?: boolean;
    /** Loading state for mode switching */
    modeSwitch?: boolean;
  };
  /** Response content to display */
  response: string;
  /** Error information */
  error?: {
    /** Error message if any */
    message: string | null;
    /** Type of error */
    type?: 'task' | 'modeSwitch';
  };
}

const Layout: React.FC<LayoutProps> = ({
  modes,
  activeMode,
  onModeSelect,
  onTaskSubmit,
  isLoading,
  response,
  error
}) => {
  // Convert loading states for child components
  const taskInputLoading = Boolean(isLoading.task || isLoading.modeSwitch);
  const responseLoading = Boolean(isLoading.task || isLoading.modeSwitch);
  
  // Convert error state for ResponseDisplay
  const responseError = error ? {
    message: typeof error === 'string' ? error : error.message,
    type: error.type === 'modeSwitch' ? 'modeSwitch' : 'task'
  } : undefined;
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <header role="banner" aria-label="Header" className="fixed top-0 left-0 right-0 h-16 bg-gray-800 flex items-center justify-between px-4 md:px-6 shadow-lg z-20">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 mr-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="sidebar"
            aria-expanded={isSidebarOpen}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">AgentHub UI</h1>
        </div>
        {(isLoading.task || isLoading.modeSwitch) && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            <span className="hidden sm:inline text-white text-sm">Processing...</span>
          </div>
        )}
      </header>
      
      <aside
        role="complementary"
        aria-label="Sidebar Navigation"
        className={`fixed top-16 bottom-0 w-64 bg-gray-900 border-r border-gray-700 shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out z-10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Navigation
          modes={modes}
          activeMode={activeMode}
          onModeSelect={(mode: ModeSlug) => {
            onModeSelect(mode);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
        />
      </aside>
      
      <main role="main" aria-label="Main Content" className="flex-1 mt-16 p-4 md:p-8 bg-gray-100 min-h-screen transition-all duration-300 ease-in-out md:ml-64">
        <div className="max-w-4xl mx-auto">
          <TaskInput
            onSubmit={onTaskSubmit}
            activeMode={activeMode}
            isLoading={taskInputLoading}
            maxLength={2000}
          />
          <div className="mt-8">
            <ResponseDisplay
              content={response}
              isLoading={responseLoading}
              error={error ? {
                message: typeof error === 'string' ? error : error.message,
                type: typeof error === 'string' ? 'task' : (error.type === 'modeSwitch' ? 'modeSwitch' : 'task')
              } : undefined}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const MemoizedLayout = React.memo(Layout);
MemoizedLayout.displayName = 'Layout';

export default MemoizedLayout;
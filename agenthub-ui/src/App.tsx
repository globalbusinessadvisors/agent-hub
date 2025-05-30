import React from 'react';
import Layout from './components/Layout/Layout';
import { TaskProvider, useTaskContext, type ModeSlug } from './context/TaskContext';

interface Mode {
  name: string;
  slug: ModeSlug;
}

const defaultModes: Mode[] = [
  { name: '🧠 Auto-Coder', slug: 'code' },
  { name: '🏗️ Architect', slug: 'architect' },
  { name: '❓ Ask', slug: 'ask' },
  { name: '🪲 Debugger', slug: 'debug' }
];

/** Main application content component that uses TaskContext */
const AppContent = () => {
  const { currentMode, isLoading, error, response, submitTask, switchMode } = useTaskContext();

  return (
    <Layout
      modes={defaultModes}
      activeMode={currentMode}
      onModeSelect={(mode) => switchMode(mode)}
      onTaskSubmit={({ task, mode }) => submitTask(task, mode)}
      isLoading={isLoading.task || isLoading.modeSwitch}
      response={response}
      error={error.message}
    />
  );
};

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;

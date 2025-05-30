import React from 'react';
import Navigation from '../Navigation/Navigation';

interface Mode {
  name: string;
  slug: string;
}

interface LayoutProps {
  modes: Mode[];
  activeMode: string;
  onModeSelect: (mode: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ modes, activeMode, onModeSelect }) => {
  return (
    <div className="flex h-screen">
      <header role="banner" aria-label="Header" className="fixed top-0 left-0 right-0 h-16 bg-gray-800">
      </header>
      
      <aside role="complementary" aria-label="Sidebar Navigation" className="fixed top-16 bottom-0 w-64 bg-gray-900 md:block">
        <Navigation
          modes={modes}
          activeMode={activeMode}
          onModeSelect={onModeSelect}
        />
      </aside>
      
      <main role="main" aria-label="Main Content" className="flex-1 ml-64 mt-16 p-6">
      </main>
    </div>
  );
};

export default Layout;
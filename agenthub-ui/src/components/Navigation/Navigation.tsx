import React from 'react';

interface Mode {
  name: string;
  slug: string;
}

interface NavigationProps {
  modes: Mode[];
  activeMode: string;
  onModeSelect: (mode: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ modes, activeMode, onModeSelect }) => {
  return (
    <nav className="flex flex-col space-y-2 p-4">
      {modes.map((mode) => (
        <button
          key={mode.slug}
          className={`text-left p-2 rounded hover:bg-blue-700 ${mode.slug === activeMode ? 'bg-blue-600' : ''}`}
          onClick={() => onModeSelect(mode.slug)}
        >
          <span>{mode.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
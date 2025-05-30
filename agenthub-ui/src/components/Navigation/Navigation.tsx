import React, { useCallback, useEffect, useRef } from 'react';
import type { ModeSlug } from '../../context/TaskContext';

interface Mode {
  name: string;
  slug: ModeSlug;
}

interface NavigationProps {
  modes: Mode[];
  activeMode: ModeSlug;
  onModeSelect: (mode: ModeSlug) => void;
}

const Navigation: React.FC<NavigationProps> = ({ modes, activeMode, onModeSelect }) => {
  const navRef = useRef<HTMLElement>(null);

  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (!navRef.current || !document.activeElement) return;

    const buttons = Array.from(navRef.current.querySelectorAll('button'));
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const button = buttons[currentIndex] as HTMLButtonElement;
        button.click();
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      buttons[nextIndex].focus();
    }
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    nav.addEventListener('keydown', handleKeyNavigation);
    return () => nav.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  return (
    <nav
      ref={navRef}
      aria-label="Mode selection"
      className="flex flex-col space-y-2 p-4"
    >
      <ul role="menubar" className="flex flex-col space-y-2">
        {modes.map((mode, index) => (
          <li key={mode.slug} role="none">
            <button
              className={`w-full text-left p-2 rounded text-gray-300 hover:bg-blue-700 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                mode.slug === activeMode ? 'bg-blue-600 text-white font-medium' : ''
              }`}
              onClick={() => onModeSelect(mode.slug)}
              aria-current={mode.slug === activeMode ? 'true' : undefined}
              role="menuitem"
              tabIndex={mode.slug === activeMode ? 0 : -1}
              aria-label={`Switch to ${mode.name} mode`}
            >
              <span>{mode.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
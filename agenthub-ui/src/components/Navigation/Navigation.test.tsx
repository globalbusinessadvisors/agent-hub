import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';
import Navigation from './Navigation';

describe('Navigation Component', () => {
  const mockModes = [
    { slug: 'code', name: '🧠 Auto-Coder' },
    { slug: 'architect', name: '🏗️ Architect' }
  ];

  const mockOnModeSelect = vi.fn();

  beforeEach(() => {
    mockOnModeSelect.mockClear();
  });

  it('should render all available modes', () => {
    render(<Navigation modes={mockModes} activeMode="code" onModeSelect={mockOnModeSelect} />);
    
    mockModes.forEach(mode => {
      expect(screen.getByText(mode.name)).toBeInTheDocument();
    });
  });

  it('should highlight the active mode', () => {
    render(<Navigation modes={mockModes} activeMode="code" onModeSelect={mockOnModeSelect} />);
    
    const activeMode = screen.getByText('🧠 Auto-Coder');
    expect(activeMode.parentElement).toHaveClass('bg-blue-600');
  });

  it('should call onModeSelect when a mode is clicked', () => {
    render(<Navigation modes={mockModes} activeMode="code" onModeSelect={mockOnModeSelect} />);
    
    fireEvent.click(screen.getByText('🏗️ Architect'));
    expect(mockOnModeSelect).toHaveBeenCalledWith('architect');
  });
});
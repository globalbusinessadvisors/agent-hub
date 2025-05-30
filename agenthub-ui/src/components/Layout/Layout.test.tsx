import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Layout from './Layout';
import Navigation from '../Navigation/Navigation';

// Mock the Navigation component
vi.mock('../Navigation/Navigation', () => ({
  default: vi.fn(() => <div data-testid="mock-navigation">Navigation Mock</div>)
}));

describe('Layout', () => {
  const defaultProps = {
    modes: [
      { name: 'Mode 1', slug: 'mode1' },
      { name: 'Mode 2', slug: 'mode2' }
    ],
    activeMode: 'mode1',
    onModeSelect: vi.fn()
  };

  it('renders layout structure with proper landmarks', () => {
    render(<Layout {...defaultProps} />);
    
    expect(screen.getByRole('banner')).toBeDefined(); // header
    expect(screen.getByRole('complementary')).toBeDefined(); // sidebar
    expect(screen.getByRole('main')).toBeDefined(); // main content
  });

  it('integrates Navigation component with correct props', () => {
    render(<Layout {...defaultProps} />);
    
    expect(Navigation).toHaveBeenCalledWith({
      modes: defaultProps.modes,
      activeMode: defaultProps.activeMode,
      onModeSelect: defaultProps.onModeSelect
    }, undefined);
  });

  it('applies responsive classes to layout sections', () => {
    render(<Layout {...defaultProps} />);
    
    const sidebar = screen.getByRole('complementary');
    const main = screen.getByRole('main');
    
    expect(sidebar.className).toContain('w-64');
    expect(sidebar.className).toContain('md:block');
    expect(main.className).toContain('flex-1');
  });

  it('renders with proper accessibility attributes', () => {
    render(<Layout {...defaultProps} />);
    
    expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Header');
    expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Sidebar Navigation');
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Main Content');
  });
});
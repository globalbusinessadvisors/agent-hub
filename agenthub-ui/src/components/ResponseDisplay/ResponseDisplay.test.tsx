import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponseDisplay from './ResponseDisplay';

describe('ResponseDisplay', () => {
  describe('Content Rendering', () => {
    it('should render response content', () => {
      render(<ResponseDisplay content="Test response" />);
      expect(screen.getByText('Test response')).toBeInTheDocument();
    });

    it('should render markdown formatted content', () => {
      const markdownContent = '**Bold text**';
      render(<ResponseDisplay content={markdownContent} />);
      expect(screen.getByText('Bold text')).toHaveStyle('font-weight: bold');
    });

    it('should render code blocks with syntax highlighting', () => {
      const codeContent = '```typescript\nconst test: string = "hello";\n```';
      render(<ResponseDisplay content={codeContent} />);
      const codeElement = screen.getByRole('code');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveClass('language-typescript');
    });
  });

  describe('Loading State', () => {
    it('should display loading indicator when isLoading is true', () => {
      render(<ResponseDisplay content="" isLoading={true} />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading response');
    });

    it('should not display loading indicator when isLoading is false', () => {
      render(<ResponseDisplay content="Content" isLoading={false} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'Failed to load response';
      render(<ResponseDisplay content="" error={errorMessage} />);
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      render(<ResponseDisplay content="Test content" />);
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Agent response');
    });

    it('should maintain proper heading hierarchy', () => {
      const contentWithHeadings = '# Heading 1\n## Heading 2';
      render(<ResponseDisplay content={contentWithHeadings} />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});
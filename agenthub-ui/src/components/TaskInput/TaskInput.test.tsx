import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskInput from './TaskInput';

describe('TaskInput', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    activeMode: 'code',
    isLoading: false,
    maxLength: 2000,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders with proper accessibility attributes', () => {
    render(<TaskInput {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox', { name: /task description/i });
    const submitButton = screen.getByRole('button', { name: /submit task/i });

    expect(textarea).toHaveAttribute('aria-label', 'Task description');
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });

  it('shows character count and updates it on input', async () => {
    render(<TaskInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox', { name: /task description/i });
    const testInput = 'Test task';
    
    await userEvent.type(textarea, testInput);
    
    expect(screen.getByText(`${testInput.length}/2000`)).toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    render(<TaskInput {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: /submit task/i });
    
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<TaskInput {...defaultProps} isLoading={true} />);
    const submitButton = screen.getByRole('button', { name: /submitting/i });
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Submitting...');
  });

  it('calls onSubmit with input value and activeMode when form is submitted', async () => {
    render(<TaskInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox', { name: /task description/i });
    const submitButton = screen.getByRole('button', { name: /submit task/i });
    const testInput = 'Test task';

    await userEvent.type(textarea, testInput);
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      task: testInput,
      mode: 'code'
    });
  });

  it('prevents submission when input exceeds maxLength', async () => {
    render(<TaskInput {...defaultProps} maxLength={5} />);
    const textarea = screen.getByRole('textbox', { name: /task description/i });
    const submitButton = screen.getByRole('button', { name: /submit task/i });
    
    await userEvent.type(textarea, '123456789');
    
    // Verify the input value is actually longer than maxLength
    expect(textarea).toHaveValue('123456789');
    await userEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/maximum length exceeded/i)).toBeInTheDocument();
  });
});
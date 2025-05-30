import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { TaskContext, TaskProvider, useTaskContext } from './TaskContext';

// Test component that consumes context
const TestConsumer = () => {
  const { 
    currentMode,
    isLoading,
    error,
    response,
    submitTask,
    switchMode 
  } = useTaskContext();

  return (
    <div>
      <div data-testid="mode">{currentMode}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{error?.toString() || ''}</div>
      <div data-testid="response">{response}</div>
      <button onClick={() => submitTask('test task', currentMode)}>Submit</button>
      <button onClick={() => switchMode('code')}>Switch Mode</button>
    </div>
  );
};

describe('TaskContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TaskProvider>{children}</TaskProvider>
  );

  it('provides default context values', () => {
    render(<TestConsumer />, { wrapper });

    expect(screen.getByTestId('mode')).toHaveTextContent('ask');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('');
    expect(screen.getByTestId('response')).toHaveTextContent('');
  });

  it('handles task submission with current mode', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    } as Response);

    render(<TestConsumer />, { wrapper });

    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ task: 'test task', mode: 'ask' })
        })
      );
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('response')).toHaveTextContent('Response received');
    });
  });

  it('handles mode switching', () => {
    render(<TestConsumer />, { wrapper });

    fireEvent.click(screen.getByText('Switch Mode'));
    expect(screen.getByTestId('mode')).toHaveTextContent('code');
  });

  it('handles errors during task submission', async () => {
    render(<TestConsumer />, { wrapper });
    
    // Mock API error
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('API Error');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('passes current mode to API when submitting task', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    } as Response);

    render(<TestConsumer />, { wrapper });

    // Switch mode first
    fireEvent.click(screen.getByText('Switch Mode'));
    expect(screen.getByTestId('mode')).toHaveTextContent('code');

    // Submit task
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ task: 'test task', mode: 'code' })
        })
      );
    });
  });
});
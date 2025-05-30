import React, { useState } from 'react';

interface TaskInputProps {
  onSubmit: (data: { task: string; mode: string }) => void;
  activeMode: string;
  isLoading: boolean;
  maxLength: number;
}

const TaskInput: React.FC<TaskInputProps> = ({ onSubmit, activeMode, isLoading, maxLength }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return;
    }

    if (trimmedInput.length > maxLength) {
      setError('Maximum length exceeded');
      return;
    }

    onSubmit({ task: trimmedInput, mode: activeMode });
  };

  React.useEffect(() => {
    if (input.trim().length > maxLength) {
      setError('Maximum length exceeded');
    } else {
      setError(null);
    }
  }, [input, maxLength]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Task description"
          aria-required="true"
        />
        <div className="text-sm text-gray-500" data-testid="char-count">
          {input.length}/{maxLength}
        </div>
        {error && (
          <div className="text-red-500">{error}</div>
        )}
        <button
          type="submit"
          disabled={isLoading || input.trim().length === 0 || input.trim().length > maxLength}
        >
          {isLoading ? 'Submitting...' : 'Submit Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskInput;
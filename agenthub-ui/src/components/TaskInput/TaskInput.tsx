import React, { useState, useEffect } from 'react';
import type { ModeSlug } from '../../context/TaskContext';

/**
 * TaskInput component allows users to input and submit task descriptions.
 * It provides real-time character count feedback and handles loading states.
 */
/**
 * Props for the TaskInput component
 * @interface TaskInputProps
 */
interface TaskInputProps {
  /** Callback function called when the form is submitted */
  onSubmit: (data: { task: string; mode: ModeSlug }) => void;
  /** Currently active mode for task processing */
  activeMode: ModeSlug;
  /** Whether the form is currently submitting */
  isLoading: boolean;
  /** Maximum allowed length for the task description */
  maxLength: number;
}

/**
 * TaskInput component provides a form for users to input task descriptions.
 * Features include:
 * - Real-time character count with visual feedback
 * - Input validation and sanitization
 * - Loading state handling
 * - Accessibility support
 */
const TaskInput: React.FC<TaskInputProps> = ({ onSubmit, activeMode, isLoading, maxLength }) => {
  /** Current task input value, sanitized to prevent XSS */
  const [input, setInput] = useState('');
  
  /** Local error state for input validation */
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Handles form submission
   * - Prevents default form submission
   * - Validates input length and content
   * - Sanitizes input before submission
   * - Calls onSubmit with validated data
   * @param e Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return;
    }

    if (trimmedInput.length > maxLength) {
      setValidationError('Maximum length exceeded');
      return;
    }

    onSubmit({ task: trimmedInput, mode: activeMode });
  };

  /**
   * Effect hook to validate input length in real-time
   * - Monitors input length against maximum allowed length
   * - Updates error state when input exceeds maximum length
   * - Clears error state when input becomes valid
   */
  React.useEffect(() => {
    if (input.trim().length > maxLength) {
      setValidationError('Maximum length exceeded');
    } else {
      setValidationError(null);
    }
  }, [input, maxLength]);

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6" role="region" aria-label="Task Input Section">
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Task submission form">
        <label htmlFor="task-input" className="sr-only">Enter your task description</label>
        <div className="relative">
          <textarea
            id="task-input"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              /**
               * Sanitizes and validates textarea input in real-time
               * Security measures implemented:
               * - Removes HTML/XML tags and special characters to prevent XSS
               * - Strips javascript: protocol to prevent script injection
               * - Removes event handlers (onclick, onload, etc.) for security
               * - Removes data: URIs to prevent potential exploits
               * - Trims whitespace for consistent validation
               * @param {string} value - Raw input value from textarea
               * @returns {string} Sanitized input safe for processing
               */
              const sanitized = e.target.value
                .replace(/[<>{}[\]\\]/g, '') // Remove potentially dangerous characters
                .replace(/javascript:/gi, '') // Remove javascript: protocol
                .replace(/on\w+=/g, '') // Remove event handlers
                .replace(/data:/gi, '') // Remove data: URIs
                .trim(); // Remove leading/trailing whitespace
              setInput(sanitized);
            }}
            aria-label="Task description"
            aria-required="true"
            aria-invalid={input.length > maxLength}
            aria-describedby="char-count error-message"
            placeholder="Enter your task description here..."
            className={`w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none resize-none transition-colors duration-200 ${
              input.length > maxLength ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {/* Character count display with enhanced accessibility support
           * - Uses role="status" to announce changes to screen readers
           * - aria-live="polite" ensures updates don't interrupt other announcements
           * - Dynamic aria-label provides context about character limit status
           * - Visual feedback through color changes for different states
           */}
          <div
            id="char-count"
            className={`absolute bottom-3 right-3 text-sm font-medium transition-colors duration-200 ${
              input.length > maxLength
                ? 'text-red-500 font-bold'
                : input.length > maxLength * 0.8
                  ? 'text-yellow-600'
                  : 'text-gray-500'
            }`}
            data-testid="char-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Character count: ${input.length} out of ${maxLength} ${
              input.length > maxLength ? '- Maximum length exceeded' :
              input.length > maxLength * 0.8 ? '- Approaching limit' : ''
            }`}
          >
            <span>{input.length}</span>
            <span className="mx-1">/</span>
            <span>{maxLength}</span>
          </div>
        </div>
        {/* Error message display with accessibility support */}
        {validationError && (
          <div
            id="error-message"
            className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 shadow-sm"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {validationError}
          </div>
        )}
        {/* Submit button with accessibility support
         * - Dynamic aria-label provides context about button state
         * - Disabled state handling with appropriate visual and semantic feedback
         * - Focus ring for keyboard navigation
         * - Loading state indicator with aria-busy
         */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || input.trim().length === 0 || input.trim().length > maxLength}
            aria-label={
              isLoading ? 'Submitting task...' :
              input.trim().length === 0 ? 'Submit task - disabled: no input provided' :
              input.trim().length > maxLength ? `Submit task - disabled: exceeds maximum length of ${maxLength} characters` :
              'Submit task'
            }
            aria-busy={isLoading}
            className={`px-6 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
              isLoading || input.trim().length === 0 || input.trim().length > maxLength
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center" aria-busy="true">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  role="progressbar"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting...</span>
              </span>
            ) : (
              <span>Submit Task</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;
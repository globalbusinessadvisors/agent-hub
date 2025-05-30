import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import DOMPurify from 'dompurify';
import remarkGfm from 'remark-gfm';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';

/** Props for code block rendering from ReactMarkdown */
interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

/** DOMPurify configuration type */
interface SanitizeConfig extends DOMPurify.Config {
  USE_PROFILES: { html: boolean };
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: string[];
}

/**
 * Props for the ResponseDisplay component
 * @interface ResponseDisplayProps
 */
interface ResponseDisplayProps {
  /** Content to display */
  content: string;
  /** Whether the content is loading */
  isLoading?: {
    /** Loading state for task submission */
    task?: boolean;
    /** Loading state for mode switching */
    modeSwitch?: boolean;
  };
  /** Error information */
  error?: {
    /** Error message if any */
    message: string | null;
    /** Type of error */
    type?: 'task' | 'modeSwitch';
  };
  /** Optional CSS class name */
  className?: string;
  /** Optional aria-label override */
  ariaLabel?: string;
}

/**
 * Displays agent responses with support for markdown, code highlighting, and loading states
 * @param props Component props
 * @returns Rendered component
 */
const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  content,
  isLoading = false,
  error = null,
  className = '',
  ariaLabel = 'Agent response'
}) => {
  // Convert simple loading boolean to object for internal use
  const loadingState = typeof isLoading === 'boolean'
    ? { task: isLoading, modeSwitch: false }
    : isLoading;

  // Convert error to consistent object format
  const errorState = (() => {
    if (!error) return { message: null, type: undefined };
    if (typeof error === 'string') return { message: error, type: 'task' };
    return {
      message: typeof error.message === 'string' ? error.message : String(error.message),
      type: error.type || 'task'
    };
  })();
  React.useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  if (loadingState.task || loadingState.modeSwitch) {
    return (
      <div
        role="status"
        aria-label="Loading response"
        aria-live="polite"
        className="space-y-3 animate-pulse p-4 transition-all duration-300 ease-in-out"
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
      </div>
    );
  }

  if (errorState.message) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{String(errorState.message)}</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div
        role="status"
        aria-label="No content"
        className="text-center p-8 text-gray-500 dark:text-gray-400"
      >
        <p>No response to display yet. Start a conversation to see the response here.</p>
      </div>
    );
  }

  // Sanitize content with proper typing
  // Sanitize content with DOMPurify
  const sanitizedContent = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'code', 'pre', 'strong', 'em', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['class', 'id']
  } as DOMPurify.Config);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="prose prose-sm max-w-none dark:prose-invert overflow-y-auto p-4 space-y-4 prose-headings:mt-0 prose-p:mt-3 prose-p:mb-3 prose-pre:mt-0 prose-pre:mb-0 h-[calc(100vh-12rem)] min-h-[300px]"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="!mt-0 !mb-0 rounded-lg bg-gray-50 dark:bg-gray-900/90 p-4 overflow-x-auto hover:bg-gray-100 dark:hover:bg-gray-800/90 transition-colors duration-200 shadow-sm">
                <code
                  role="code"
                  aria-label={`Code block in ${match[1]}`}
                  className={`${className} text-sm block`}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </code>
              </pre>
            ) : (
              <code className={`${className} bg-gray-100 dark:bg-gray-800/90 px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>
                {children}
              </code>
            );
          },
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                {children}
              </table>
            </div>
          )
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default ResponseDisplay;
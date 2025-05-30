import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript';

interface ResponseDisplayProps {
  content: string;
  isLoading?: boolean;
  error?: string;
}

type CodeBlockProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
};

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  content,
  isLoading = false,
  error
}) => {
  React.useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading response" className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="text-red-500 p-4 border border-red-300 rounded">
        {error}
      </div>
    );
  }

  return (
    <div 
      role="region" 
      aria-label="Agent response"
      className="prose prose-sm max-w-none dark:prose-invert overflow-y-auto"
    >
      <ReactMarkdown
        components={{
          code: ({ inline, className, children, ...props }: CodeBlockProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre>
                <code
                  role="code"
                  className={className}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </code>
              </pre>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ResponseDisplay;
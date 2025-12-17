import React, { useState, KeyboardEvent, forwardRef, InputHTMLAttributes } from 'react';
import styles from './styles.module.css';

interface QueryInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  onQuerySubmit: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

const QueryInputComponent = forwardRef<HTMLInputElement, QueryInputProps>(({ onQuerySubmit, disabled = false, placeholder = "Ask a question about the textbook content...", ariaLabel = "Enter your question", ...props }, ref) => {
  const [query, setQuery] = useState<string>('');

  const handleSubmit = () => {
    if (query.trim() && !disabled) {
      onQuerySubmit(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.queryInputContainer}>
      <div className={styles.queryInputWrapper}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.queryInput}
          aria-label={ariaLabel}
          aria-describedby={disabled ? undefined : "query-hint"}
          ref={ref}
          {...props}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !query.trim()}
          className={`${styles.querySubmitButton} ${disabled ? styles.disabled : ''}`}
          aria-label="Submit question"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.submitIcon}
            aria-hidden="true"
          >
            <path
              d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className={styles.queryHint} id="query-hint">
        Press Enter to submit your question
      </div>
    </div>
  );
});

const QueryInputWithRef = React.forwardRef<HTMLInputElement, QueryInputProps>((props, ref) => (
  <QueryInputComponent {...props} ref={ref} />
));

const QueryInput = React.memo(QueryInputWithRef);
export default QueryInput;
import React, { useState, useEffect, useRef } from 'react';
import QueryInput from './QueryInput';
import AnswerDisplay from './AnswerDisplay';
import HistoryPanel from './HistoryPanel';
import { queryAgent, QueryRequest } from '../../services/api';
import { AgentResponse } from '../../services/api';
import { saveToHistory } from '../../services/historyStorage';
import { getErrorMessage } from '../../services/errorMessages';
import styles from './styles.module.css';

interface RAGQueryWidgetProps {
  onClose?: () => void;
}

const RAGQueryWidgetComponent: React.FC<RAGQueryWidgetProps> = ({ onClose }) => {
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [queryStartTime, setQueryStartTime] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showSelectedTextQuery, setShowSelectedTextQuery] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequests = useRef<Set<string>>(new Set());
  const queryInputRef = useRef<HTMLInputElement>(null);

  // Add event listeners for text selection with defensive programming
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const handleSelection = () => {
      try {
        // Defensive check for window and document availability
        if (typeof window === 'undefined' || typeof document === 'undefined') {
          return;
        }

        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== '') {
          const selectedTextContent = selection.toString().trim();
          // Only set selected text if it's between 20 and 2000 characters
          if (selectedTextContent.length >= 20 && selectedTextContent.length <= 2000) {
            if (isMounted) {
              setSelectedText(selectedTextContent);
              setShowSelectedTextQuery(true);
            }
          } else {
            if (isMounted) {
              setSelectedText('');
              setShowSelectedTextQuery(false);
            }
          }
        } else {
          if (isMounted) {
            setSelectedText('');
            setShowSelectedTextQuery(false);
          }
        }
      } catch (err) {
        console.error('Error in text selection handler:', err);
        // Silently fail to avoid breaking the entire widget
      }
    };

    // Defensive check before adding event listeners
    if (typeof document !== 'undefined') {
      document.addEventListener('mouseup', handleSelection);
      document.addEventListener('keyup', handleSelection);
    }

    // Clean up event listeners
    return () => {
      isMounted = false;
      if (typeof document !== 'undefined') {
        document.removeEventListener('mouseup', handleSelection);
        document.removeEventListener('keyup', handleSelection);
      }
    };
  }, []);

  // Add keyboard shortcut handling with defensive programming
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      try {
        // Ctrl+K or Cmd+K to focus the query input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          if (isMounted && queryInputRef.current) {
            queryInputRef.current.focus();
          }
        }

        // Escape key to clear error
        if (e.key === 'Escape' && error) {
          if (isMounted) {
            setError(null);
          }
        }
      } catch (err) {
        console.error('Error in keyboard shortcut handler:', err);
        // Silently fail to avoid breaking the entire widget
      }
    };

    // Defensive check before adding event listener
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    return () => {
      isMounted = false;
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeyboardShortcuts);
      }
    };
  }, [error]);

  const handleQuerySubmit = async (query: string, mode: 'full_book' | 'selected_text' = 'full_book') => {
    // Check for concurrent requests
    if (loading) {
      setError('Please wait for the current query to complete before submitting another.');
      return;
    }

    const queryId = `query_${Date.now()}`;
    activeRequests.current.add(queryId);

    const startTime = Date.now();
    setQueryStartTime(startTime);
    setLoading(true);
    setResponse(null);
    setError(null); // Clear any previous errors

    try {
      const request: QueryRequest = {
        text: query,
        mode: mode,
        selected_text: mode === 'selected_text' ? selectedText : undefined
      };

      const result = await queryAgent(request);

      // Calculate response time if available in metadata
      if (result.metadata && queryStartTime) {
        const actualTime = Date.now() - startTime;
        result.metadata.total_time_ms = actualTime;
      }

      if (activeRequests.current.has(queryId)) {
        setResponse(result);

        // Save to history if the query was successful
        if (result.status === 'success' || result.status === 'insufficient_context') {
          saveToHistory(query, result, mode, mode === 'selected_text' ? selectedText : undefined);
        }
      }
    } catch (error) {
      console.error('Error querying agent:', error);

      // Use the error message service to get a user-friendly message
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);

      // Set an error response to display in the UI
      setResponse({
        query_id: '',
        status: 'error',
        error_message: errorMessage
      });
    } finally {
      activeRequests.current.delete(queryId);
      setLoading(false);
    }
  };

  const handleRestoreFromHistory = (restoredResponse: AgentResponse, query: string, mode: 'full_book' | 'selected_text', selectedText?: string) => {
    setResponse(restoredResponse);
    // Optionally set the selected text if it was a selected text query
    if (mode === 'selected_text' && selectedText) {
      setSelectedText(selectedText);
      setShowSelectedTextQuery(true);
    }
  };

  return (
    <div className={styles.ragQueryWidget} role="region" aria-label="AI Question Answering Widget">
      <div className={styles.widgetHeader} role="banner">
        {onClose && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close AI Assistant"
            title="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <h3 className={styles.widgetTitle} id="rag-widget-title">Ask Questions About This Book</h3>
        <p className={styles.widgetDescription} id="rag-widget-description">
          Get answers grounded in the textbook content with source citations
        </p>
      </div>

      {/* Error message display */}
      {error && (
        <div
          className={styles.errorMessage}
          role="alert"
          aria-live="polite"
        >
          <div className={styles.errorContent}>
            <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
            <span>{error}</span>
            <button
              className={styles.errorCloseButton}
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              title="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Show a special input when text is selected */}
      {showSelectedTextQuery && selectedText && (
        <div
          className={styles.selectedTextSection}
          role="region"
          aria-label="Selected text question interface"
        >
          <div
            className={styles.selectedTextPreview}
            aria-label="Selected text preview"
          >
            <strong>Selected text:</strong> "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
          </div>
          <div className={styles.selectedTextQueryInput}>
            <QueryInput
              onQuerySubmit={(query) => handleQuerySubmit(query, 'selected_text')}
              disabled={loading}
              placeholder="Ask a question about the selected text..."
              ariaLabel="Ask a question about the selected text"
              ref={queryInputRef}
            />
          </div>
        </div>
      )}

      <div className={styles.querySection} role="form">
        <QueryInput
          onQuerySubmit={(query) => handleQuerySubmit(query, 'full_book')}
          disabled={loading}
          placeholder={showSelectedTextQuery ? "Or ask a general question about the book..." : "Ask a question about the textbook content..."}
          ariaLabel={showSelectedTextQuery ? "Ask a general question about the book" : "Ask a question about the textbook content"}
          ref={queryInputRef}
        />
      </div>

      <div
        className={styles.answerSection}
        role="region"
        aria-label="Answer display"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnswerDisplay response={response} loading={loading} />
      </div>

      <div className={styles.historySection} role="complementary">
        <HistoryPanel
          onRestore={handleRestoreFromHistory}
          onClose={() => {}} // We don't need to close the panel from this context
          ariaLabel="Query history panel"
        />
      </div>
    </div>
  );
};

const RAGQueryWidget = React.memo(RAGQueryWidgetComponent);
export default RAGQueryWidget;
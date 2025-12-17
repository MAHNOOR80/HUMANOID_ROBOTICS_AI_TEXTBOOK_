import React, { useState, useEffect } from 'react';
import { QueryHistoryItem } from '../../services/historyStorage';
import { AgentResponse } from '../../services/api';
import AnswerDisplay from './AnswerDisplay';
import styles from './styles.module.css';

interface HistoryPanelProps {
  onRestore: (response: AgentResponse, query: string, mode: 'full_book' | 'selected_text', selectedText?: string) => void;
  onClose: () => void;
  ariaLabel?: string;
}

const HistoryPanelComponent: React.FC<HistoryPanelProps> = ({ onRestore, onClose, ariaLabel = "Query history panel" }) => {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    // Load history from storage when component mounts
    const storedHistory = JSON.parse(localStorage.getItem('rag_query_history') || '[]');
    setHistory(storedHistory);
  }, []);

  const handleRestore = (item: QueryHistoryItem) => {
    onRestore(item.response, item.query, item.mode, item.selectedText);
    onClose(); // Close the history panel after restoring
  };

  const handleClearHistory = () => {
    localStorage.removeItem('rag_query_history');
    setHistory([]);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the restore when clicking delete
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem('rag_query_history', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const toggleHistoryPanel = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className={styles.historyPanelContainer}>
      <button
        className={styles.historyToggleButton}
        onClick={toggleHistoryPanel}
        aria-label={showHistory ? "Close history panel" : "Open history panel"}
        aria-expanded={showHistory}
        aria-controls="history-panel-content"
      >
        {showHistory ? 'Hide History' : 'Show History'} ({history.length})
      </button>

      {showHistory && (
        <div
          className={styles.historyPanel}
          id="history-panel-content"
          role="region"
          aria-label={ariaLabel}
        >
          <div className={styles.historyHeader}>
            <h3 className={styles.historyTitle} id="history-panel-title">Query History</h3>
            {history.length > 0 && (
              <button
                className={styles.clearHistoryButton}
                onClick={handleClearHistory}
                title="Clear all history"
                aria-label="Clear all query history"
              >
                Clear All
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div
              className={styles.noHistoryMessage}
              role="status"
              aria-live="polite"
            >
              No query history yet. Your questions and answers will appear here.
            </div>
          ) : (
            <div
              className={styles.historyList}
              role="list"
              aria-labelledby="history-panel-title"
            >
              {history.map((item) => (
                <div
                  key={item.id}
                  className={styles.historyItem}
                  onClick={() => handleRestore(item)}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleRestore(item);
                    }
                  }}
                  aria-label={`Question: ${item.query}. Answered on ${new Date(item.timestamp).toLocaleString()}`}
                >
                  <div className={styles.historyItemHeader}>
                    <div className={styles.historyQuery}>
                      <strong>Q:</strong> {item.query.length > 80 ? item.query.substring(0, 80) + '...' : item.query}
                    </div>
                    <button
                      className={styles.deleteHistoryButton}
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Delete this item"
                      aria-label={`Delete history item: ${item.query.substring(0, 50)}...`}
                      tabIndex={0}
                    >
                      ×
                    </button>
                  </div>
                  <div className={styles.historyTimestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                    <span className={styles.queryMode}>
                      {item.mode === 'selected_text' ? ' (Selected Text)' : ' (Full Book)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HistoryPanel = React.memo(HistoryPanelComponent);
export default HistoryPanel;
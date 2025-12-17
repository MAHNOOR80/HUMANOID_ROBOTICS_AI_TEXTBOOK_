import { AgentResponse } from './api';

export interface QueryHistoryItem {
  id: string;
  query: string;
  response: AgentResponse;
  timestamp: string; // ISO 8601 format
  mode: 'full_book' | 'selected_text';
  selectedText?: string;
}

const HISTORY_KEY = 'rag_query_history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Save a query-response pair to history storage
 * @param query - The user's question
 * @param response - The agent's response
 * @param mode - The query mode ('full_book' or 'selected_text')
 * @param selectedText - The selected text (if in selected_text mode)
 */
export const saveToHistory = (query: string, response: AgentResponse, mode: 'full_book' | 'selected_text', selectedText?: string): void => {
  try {
    // Get existing history
    const existingHistory = getHistory();

    // Create new history item
    const newItem: QueryHistoryItem = {
      id: response.query_id || Date.now().toString(),
      query,
      response,
      timestamp: new Date().toISOString(),
      mode,
      selectedText
    };

    // Add new item to the beginning of the array
    const updatedHistory = [newItem, ...existingHistory];

    // Limit to max items (FIFO - remove oldest items if exceeding limit)
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
      updatedHistory.splice(MAX_HISTORY_ITEMS);
    }

    // Save to localStorage
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

/**
 * Get query history from storage
 * @returns Array of QueryHistoryItem objects, sorted by timestamp (newest first)
 */
export const getHistory = (): QueryHistoryItem[] => {
  try {
    const historyString = localStorage.getItem(HISTORY_KEY);
    if (!historyString) {
      return [];
    }

    const history = JSON.parse(historyString);
    // Ensure we return an array and handle any parsing issues
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

/**
 * Clear all query history from storage
 */
export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};

/**
 * Remove a specific item from history
 * @param id - The ID of the history item to remove
 */
export const removeFromHistory = (id: string): void => {
  try {
    const existingHistory = getHistory();
    const updatedHistory = existingHistory.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error removing from history:', error);
  }
};
/**
 * Error message mapping constants for user-friendly error display
 */

export const ERROR_MESSAGES = {
  // Network-related errors
  NETWORK_ERROR: "Network error: Unable to connect to the server. Please check your internet connection and try again.",
  TIMEOUT_ERROR: "Request timeout: The server took too long to respond. Please try again.",
  SERVER_ERROR: "Server error: The service is temporarily unavailable. Please try again later.",
  CONNECTION_ERROR: "Connection error: Unable to reach the server. Please check your network connection.",

  // Query validation errors
  QUERY_TOO_SHORT: "Query too short: Please enter a question with at least 1 character.",
  QUERY_TOO_LONG: "Query too long: Please keep your question under 500 characters.",
  EMPTY_QUERY: "Empty query: Please enter a question before submitting.",
  INVALID_QUERY: "Invalid query: Please enter a valid question.",

  // Selected text validation errors
  SELECTED_TEXT_TOO_SHORT: "Selected text too short: Please select at least 20 characters of text to ask about.",
  SELECTED_TEXT_TOO_LONG: "Selected text too long: Please select no more than 2000 characters of text.",
  EMPTY_SELECTED_TEXT: "No text selected: Please select some text on the page before asking a question about it.",

  // Content-related errors
  INSUFFICIENT_CONTEXT: "Insufficient information: The system cannot find enough information in the provided content to answer this question.",
  INSUFFICIENT_CONTEXT_SELECTED: "Insufficient information: The selected text does not contain enough information to answer this question.",

  // API and service errors
  API_ERROR: "API error: An error occurred while processing your request. Please try again.",
  BACKEND_ERROR: "Backend error: The server encountered an error while processing your request.",
  INVALID_RESPONSE: "Invalid response: The server returned an unexpected response format.",

  // General errors
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
  UNEXPECTED_ERROR: "Unexpected error: Something went wrong while processing your request.",

  // Rate limiting or concurrent request errors
  TOO_MANY_REQUESTS: "Too many requests: Please wait before submitting another query.",
  CONCURRENT_QUERY_ERROR: "Multiple queries detected: Please wait for the current query to complete before submitting another."
} as const;

export type ErrorType = keyof typeof ERROR_MESSAGES;

/**
 * Get a user-friendly error message based on error type or message
 * @param error - The error object or message string
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Handle specific error types
  if (typeof error === 'string') {
    // Check for common error patterns
    if (error.toLowerCase().includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.toLowerCase().includes('timeout') || error.toLowerCase().includes('time')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    if (error.toLowerCase().includes('server')) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }
    if (error.toLowerCase().includes('connection')) {
      return ERROR_MESSAGES.CONNECTION_ERROR;
    }
    if (error.toLowerCase().includes('insufficient')) {
      return ERROR_MESSAGES.INSUFFICIENT_CONTEXT;
    }
    if (error.toLowerCase().includes('too many requests')) {
      return ERROR_MESSAGES.TOO_MANY_REQUESTS;
    }

    return ERROR_MESSAGES.API_ERROR;
  }

  // Handle error objects
  if (error.message) {
    if (error.message.toLowerCase().includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.toLowerCase().includes('timeout') || error.message.toLowerCase().includes('time')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    if (error.message.toLowerCase().includes('server')) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }
    if (error.message.toLowerCase().includes('connection')) {
      return ERROR_MESSAGES.CONNECTION_ERROR;
    }
    if (error.message.toLowerCase().includes('insufficient')) {
      return ERROR_MESSAGES.INSUFFICIENT_CONTEXT;
    }
    if (error.message.toLowerCase().includes('too many requests')) {
      return ERROR_MESSAGES.TOO_MANY_REQUESTS;
    }

    return ERROR_MESSAGES.API_ERROR;
  }

  // Handle HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return ERROR_MESSAGES.INVALID_QUERY;
      case 408:
        return ERROR_MESSAGES.TIMEOUT_ERROR;
      case 429:
        return ERROR_MESSAGES.TOO_MANY_REQUESTS;
      case 500:
        return ERROR_MESSAGES.BACKEND_ERROR;
      case 502:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 504:
        return ERROR_MESSAGES.TIMEOUT_ERROR;
      default:
        return ERROR_MESSAGES.API_ERROR;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};
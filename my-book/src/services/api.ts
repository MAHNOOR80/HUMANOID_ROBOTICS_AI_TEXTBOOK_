/**
 * API service for RAG agent integration
 */

import { getApiBaseUrl } from './config';

export interface QueryRequest {
  text: string;
  selected_text?: string;
  mode: 'full_book' | 'selected_text';
}

export interface ChunkMetadata {
  page_number?: number;
  section_title?: string;
  chapter?: string;
  url?: string;
  chunk_index?: number;
}

export interface SourceReference {
  chunk_id: string | number;
  citation_index: number;
  relevance_score: number;
  excerpt: string;
  metadata: ChunkMetadata;
}

export interface ConfidenceScore {
  retrieval_quality: number;
  coverage_score: number;
  entailment_score: number;
  lexical_overlap: number;
  overall: number;
  level: 'high' | 'medium' | 'low';
}

export interface ResponseMetadata {
  model: string;
  temperature: number;
  total_time_ms: number;
  retrieval_time_ms: number;
  generation_time_ms: number;
  tokens_used?: number;
  timestamp: string;
}

export interface AgentResponse {
  query_id: string;
  status: 'success' | 'conversational' | 'insufficient_context' | 'error';
  answer?: string;
  confidence?: ConfidenceScore;
  sources?: SourceReference[];
  metadata?: ResponseMetadata;
  error_message?: string;
}

export const queryAgent = async (
  request: QueryRequest,
  timeout = 30000
): Promise<AgentResponse> => {
  const API_BASE_URL = getApiBaseUrl();

  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error('timeout')), timeout);
  });

  try {
    const fetchPromise = fetch(`${API_BASE_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const response = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]) as Response;

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Invalid request.');
        case 408:
        case 504:
          throw new Error('Request timeout.');
        case 429:
          throw new Error('Too many requests.');
        default:
          throw new Error('Server error.');
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message === 'timeout') {
      throw new Error('Server took too long to respond.');
    }
    throw new Error('Unable to connect to server.');
  }
};

export const checkHealth = async (): Promise<{
  status: string;
  services: { qdrant: string; llm: string };
}> => {
  const API_BASE_URL = getApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};

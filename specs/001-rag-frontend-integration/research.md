# Research: RAG Agent Frontend Integration

**Date**: 2025-12-13
**Feature**: 001-rag-frontend-integration
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Areas

### 1. FastAPI Integration with Existing Python Code

**Question**: How to wrap the existing RetrievalAgent in a FastAPI service with minimal code changes?

**Decision**: Create a standalone `api_server.py` file that imports and instantiates RetrievalAgent

**Rationale**:
- Zero changes to existing agent.py (preserves CLI functionality)
- FastAPI server can be run independently: `uvicorn api_server:app --reload`
- Separation of concerns: agent.py = business logic, api_server.py = HTTP interface
- Easy to test: can test agent.py and API separately

**Implementation Pattern**:
```python
# api_server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import RetrievalAgent
import os

app = FastAPI(title="RAG Agent API")

# CORS configuration for Docusaurus
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent once at startup
agent = RetrievalAgent()

class QueryRequest(BaseModel):
    text: str
    selected_text: str | None = None
    mode: str = "full_book"

@app.post("/api/query")
async def query_endpoint(request: QueryRequest):
    # Validation and delegation to agent.query()
    ...
```

**Alternatives Considered**:
- Modifying agent.py directly: Rejected because it couples HTTP concerns with business logic
- Using Flask: Rejected because FastAPI has better async support, automatic OpenAPI docs, and Pydantic validation
- Creating a separate microservice: Rejected as over-engineering for this use case

---

### 2. Docusaurus React Component Integration

**Question**: What's the best way to add a global React component (RAG widget) to all Docusaurus pages?

**Decision**: Use Docusaurus theme swizzling with Root.tsx wrapper

**Rationale**:
- Root.tsx wraps the entire Docusaurus app, allowing global components
- Swizzling is the official Docusaurus method for customization
- Component renders on every page without modifying individual MD files
- Preserves Docusaurus upgrade path (swizzled files are tracked separately)

**Implementation Pattern**:
```bash
# Create Root.tsx wrapper
npm run swizzle @docusaurus/theme-classic Root -- --wrap

# Or manually create: my-book/src/theme/Root.tsx
```

```tsx
// my-book/src/theme/Root.tsx
import React from 'react';
import RAGQueryWidget from '@site/src/components/RAGQueryWidget';

export default function Root({children}) {
  return (
    <>
      {children}
      <RAGQueryWidget />
    </>
  );
}
```

**Alternatives Considered**:
- Docusaurus plugin: Rejected as more complex than needed (plugins are for extending build process)
- Modifying docusaurus.config.ts scripts: Rejected because Root.tsx is cleaner
- Adding to every MD file: Rejected as unmaintainable

---

### 3. Selected Text Query Implementation

**Question**: How to capture selected text from the page and send it with the query?

**Decision**: Use browser `window.getSelection()` API with custom context menu

**Rationale**:
- `window.getSelection()` is standard across all modern browsers
- Non-intrusive: users can still use normal text selection
- Can be triggered via floating button that appears on selection
- Works with all Docusaurus content (MD, MDX, React components)

**Implementation Pattern**:
```tsx
// In RAGQueryWidget component
const [selectedText, setSelectedText] = useState('');

useEffect(() => {
  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || '';
    if (text.length >= 20 && text.length <= 2000) {
      setSelectedText(text);
      // Show "Ask about this" button near selection
    }
  };

  document.addEventListener('mouseup', handleSelection);
  return () => document.removeEventListener('mouseup', handleSelection);
}, []);
```

**Alternatives Considered**:
- Browser extension: Rejected as requires separate installation
- Custom selection library (Tippy.js): Rejected as unnecessary dependency
- Right-click context menu: Rejected because harder to discover for users

---

### 4. Query History Persistence

**Question**: Should query history use localStorage, sessionStorage, or backend storage?

**Decision**: Use localStorage with session-based expiration

**Rationale**:
- localStorage persists across browser sessions (meets SC-006 requirement)
- No backend storage needed (simpler, privacy-friendly)
- Can implement size limits (e.g., last 50 queries) to prevent growth
- Users can clear history via browser settings

**Implementation Pattern**:
```typescript
// my-book/src/services/historyStorage.ts
interface HistoryItem {
  query: string;
  response: AgentResponse;
  timestamp: string;
  sessionId: string;
}

export const saveToHistory = (item: HistoryItem) => {
  const history = getHistory();
  history.unshift(item); // Add to beginning
  if (history.length > 50) history.pop(); // Limit to 50 items
  localStorage.setItem('rag-query-history', JSON.stringify(history));
};

export const getHistory = (): HistoryItem[] => {
  const stored = localStorage.getItem('rag-query-history');
  return stored ? JSON.parse(stored) : [];
};
```

**Alternatives Considered**:
- sessionStorage: Rejected because doesn't persist across browser sessions (violates SC-006)
- Backend database: Rejected as over-engineering and privacy concern
- IndexedDB: Rejected as unnecessary complexity for simple history

---

### 5. Error Handling Strategy

**Question**: How to provide user-friendly error messages for different failure modes?

**Decision**: Map backend error codes to user-friendly messages on frontend

**Rationale**:
- Backend returns structured errors with codes (e.g., INSUFFICIENT_CONTEXT, NETWORK_ERROR)
- Frontend maps codes to readable messages (per edge cases in spec)
- Centralizes error messaging logic in one place
- Easy to internationalize later if needed

**Implementation Pattern**:
```typescript
// my-book/src/services/errorMessages.ts
export const ERROR_MESSAGES = {
  INSUFFICIENT_CONTEXT: "I cannot find sufficient information in the textbook to answer this question.",
  BACKEND_UNREACHABLE: "Unable to reach the question-answering service. Please try again later.",
  TIMEOUT: "Query is taking longer than expected. Please try again.",
  QUERY_TOO_LONG: "Question is too long. Please limit to 500 characters.",
  SELECTED_TEXT_INVALID: "Selected text is too short/long for meaningful analysis. Please select 20-2000 characters.",
  UNKNOWN: "An unexpected error occurred. Please try again."
};

export const getErrorMessage = (status: string, error?: string): string => {
  return ERROR_MESSAGES[status] || ERROR_MESSAGES.UNKNOWN;
};
```

**Alternatives Considered**:
- Displaying raw backend errors: Rejected because technical details confuse users
- Generic "Error occurred" message: Rejected because doesn't help users understand what happened
- Modal alerts: Rejected in favor of inline error messages (less intrusive)

---

### 6. API Request/Response Contracts

**Question**: What should the exact JSON structure be for requests and responses?

**Decision**: Use Pydantic models on backend, TypeScript interfaces on frontend

**Rationale**:
- Pydantic provides automatic validation and OpenAPI schema generation
- TypeScript interfaces ensure type safety on frontend
- Both can be auto-generated from OpenAPI spec if needed
- Clear contract prevents frontend/backend mismatches

**Request Contract**:
```typescript
// Frontend
interface QueryRequest {
  text: string;          // 1-500 characters
  selected_text?: string; // 0-2000 characters, optional
  mode: 'full_book' | 'selected_text';
}
```

```python
# Backend (Pydantic)
class QueryRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    selected_text: str | None = Field(None, max_length=2000)
    mode: Literal["full_book", "selected_text"] = "full_book"
```

**Response Contract**:
```typescript
// Frontend
interface AgentResponse {
  query_id: string;
  status: 'success' | 'insufficient_context' | 'error';
  answer?: string;
  confidence?: {
    overall: number;
    level: 'high' | 'medium' | 'low';
  };
  sources?: SourceReference[];
  metadata?: {
    total_time_ms: number;
    retrieval_time_ms: number;
    generation_time_ms: number;
  };
  error_message?: string;
}
```

**Alternatives Considered**:
- Unstructured JSON: Rejected because no validation or type safety
- GraphQL: Rejected as over-engineering for simple CRUD operations
- Protobuf: Rejected because JSON is simpler and human-readable

---

## Best Practices

### Backend (FastAPI)

1. **Dependency Injection**: Reuse single RetrievalAgent instance (expensive to initialize)
2. **Async Endpoints**: Use `async def` for I/O-bound operations (Qdrant, LLM calls)
3. **Request Validation**: Pydantic models with Field constraints (min/max length)
4. **Error Handling**: Try/except with HTTPException for all endpoints
5. **CORS Configuration**: Whitelist specific origins (localhost:3000, production domain)
6. **Logging**: Use Python logging module for debugging (already configured in agent.py)
7. **Health Check**: Add GET /health endpoint for monitoring

### Frontend (React/Docusaurus)

1. **Component Composition**: Break down into QueryInput, AnswerDisplay, HistoryPanel sub-components
2. **State Management**: Use React hooks (useState, useEffect) - no need for Redux
3. **API Calls**: Use `fetch` API with timeout (30 seconds), or axios if preferred
4. **Loading States**: Show spinner during query processing (improves perceived performance)
5. **Error Boundaries**: Wrap RAGQueryWidget in React ErrorBoundary
6. **Accessibility**: Add ARIA labels, keyboard navigation support
7. **Mobile Responsive**: CSS media queries for mobile layout

### Testing Strategy

1. **Backend Unit Tests**: Test API endpoints with pytest and TestClient
2. **Frontend Integration**: Manual testing (Jest/RTL setup deferred to future iteration)
3. **End-to-End**: Manual smoke tests with sample queries
4. **Edge Cases**: Test all error scenarios from spec (timeouts, empty results, etc.)

---

## Technology Choices Summary

| Category | Choice | Version | Reason |
|----------|--------|---------|--------|
| Backend Framework | FastAPI | ^0.104.0 | Async support, auto OpenAPI docs, Pydantic validation |
| Backend Server | Uvicorn | ^0.24.0 | ASGI server for FastAPI, production-ready |
| Frontend HTTP Client | fetch API | Built-in | No extra dependency, sufficient for simple requests |
| State Management | React hooks | Built-in | Simple state, no need for Redux/MobX |
| Storage | localStorage | Built-in | Browser API, persists across sessions |
| UI Framework | Docusaurus theme | 3.9.2 | Existing, maintains consistent styling |

---

## Open Questions (None Remaining)

All technical unknowns have been resolved. Ready to proceed to Phase 1 (Design & Contracts).

# Quickstart: RAG Agent Frontend Integration

**Feature**: 001-rag-frontend-integration
**Date**: 2025-12-13
**Target Audience**: Developers implementing this feature

## Overview

This quickstart provides step-by-step instructions for:
1. Setting up the FastAPI backend server
2. Integrating the RAG query widget into Docusaurus frontend
3. Running and testing the end-to-end integration locally

**Time to Complete**: ~30 minutes

---

## Prerequisites

- Python 3.11+ installed
- Node.js 20+ installed
- Qdrant database populated with textbook embeddings (see existing embedding pipeline)
- Environment variables configured in `.env`:
  ```bash
  OPENAI_API_KEY=<your-google-api-key>  # Used for Google Gemini
  COHERE_API_KEY=<your-cohere-api-key>
  QDRANT_URL=<your-qdrant-url>
  QDRANT_API_KEY=<your-qdrant-api-key>
  ```

---

## Part 1: Backend Setup (Python FastAPI)

### Step 1: Install Backend Dependencies

```bash
# Navigate to project root
cd ai_native_textbook

# Install new dependencies (FastAPI, Uvicorn)
pip install fastapi uvicorn[standard]

# Or update pyproject.toml and reinstall
pip install -e .
```

### Step 2: Create API Server

Create `api_server.py` in the project root (see implementation in tasks.md).

Key components:
- FastAPI app initialization
- CORS middleware configuration
- POST /api/query endpoint
- GET /health endpoint

### Step 3: Start the Backend Server

```bash
# Development mode (auto-reload on code changes)
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 4
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 4: Test Backend API

```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","services":{"qdrant":"connected","llm":"available"}}

# Test query endpoint
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is inverse kinematics?",
    "mode": "full_book"
  }'

# Expected response (truncated):
# {
#   "query_id": "...",
#   "status": "success",
#   "answer": "Inverse kinematics is...",
#   "confidence": { ... },
#   "sources": [ ... ]
# }
```

**Backend is now running! ✅**

---

## Part 2: Frontend Setup (Docusaurus React)

### Step 5: Install Frontend Dependencies

```bash
# Navigate to Docusaurus directory
cd my-book

# Install dependencies (if not already done)
npm install

# Optional: Install axios for HTTP requests (or use fetch)
npm install axios
```

### Step 6: Create API Service Layer

Create `my-book/src/services/api.ts` (see implementation in tasks.md).

This module handles:
- HTTP requests to backend API
- Error handling and timeouts
- TypeScript type definitions

### Step 7: Create RAG Query Widget Components

Create the following files in `my-book/src/components/RAGQueryWidget/`:
- `index.tsx` - Main component
- `QueryInput.tsx` - Input form
- `AnswerDisplay.tsx` - Answer rendering with sources
- `HistoryPanel.tsx` - Query history sidebar
- `styles.module.css` - Component styles

(See full implementation in tasks.md)

### Step 8: Integrate Widget Globally

Create `my-book/src/theme/Root.tsx`:

```tsx
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

This wraps the entire Docusaurus app and renders the RAG widget on every page.

### Step 9: Start the Frontend Server

```bash
# In my-book/ directory
npm start

# Expected output:
# [INFO] Starting the development server...
# [SUCCESS] Docusaurus website is running at: http://localhost:3000/
```

**Frontend is now running! ✅**

---

## Part 3: End-to-End Testing

### Test 1: Full-Book Query

1. Open http://localhost:3000 in your browser
2. Click the "Ask Question" button (floating widget in bottom-right corner)
3. Type: "What is inverse kinematics?"
4. Click "Submit" or press Enter
5. Verify:
   - Loading spinner appears during processing
   - Answer displays within 5 seconds
   - Source citations [1], [2] are clickable
   - Confidence level indicator shows (high/medium/low)

**Expected Result**: Grounded answer with source metadata ✅

### Test 2: Selected-Text Query

1. On any textbook page, select/highlight a paragraph of text
2. Click "Ask about selected text" button (appears near selection)
3. Type: "Explain this in simple terms"
4. Click "Submit"
5. Verify:
   - Answer is grounded only in the selected text
   - Sources reference the selected passage

**Expected Result**: Contextual answer based on selection ✅

### Test 3: Query History

1. Ask 3-5 different questions
2. Click "History" button to open history panel
3. Verify:
   - All questions and answers are listed chronologically
   - Clicking a history item re-displays the full answer
4. Refresh the page
5. Open history again
6. Verify:
   - History persists across page refreshes (localStorage)

**Expected Result**: Persistent query history ✅

### Test 4: Error Handling

1. Stop the backend server (Ctrl+C in terminal)
2. Try submitting a query in the frontend
3. Verify:
   - User-friendly error message: "Unable to reach the question-answering service. Please try again later."
   - No technical stack trace or confusing details

**Expected Result**: Graceful error handling ✅

---

## Development Workflow

### Running Both Servers Concurrently

**Terminal 1** (Backend):
```bash
cd ai_native_textbook
uvicorn api_server:app --reload --port 8000
```

**Terminal 2** (Frontend):
```bash
cd ai_native_textbook/my-book
npm start
```

Both servers must be running for the integration to work.

### Hot Reload

- **Backend**: Uvicorn auto-reloads on `.py` file changes
- **Frontend**: Webpack dev server auto-reloads on `.tsx/.ts/.css` file changes

### Debugging

**Backend Logs**:
- Check `agent.log` file for RetrievalAgent logs
- Check terminal for FastAPI request/response logs

**Frontend Logs**:
- Open browser DevTools (F12)
- Check Console tab for React errors
- Check Network tab for API request/response details

### Environment Variables

Create `.env` file in project root:
```bash
# Backend API
OPENAI_API_KEY=<google-gemini-api-key>
COHERE_API_KEY=<cohere-api-key>
QDRANT_URL=<qdrant-cloud-url>
QDRANT_API_KEY=<qdrant-api-key>

# Optional: Override frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

---

## Troubleshooting

### Problem: CORS errors in browser console

**Symptom**: `Access-Control-Allow-Origin` error in DevTools

**Solution**: Verify CORS middleware configuration in `api_server.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Must match Docusaurus dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problem: Backend returns 500 error

**Symptom**: Query fails with "Internal Server Error"

**Solution**:
1. Check `agent.log` for detailed error
2. Verify Qdrant connection: `curl http://localhost:8000/health`
3. Verify environment variables are loaded

### Problem: Frontend widget doesn't appear

**Symptom**: No "Ask Question" button visible on pages

**Solution**:
1. Verify `Root.tsx` was created in `my-book/src/theme/`
2. Clear browser cache and hard reload (Ctrl+Shift+R)
3. Check browser console for React errors

### Problem: Queries timeout

**Symptom**: "Query is taking longer than expected" message

**Solution**:
1. Check Qdrant database is responsive
2. Increase timeout in `api.ts` (default 30 seconds)
3. Optimize Qdrant collection (indexing, vector size)

---

## Next Steps

After verifying the integration works locally:

1. **Write Tests**: Add pytest tests for `api_server.py` endpoints
2. **Optimize Performance**: Profile slow queries and optimize retrieval
3. **Improve UI/UX**: Refine widget design based on user feedback
4. **Deploy to Production**:
   - Deploy backend to cloud service (Render, Railway, AWS Lambda)
   - Configure production CORS origins
   - Update frontend API URL to production endpoint

---

## API Reference

**Query Endpoint**: `POST /api/query`

**Request**:
```json
{
  "text": "string (1-500 chars)",
  "selected_text": "string (optional, max 2000 chars)",
  "mode": "full_book" | "selected_text"
}
```

**Response**:
```json
{
  "query_id": "uuid",
  "status": "success" | "insufficient_context" | "error",
  "answer": "string (if success)",
  "confidence": { "overall": 0-1, "level": "high|medium|low" },
  "sources": [ { "chunk_id", "citation_index", "relevance_score", "excerpt", "metadata" } ],
  "metadata": { "total_time_ms", "retrieval_time_ms", "generation_time_ms" }
}
```

Full API documentation: See `contracts/api-openapi.yaml` or visit http://localhost:8000/docs (FastAPI auto-generated docs)

---

## Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Docusaurus Documentation**: https://docusaurus.io/docs
- **React Hooks Reference**: https://react.dev/reference/react
- **Qdrant Client Python**: https://qdrant.tech/documentation/frameworks/python/
- **Cohere Embeddings**: https://docs.cohere.com/reference/embed

---

**You're all set!** 🎉 The RAG agent frontend integration is now running locally. Happy coding!

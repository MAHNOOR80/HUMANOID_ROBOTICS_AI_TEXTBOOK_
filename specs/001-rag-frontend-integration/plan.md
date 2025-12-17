# Implementation Plan: RAG Agent Frontend Integration

**Branch**: `001-rag-frontend-integration` | **Date**: 2025-12-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-rag-frontend-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate the existing RAG agent backend (agent.py) with the Docusaurus book frontend to enable contextual Q&A. The implementation will:
1. Wrap the RetrievalAgent in a FastAPI HTTP service exposing a `/query` endpoint
2. Create a React component in Docusaurus for query input, answer display, and source citations
3. Support two modes: full-book queries and selected-text-only queries
4. Store query history in browser localStorage
5. Provide graceful error handling and loading states

**Technical Approach**: Minimal changes to existing code. Backend adds a thin FastAPI wrapper around RetrievalAgent.query(). Frontend adds a single React component integrated via Docusaurus swizzling or plugin system.

## Technical Context

**Backend:**
- **Language/Version**: Python 3.11+ (from pyproject.toml requires-python)
- **Primary Dependencies**: FastAPI (new), uvicorn (new), python-dotenv, cohere, qdrant-client, google-generativeai
- **Existing Code**: agent.py (RetrievalAgent class), retrieve.py (Qdrant utilities)
- **Storage**: Qdrant vector database (already populated with textbook embeddings)
- **Testing**: pytest (already configured)
- **Target Platform**: Web server (localhost:8000 for dev, production deployment TBD)

**Frontend:**
- **Language/Version**: TypeScript/JavaScript (Docusaurus 3.9.2, React 19.0.0)
- **Primary Dependencies**: @docusaurus/core, React, axios or fetch API
- **Existing Code**: my-book/docusaurus.config.ts, my-book/src/ directory
- **Testing**: Not currently configured (can add Jest/React Testing Library in future)
- **Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (backend + frontend)

**Performance Goals**:
- <5 seconds end-to-end for 95% of queries (per SC-001)
- Backend retrieval: <2 seconds (Qdrant + Cohere embedding + LLM generation)
- Frontend rendering: <500ms (React component updates)

**Constraints**:
- Query text: 1-500 characters (validation on frontend and backend)
- Selected text: 0-2000 characters (validation on frontend and backend)
- CORS: Backend must allow requests from Docusaurus dev server (http://localhost:3000) and production domain
- Network timeout: 30 seconds max (frontend should timeout gracefully)

**Scale/Scope**:
- Single-user local development initially, scalable to multi-user production
- Estimated 10-100 concurrent users for educational use case
- Qdrant collection size: ~1000-10000 embedded chunks (existing)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Docusaurus-First Architecture ✅
**Status**: PASS
- Feature integrates with existing Docusaurus book (my-book/)
- No changes to Markdown content or chapter structure
- UI component will be added as React component within Docusaurus ecosystem

### II. Phase-Chapter Correspondence (NON-NEGOTIABLE) ✅
**Status**: PASS (N/A)
- This feature is infrastructure, not educational content
- Does not add, remove, or modify the 8-phase chapter structure
- Enhances learning experience without altering curriculum

### III. Content Completeness & Clarity ✅
**Status**: PASS
- Feature adds Q&A capability without modifying existing educational content
- Will improve clarity by enabling students to ask questions and get grounded answers
- Does not introduce ambiguity to textbook materials

### IV. AI-Native Content Generation ✅
**Status**: PASS
- Feature uses verified external tools (Qdrant, Cohere, Google Gemini) rather than internal knowledge
- RAG agent already grounds answers in textbook content, not LLM training data
- Aligns perfectly with AI-native principle of verifiable, sourced information

### V. Minimal Design, Maximum Utility ✅
**Status**: PASS
- Minimal backend changes: single FastAPI server file (api_server.py)
- Minimal frontend changes: single React component (RAGQueryWidget.tsx)
- No unnecessary files, folders, or complexity
- Reuses existing agent.py without modification

### VI. Hierarchical Navigation & Accessibility ✅
**Status**: PASS
- Does not modify sidebars.js or navigation structure
- Adds floating widget/sidebar accessible from all pages
- Enhances accessibility by providing contextual help

### VII. Iterative Refinement & Version Control ✅
**Status**: PASS
- All changes tracked in git on branch 001-rag-frontend-integration
- Plan and tasks will be documented in specs/ directory
- Future iterations can refine UI/UX based on student feedback

**GATE RESULT: ✅ PASS - No constitutional violations. Proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Backend (Python)
ai_native_textbook/
├── agent.py                    # Existing RAG agent (NO CHANGES)
├── retrieve.py                 # Existing Qdrant utilities (NO CHANGES)
├── api_server.py               # NEW: FastAPI server wrapping RetrievalAgent
├── pyproject.toml              # UPDATE: Add fastapi, uvicorn dependencies
├── .env                        # UPDATE: Add API_BASE_URL configuration
└── tests/
    ├── test_agent.py           # Existing tests (NO CHANGES)
    └── test_api_server.py      # NEW: API endpoint tests

# Frontend (TypeScript/React/Docusaurus)
my-book/
├── src/
│   ├── components/
│   │   └── RAGQueryWidget/     # NEW: Main Q&A component
│   │       ├── index.tsx       # Component entry point
│   │       ├── QueryInput.tsx  # Query input UI
│   │       ├── AnswerDisplay.tsx # Answer rendering with sources
│   │       ├── HistoryPanel.tsx  # Query history sidebar
│   │       └── styles.module.css # Component styles
│   ├── services/
│   │   └── api.ts              # NEW: Backend API client
│   └── theme/
│       └── Root.tsx            # UPDATE: Inject RAGQueryWidget globally
├── docusaurus.config.ts        # NO CHANGES (or minimal CORS config)
└── package.json                # UPDATE: Add axios dependency (optional)
```

**Structure Decision**: Web application structure (backend + frontend separated). Backend stays in project root alongside existing agent.py. Frontend components go in my-book/src/components/ following Docusaurus conventions. This maintains separation of concerns while keeping both in the same repository.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** All constitution principles are satisfied.

---

## Planning Completion Summary

**Status**: ✅ Planning Phase Complete

**Artifacts Generated**:
1. ✅ `plan.md` - Implementation plan with technical context and structure
2. ✅ `research.md` - Technology decisions and implementation patterns (6 research areas)
3. ✅ `data-model.md` - Complete entity definitions and validation rules (7 entities)
4. ✅ `contracts/api-openapi.yaml` - OpenAPI 3.0 specification for REST API
5. ✅ `quickstart.md` - Developer onboarding guide (30-minute setup)

**Key Decisions**:
- **Backend**: FastAPI server (`api_server.py`) wrapping existing `RetrievalAgent`
- **Frontend**: React component (`RAGQueryWidget`) integrated via Docusaurus `Root.tsx`
- **API Contract**: POST /api/query with QueryRequest → AgentResponse
- **Storage**: localStorage for query history (max 50 items, FIFO)
- **Error Handling**: Status-code-based mapping to user-friendly messages

**Next Step**: Run `/sp.tasks` to generate actionable implementation tasks from this plan.

**Estimated Implementation Effort**: 3-5 days (1 day backend, 2 days frontend, 1-2 days testing/refinement)

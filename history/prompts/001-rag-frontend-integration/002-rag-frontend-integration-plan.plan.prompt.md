---
id: 002
title: RAG Frontend Integration Planning
stage: plan
date: 2025-12-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-rag-frontend-integration
branch: 001-rag-frontend-integration
user: user
command: /sp.plan
labels: ["rag", "frontend", "backend", "api", "docusaurus", "fastapi", "planning"]
links:
  spec: specs/001-rag-frontend-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-rag-frontend-integration/plan.md
  - specs/001-rag-frontend-integration/research.md
  - specs/001-rag-frontend-integration/data-model.md
  - specs/001-rag-frontend-integration/contracts/api-openapi.yaml
  - specs/001-rag-frontend-integration/quickstart.md
tests:
  - Constitution Check: All 7 principles passed
  - Technical Context: All fields resolved (no NEEDS CLARIFICATION)
  - Research: 6 technical areas researched and decided
---

## Prompt

/sp.plan
Create a concise integration plan covering:
- Exposing the agent as a callable backend service
- Sending queries and selected text from the frontend
- Handling responses and source metadata in the UI
- Supporting local development and testing workflow
- Verifying end-to-end functionality with sample queries

## Response snapshot

Successfully completed planning phase for RAG agent frontend integration:

**Phase 0: Research** (6 areas)
1. FastAPI integration pattern → Standalone api_server.py wrapping RetrievalAgent
2. Docusaurus React integration → Root.tsx theme swizzling for global widget
3. Selected text capture → window.getSelection() with custom UI
4. Query history → localStorage with session-based expiration (50 item limit)
5. Error handling → Status-code-based user-friendly message mapping
6. API contracts → Pydantic (backend) + TypeScript interfaces (frontend)

**Phase 1: Design**

Data Model (7 entities):
- QueryRequest (text, selected_text, mode)
- AgentResponse (query_id, status, answer, confidence, sources, metadata)
- ConfidenceScore (retrieval_quality, coverage_score, entailment_score, lexical_overlap)
- SourceReference (chunk_id, citation_index, relevance_score, excerpt, metadata)
- ChunkMetadata (page_number, section_title, chapter, url, chunk_index)
- ResponseMetadata (model, temperature, timings, tokens_used, timestamp)
- QueryHistoryItem (frontend-only localStorage entity)

API Contracts:
- POST /api/query (QueryRequest → AgentResponse)
- GET /health (health check with Qdrant + LLM status)
- OpenAPI 3.0 specification with examples and full schema definitions

**Project Structure**:
Backend:
- api_server.py (NEW FastAPI server)
- agent.py (NO CHANGES - reused)
- tests/test_api_server.py (NEW)

Frontend:
- my-book/src/components/RAGQueryWidget/ (NEW component tree)
- my-book/src/services/api.ts (NEW API client)
- my-book/src/theme/Root.tsx (UPDATE for global injection)

**Constitution Check**: ✅ PASS (all 7 principles satisfied)

**Key Technical Decisions**:
- FastAPI over Flask (async support, auto OpenAPI docs)
- Root.tsx swizzling over Docusaurus plugin (simpler)
- localStorage over backend storage (privacy-friendly, simpler)
- Fetch API over axios (no extra dependency)
- Status-code error mapping (user-friendly messages)

**Developer Onboarding**: 30-minute quickstart guide created with step-by-step instructions for local setup and testing

## Outcome

- ✅ Impact: Complete implementation plan ready for task breakdown. All technical unknowns resolved through research. Clear path from current state (separate agent.py + Docusaurus) to integrated system.
- 🧪 Tests: Constitution check passed all 7 principles. No violations or complexity tracking needed.
- 📁 Files: 5 artifacts created (plan, research, data-model, API contract, quickstart)
- 🔁 Next prompts: `/sp.tasks` to generate actionable implementation tasks with acceptance criteria
- 🧠 Reflection: Planning phase identified optimal integration points (FastAPI wrapper, Root.tsx injection) that minimize code changes to existing systems. Research phase prevented over-engineering (e.g., rejected GraphQL, Redux, backend history storage). Data model and contracts provide clear frontend/backend contract preventing integration issues.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all artifacts generated
- Graders run and results (PASS/FAIL): Constitution Check - PASS (all 7 principles), Technical Context - PASS (no unresolved clarifications)
- Prompt variant (if applicable): N/A - Standard /sp.plan workflow with user-specified focus areas
- Next experiment (smallest change to try): Proceed to /sp.tasks to generate implementation tasks, then implement backend first (api_server.py) as it's simpler and can be tested independently before frontend integration

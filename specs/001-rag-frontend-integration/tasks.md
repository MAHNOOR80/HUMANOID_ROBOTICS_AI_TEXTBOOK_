# Implementation Tasks: RAG Agent Frontend Integration

**Feature**: 001-rag-frontend-integration
**Created**: 2025-12-13
**Spec**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)
**Priority Order**: User stories from [spec.md](spec.md) in P1, P2, P3 order

## Implementation Strategy

**MVP Scope**: Complete User Story 1 (core Q&A functionality) with minimal viable backend and frontend components. This delivers immediate value as a standalone AI assistant.

**Delivery Approach**:
1. Setup phase: Prepare project infrastructure
2. Foundational phase: Create shared backend components
3. User Story phases: Implement each story with all dependencies
4. Polish phase: Cross-cutting concerns and optimization

**Parallel Opportunities**: Backend API development can proceed independently of frontend development. Frontend components can be developed in parallel once API contract is established.

---

## Phase 1: Setup (Project Infrastructure)

**Goal**: Prepare development environment and project structure for RAG integration

- [X] T001 Create backend directory structure in ai_native_textbook/ (if not already present)
- [X] T002 [P] Create frontend directory structure in my-book/src/components/RAGQueryWidget/
- [X] T003 [P] Create contracts directory in specs/001-rag-frontend-integration/contracts/
- [X] T004 [P] Update pyproject.toml to include fastapi and uvicorn dependencies
- [X] T005 [P] Create .env.example file with required environment variables documentation
- [X] T006 Install FastAPI and uvicorn dependencies in virtual environment
- [X] T007 Create api_server.py file in project root with basic FastAPI app structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Create shared backend components that all user stories depend on

- [X] T008 [P] Create Pydantic models for QueryRequest in ai_native_textbook/api_server.py
- [X] T009 [P] Create Pydantic models for AgentResponse in ai_native_textbook/api_server.py
- [X] T010 [P] Create ResponseStatus enum in ai_native_textbook/api_server.py
- [X] T011 [P] Add CORS middleware configuration to FastAPI app in ai_native_textbook/api_server.py
- [X] T012 [P] Initialize RetrievalAgent instance in ai_native_textbook/api_server.py
- [X] T013 Create POST /api/query endpoint in ai_native_textbook/api_server.py with request/response validation
- [X] T014 Create GET /health endpoint in ai_native_textbook/api_server.py to check service status
- [X] T015 Create TypeScript interfaces for QueryRequest in my-book/src/services/api.ts
- [X] T016 Create TypeScript interfaces for AgentResponse in my-book/src/services/api.ts
- [X] T017 Create API service functions for query endpoint in my-book/src/services/api.ts
- [X] T018 Create API service functions for health check in my-book/src/services/api.ts
- [X] T019 Test backend server startup with uvicorn and verify endpoints are accessible

---

## Phase 3: User Story 1 - Ask Questions from Any Book Page (Priority: P1)

**Goal**: Enable core Q&A functionality where users can ask questions about textbook content from any page

**Independent Test**: Can be fully tested by opening any textbook page, clicking a "Ask Question" interface element, typing a question like "What is inverse kinematics?", and receiving a grounded answer with source citations. Delivers immediate value as a standalone AI assistant.

**Acceptance Scenarios**:
1. Given I am reading a page in the Docusaurus book, When I click the "Ask Question" button/widget, Then a query input interface appears
2. Given the query input is visible, When I type "What is inverse kinematics?" and submit, Then the system sends my query to the backend agent and displays a grounded answer with source citations within 5 seconds
3. Given I receive an answer, When I review the response, Then I see the answer text, confidence level indicator, and at least one source reference with metadata (section title, URL)
4. Given the answer contains source citations like [1], [2], When I click on a citation, Then I can view the original source excerpt or navigate to the source section

- [X] T020 [P] [US1] Create QueryInput component in my-book/src/components/RAGQueryWidget/QueryInput.tsx
- [X] T021 [P] [US1] Create AnswerDisplay component in my-book/src/components/RAGQueryWidget/AnswerDisplay.tsx
- [X] T022 [P] [US1] Create main RAGQueryWidget component in my-book/src/components/RAGQueryWidget/index.tsx
- [X] T023 [P] [US1] Create styles module for RAGQueryWidget in my-book/src/components/RAGQueryWidget/styles.module.css
- [X] T024 [US1] Implement query submission functionality in RAGQueryWidget using API service
- [X] T025 [US1] Implement loading state display in RAGQueryWidget during query processing
- [X] T026 [US1] Implement answer display with confidence level indicator in AnswerDisplay component
- [X] T027 [US1] Implement source citation rendering with metadata in AnswerDisplay component
- [X] T028 [US1] Implement citation click functionality to view source excerpt
- [X] T029 [US1] Create Root.tsx theme wrapper to inject RAGQueryWidget globally in my-book/src/theme/Root.tsx
- [X] T030 [US1] Test end-to-end functionality: submit query → receive answer → display with sources
- [X] T031 [US1] Verify response time is under 5 seconds for 95% of queries (SC-001)

---

## Phase 4: User Story 2 - Query Selected Text Only (Priority: P2)

**Goal**: Enable users to ask questions specifically about text they've selected/highlighted on the page, with answers grounded only in that specific passage

**Independent Test**: Can be tested by highlighting a paragraph on any textbook page, right-clicking or using a context menu to select "Ask about this", entering a question, and receiving an answer grounded only in the selected text. Works independently of full-book queries.

**Acceptance Scenarios**:
1. Given I am reading the textbook, When I select/highlight a paragraph of text, Then a "Ask about selected text" option appears in a context menu or toolbar
2. Given I have text selected, When I choose "Ask about selected text" and submit a question, Then the backend receives both my query and the selected text as context
3. Given the backend processes a selected-text query, When it returns results, Then the answer is grounded only in the selected text, not in other textbook chunks
4. Given insufficient information exists in the selected text, When I ask a question, Then the system responds "I cannot find sufficient information in the selected text to answer this question"

- [X] T032 [P] [US2] Add selected text tracking functionality to RAGQueryWidget component
- [X] T033 [P] [US2] Implement text selection detection using window.getSelection() API
- [X] T034 [P] [US2] Create UI for "Ask about selected text" button that appears near selection
- [X] T035 [US2] Modify API service to accept selected_text parameter in queries
- [X] T036 [US2] Update QueryRequest model to support selected_text and mode fields
- [X] T037 [US2] Update backend endpoint to handle selected-text mode with proper validation
- [X] T038 [US2] Implement validation for selected text length (20-2000 characters)
- [X] T039 [US2] Test selected-text query functionality end-to-end
- [X] T040 [US2] Verify answers are grounded only in selected text (SC-005)

---

## Phase 5: User Story 3 - View Query History (Priority: P3)

**Goal**: Enable users to see their previous questions and answers in a session history for reference

**Independent Test**: Can be tested by asking 3-5 questions, then opening a "History" panel and verifying all questions and answers are displayed with timestamps. Independently valuable as a study aid feature.

**Acceptance Scenarios**:
1. Given I have asked multiple questions during my session, When I open the query history panel, Then I see a chronological list of all my questions and their answers
2. Given the history panel is open, When I click on a previous question, Then the full answer with sources is displayed again
3. Given I refresh the page or return later, When I check the history, Then my session history is preserved (using browser local storage or session storage)

- [X] T041 [P] [US3] Create HistoryPanel component in my-book/src/components/RAGQueryWidget/HistoryPanel.tsx
- [X] T042 [P] [US3] Create TypeScript interface for QueryHistoryItem in my-book/src/services/historyStorage.ts
- [X] T043 [P] [US3] Implement saveToHistory function using localStorage in my-book/src/services/historyStorage.ts
- [X] T044 [P] [US3] Implement getHistory function using localStorage in my-book/src/services/historyStorage.ts
- [X] T045 [P] [US3] Implement clearHistory function using localStorage in my-book/src/services/historyStorage.ts
- [X] T046 [US3] Add history tracking to query submission flow in RAGQueryWidget
- [X] T047 [US3] Implement history panel UI with chronological display of queries and responses
- [X] T048 [US3] Implement functionality to restore previous answers when clicking history items
- [X] T049 [US3] Implement localStorage size limits (max 50 items with FIFO eviction)
- [X] T050 [US3] Test history persistence across page refreshes (SC-006)

---

## Phase 6: Error Handling and Edge Cases

**Goal**: Implement robust error handling and edge case management per spec requirements

- [X] T051 [P] Create error message mapping constants in my-book/src/services/errorMessages.ts
- [X] T052 [P] Implement backend validation for query text length (1-500 characters)
- [X] T053 [P] Implement backend validation for selected text length (0-2000 characters)
- [X] T054 [P] Create error response handling in API service for network failures
- [X] T055 [P] Create error response handling in API service for timeout scenarios
- [X] T056 [P] Create error response handling in API service for insufficient context
- [X] T057 [P] Create error response handling in API service for backend errors
- [X] T058 [P] Implement timeout handling (30 seconds) in frontend API calls
- [X] T059 [P] Implement concurrent query handling (queue or reject) in frontend
- [X] T060 [P] Implement user-friendly error display in RAGQueryWidget
- [X] T061 [P] Test all error scenarios from spec edge cases
- [X] T062 [P] Verify system handles backend errors gracefully (SC-007)
- [X] T063 [P] Verify system provides informative feedback for insufficient content (SC-008)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final touches, optimization, and cross-cutting concerns

- [ ] T064 [P] Add proper TypeScript typing throughout all components and services
- [ ] T065 [P] Add accessibility attributes (ARIA labels, keyboard navigation) to RAGQueryWidget
- [ ] T066 [P] Optimize component rendering performance with React.memo where appropriate
- [ ] T067 [P] Add loading skeletons for better perceived performance
- [ ] T068 [P] Add keyboard shortcuts for common actions (e.g., Ctrl+K to focus query input)
- [ ] T069 [P] Add proper meta tags and SEO considerations to RAGQueryWidget
- [ ] T070 [P] Create comprehensive README section for RAG integration in main README.md
- [ ] T071 [P] Add API documentation link to Docusaurus sidebar
- [ ] T072 [P] Create test coverage for backend API endpoints
- [ ] T073 [P] Perform end-to-end testing of all user stories
- [ ] T074 [P] Optimize backend response times to meet performance goals (<5 seconds)
- [ ] T075 [P] Document API endpoints using FastAPI's automatic OpenAPI documentation

---

## Dependencies

**User Story Completion Order**:
1. User Story 1 (P1) - Core Q&A functionality (independent, can be MVP)
2. User Story 2 (P2) - Selected text queries (depends on US1 foundation)
3. User Story 3 (P3) - Query history (depends on US1 foundation)

**Critical Path**: T001-T019 (Setup + Foundational) → T020-T031 (US1) → T032-T040 (US2) → T041-T050 (US3)

**Parallel Opportunities**:
- Backend API development (T008-T014) can run parallel to frontend component creation (T020-T023)
- Error handling tasks (T051-T063) can be implemented in parallel with feature development
- Individual components (QueryInput, AnswerDisplay, HistoryPanel) can be developed in parallel once API contract is stable

---

## Parallel Execution Examples

**Per User Story**:
- US1: QueryInput, AnswerDisplay, and main widget can be developed in parallel (T020-T022)
- US2: Text selection detection and API mode support can be developed in parallel (T033, T036)
- US3: History storage service and UI component can be developed in parallel (T042-T045, T041)

**Cross-Story**:
- All API endpoint development can be done in parallel with all frontend component development
- Error handling can be implemented across all stories simultaneously
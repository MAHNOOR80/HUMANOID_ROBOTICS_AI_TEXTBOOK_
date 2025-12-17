# Feature Specification: RAG Agent Frontend Integration

**Feature Branch**: `001-rag-frontend-integration`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "Integrate the RAG agent backend with the book frontend. Connect existing RAG agent backend to Docusaurus-based book frontend, enabling users to ask questions and receive grounded answers from textbook content."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Questions from Any Book Page (Priority: P1)

As a student reading the textbook, I want to ask questions about the content while staying on the current page, so that I can clarify concepts without interrupting my reading flow.

**Why this priority**: This is the core value proposition - enabling contextual Q&A directly within the reading experience. Without this, the RAG backend serves no purpose for end users.

**Independent Test**: Can be fully tested by opening any textbook page, clicking a "Ask Question" interface element, typing a question like "What is inverse kinematics?", and receiving a grounded answer with source citations. Delivers immediate value as a standalone AI assistant.

**Acceptance Scenarios**:

1. **Given** I am reading a page in the Docusaurus book, **When** I click the "Ask Question" button/widget, **Then** a query input interface appears
2. **Given** the query input is visible, **When** I type "What is inverse kinematics?" and submit, **Then** the system sends my query to the backend agent and displays a grounded answer with source citations within 5 seconds
3. **Given** I receive an answer, **When** I review the response, **Then** I see the answer text, confidence level indicator, and at least one source reference with metadata (section title, URL)
4. **Given** the answer contains source citations like [1], [2], **When** I click on a citation, **Then** I can view the original source excerpt or navigate to the source section

---

### User Story 2 - Query Selected Text Only (Priority: P2)

As a student, I want to ask questions specifically about text I've selected/highlighted on the page, so that I can get answers grounded only in that specific passage rather than the entire textbook.

**Why this priority**: Enhances precision and reduces noise. Users often want clarification on a specific paragraph or definition without broader context interfering.

**Independent Test**: Can be tested by highlighting a paragraph on any textbook page, right-clicking or using a context menu to select "Ask about this", entering a question, and receiving an answer grounded only in the selected text. Works independently of full-book queries.

**Acceptance Scenarios**:

1. **Given** I am reading the textbook, **When** I select/highlight a paragraph of text, **Then** a "Ask about selected text" option appears in a context menu or toolbar
2. **Given** I have text selected, **When** I choose "Ask about selected text" and submit a question, **Then** the backend receives both my query and the selected text as context
3. **Given** the backend processes a selected-text query, **When** it returns results, **Then** the answer is grounded only in the selected text, not in other textbook chunks
4. **Given** insufficient information exists in the selected text, **When** I ask a question, **Then** the system responds "I cannot find sufficient information in the selected text to answer this question"

---

### User Story 3 - View Query History and Previous Answers (Priority: P3)

As a student, I want to see my previous questions and answers in a session history, so that I can reference earlier explanations without re-asking questions.

**Why this priority**: Improves user experience and supports learning by providing a record of the conversation. Less critical than core Q&A functionality but valuable for power users.

**Independent Test**: Can be tested by asking 3-5 questions, then opening a "History" panel and verifying all questions and answers are displayed with timestamps. Independently valuable as a study aid feature.

**Acceptance Scenarios**:

1. **Given** I have asked multiple questions during my session, **When** I open the query history panel, **Then** I see a chronological list of all my questions and their answers
2. **Given** the history panel is open, **When** I click on a previous question, **Then** the full answer with sources is displayed again
3. **Given** I refresh the page or return later, **When** I check the history, **Then** my session history is preserved (using browser local storage or session storage)

---

### Edge Cases

- What happens when the backend is unreachable or returns an error? (Display user-friendly error message: "Unable to reach the question-answering service. Please try again later.")
- How does the system handle very long queries (>500 characters)? (Truncate or reject with message: "Question is too long. Please limit to 500 characters.")
- What happens when no relevant chunks are found (all similarity scores below threshold)? (Return: "I cannot find sufficient information in the textbook to answer this question.")
- How does the system handle concurrent queries from the same user? (Queue queries and process sequentially, or show loading state: "Previous query in progress...")
- What happens when selected text is very short (<20 characters) or very long (>2000 characters)? (Warn user: "Selected text is too short/long for meaningful analysis. Please select 20-2000 characters.")
- How does the system handle network timeouts during query processing? (Show timeout message after 30 seconds: "Query is taking longer than expected. Please try again.")

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST provide a user interface element (button, widget, or sidebar) accessible from all textbook pages for initiating queries
- **FR-002**: The frontend MUST send user queries to the backend agent via HTTP request (RESTful API endpoint) with the query text as payload
- **FR-003**: The frontend MUST support sending optional selected text along with queries when users choose "ask about selected text" mode
- **FR-004**: The backend agent MUST expose an HTTP API endpoint that accepts query text and optional selected text, returning structured responses
- **FR-005**: The backend MUST process queries using Qdrant retrieval with configurable top_k and score_threshold parameters
- **FR-006**: The backend MUST return responses in JSON format containing: answer text, confidence score, status (success/insufficient_context/error), source references array, and metadata
- **FR-007**: Each source reference MUST include: chunk_id, citation_index, relevance_score, excerpt, and metadata (section_title, url, page_number if available)
- **FR-008**: The frontend MUST display answers with clear visual hierarchy showing: main answer, confidence level, and expandable source citations
- **FR-009**: The frontend MUST handle three response statuses: SUCCESS (display answer + sources), INSUFFICIENT_CONTEXT (display informative message), ERROR (display error message)
- **FR-010**: The frontend MUST display loading state while query is processing (spinner, progress indicator, or skeleton screen)
- **FR-011**: Users MUST be able to view source excerpts and metadata for each citation in the answer
- **FR-012**: The system MUST support two query modes: full-book search (default) and selected-text-only search
- **FR-013**: The frontend MUST store query history in browser storage (localStorage or sessionStorage) for the current session
- **FR-014**: The frontend MUST display user-friendly error messages for network failures, timeouts, and backend errors
- **FR-015**: The system MUST validate query text length (minimum 1 character, maximum 500 characters) before sending to backend

### Key Entities

- **Query Request**: Represents a user question sent from frontend to backend
  - text: The natural language question (1-500 characters)
  - selected_text: Optional text snippet from the page (0-2000 characters)
  - mode: Query mode ("full_book" or "selected_text")
  - timestamp: When the query was initiated

- **Agent Response**: Structured data returned from backend to frontend
  - query_id: Unique identifier linking to original query
  - status: One of "success", "insufficient_context", "error"
  - answer: Generated answer text (if status is success)
  - confidence: Confidence score object with overall score and level (high/medium/low)
  - sources: Array of source references
  - metadata: Response metadata (model, timings, token usage)
  - error_message: Error details if status is error

- **Source Reference**: Citation linking answer to textbook chunk
  - chunk_id: References the stored chunk in Qdrant
  - citation_index: Position in answer (e.g., 1 for [1])
  - relevance_score: Similarity score from retrieval (0.0-1.0)
  - excerpt: Short text preview from the chunk
  - metadata: ChunkMetadata object (section_title, url, page_number, chapter)

- **Query History Item**: Stored record of past queries
  - query: Original query request
  - response: Agent response received
  - timestamp: When the query was processed
  - session_id: Browser session identifier

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can submit a question and receive an answer with sources in under 5 seconds for 95% of queries
- **SC-002**: The system correctly displays all three response statuses (success, insufficient context, error) with appropriate UI feedback
- **SC-003**: Users can successfully ask questions from any textbook page without navigation away from the current page
- **SC-004**: Source citations are clickable and display relevant metadata (section title, relevance score) for all successful responses
- **SC-005**: Selected-text queries return answers grounded only in the selected text, verified by comparing retrieved chunk IDs against the selected text content
- **SC-006**: Query history preserves all questions and answers within a browser session and survives page refreshes
- **SC-007**: The system handles backend errors gracefully, displaying user-friendly messages instead of technical error details for 100% of error scenarios
- **SC-008**: Users receive informative feedback when no relevant content is found (insufficient context response), eliminating confusion about empty results

## Assumptions

- The backend agent (agent.py) is already functional and can process queries via its RetrievalAgent.query() method
- The Qdrant vector database is populated with textbook embeddings and accessible via the backend
- The Docusaurus book is running and accessible at a known URL/port
- Users have JavaScript enabled in their browsers (required for React/Docusaurus functionality)
- The backend will be deployed and accessible at a known API endpoint (e.g., http://localhost:8000/api/query or production URL)
- The backend uses CORS configuration that allows requests from the Docusaurus frontend domain
- API communication uses JSON format for both requests and responses
- The backend agent uses Cohere embeddings (embed-english-v3.0) and Gemini/OpenAI for generation as implemented
- Users reading the textbook have basic familiarity with asking questions in natural language

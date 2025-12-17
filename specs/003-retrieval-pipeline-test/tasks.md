# Tasks: Retrieval Pipeline Testing

**Input**: Design documents from `/specs/003-retrieval-pipeline-test/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: Tests are NOT explicitly requested in the specification. Test tasks are included for validation but marked optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project structure**: `retrieve.py` at repository root
- **Tests**: `tests/` directory at repository root
- **Fixtures**: `tests/fixtures/` for test data

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure - prerequisite for all user stories

- [x] T001 Verify all dependencies are installed in pyproject.toml (qdrant-client>=1.8.0, cohere>=4.9.0, python-dotenv>=1.0.0, pytest>=7.4.0)
- [x] T002 Verify .env file contains required configuration (QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY)
- [x] T003 Create retrieve.py file at repository root with module docstring and imports
- [ ] T004 Create tests/ directory structure (tests/test_retrieve.py, tests/test_similarity.py, tests/fixtures/)
- [x] T005 [P] Setup logging configuration in retrieve.py (reuse pattern from main.py)
- [ ] T006 [P] Create tests/fixtures/sample_embeddings.json placeholder for test data
- [ ] T007 [P] Create tests/fixtures/query_test_cases.json placeholder for test scenarios

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Implement data model classes in retrieve.py: RetrievalQuery, RetrievalResult, TestCase, TestSuiteResult, CollectionInfo (from data-model.md)
- [x] T009 Implement connect_qdrant() function in retrieve.py per API contract (handle environment variables, timeout, error cases)
- [x] T010 Implement validate_collection() function in retrieve.py per API contract (check collection exists, return metadata)
- [x] T011 Add timing_decorator utility in retrieve.py (reuse pattern from main.py) for performance measurement
- [x] T012 Implement error handling classes in retrieve.py (ConnectionError, ValueError, RuntimeError subclasses)
- [ ] T013 [P] Create conftest.py in tests/ with pytest fixtures for Qdrant client and test collection
- [ ] T014 [P] Write unit test for connect_qdrant() in tests/test_retrieve.py (test successful connection, missing env vars, connection failure)
- [ ] T015 [P] Write unit test for validate_collection() in tests/test_retrieve.py (test existing collection, non-existent collection)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Retrieval Validation (Priority: P1) 🎯 MVP

**Goal**: Implement and validate direct retrieval of embeddings by ID from Qdrant

**Independent Test**: Connect to test collection, retrieve known embedding IDs, verify returned data matches expected vectors and metadata

**Why MVP**: This is the foundational capability - validates core storage/retrieval works before building semantic search on top

### Implementation Tasks

- [x] T016 [US1] Implement retrieve_by_id() function in retrieve.py per API contract (handle point_ids parameter, with_vectors, with_payload options)
- [x] T017 [US1] Add input validation to retrieve_by_id() (check collection_name exists, point_ids not empty, handle ValueError)
- [x] T018 [US1] Add performance timing to retrieve_by_id() using timing_decorator (target <100ms per success criteria SC-001)
- [x] T019 [US1] Implement RetrievalResult creation from Qdrant response in retrieve_by_id() (map id, score, vector, payload, timing)
- [x] T020 [US1] Add error handling for network failures in retrieve_by_id() (timeout, connection errors, retry logic)

### Test Tasks (Optional - for validation)

- [ ] T021 [P] [US1] Write unit test for retrieve_by_id() with valid IDs in tests/test_retrieve.py (verify correct results returned)
- [ ] T022 [P] [US1] Write unit test for retrieve_by_id() with non-existent IDs in tests/test_retrieve.py (verify empty result or error)
- [ ] T023 [P] [US1] Write unit test for retrieve_by_id() with empty point_ids in tests/test_retrieve.py (verify ValueError raised)
- [ ] T024 [P] [US1] Write integration test for retrieve_by_id() against live Qdrant in tests/test_retrieve.py (verify <100ms latency target)
- [ ] T025 [P] [US1] Create test fixtures for US1 in tests/fixtures/sample_embeddings.json (known embedding IDs and expected data)

### Acceptance Test

**Run this to verify US1 is complete**:
```python
from retrieve import connect_qdrant, retrieve_by_id

client = connect_qdrant()
results = retrieve_by_id(client, "test_collection", ["known_id_1", "known_id_2"])

assert len(results) == 2
assert results[0].id == "known_id_1"
assert results[0].retrieval_time_ms < 100  # SC-001
print("✅ US1: Basic Retrieval Validation - PASSED")
```

---

## Phase 4: User Story 2 - Similarity Search Validation (Priority: P2)

**Goal**: Implement and validate semantic similarity search with configurable parameters (top-k, thresholds, filters)

**Independent Test**: Generate query embedding, perform similarity search, verify top results are semantically relevant and ranked by score

**Dependencies**: Requires US1 (foundational retrieval) to be complete

### Implementation Tasks

- [ ] T026 [US2] Implement generate_query_embedding() function in retrieve.py per API contract (use Cohere API with input_type="search_query")
- [ ] T027 [US2] Add dimension validation to generate_query_embedding() (verify 1024 dimensions returned, handle API errors)
- [ ] T028 [US2] Implement similarity_search() function in retrieve.py per API contract (handle query_vector, top_k, score_threshold, filters parameters)
- [ ] T029 [US2] Add input validation to similarity_search() (check vector dimensions match collection, validate top_k range 1-100, score_threshold 0.0-1.0)
- [ ] T030 [US2] Add performance timing to similarity_search() using timing_decorator (target <500ms per success criteria SC-002)
- [ ] T031 [US2] Implement filter construction for similarity_search() (convert Dict filters to Qdrant Filter objects, handle invalid syntax)
- [ ] T032 [US2] Implement RetrievalResult ranking and formatting in similarity_search() (sort by score descending, apply threshold filter)

### Test Tasks (Optional - for validation)

- [ ] T033 [P] [US2] Write unit test for generate_query_embedding() in tests/test_similarity.py (verify 1024-dim output, test API failure handling)
- [ ] T034 [P] [US2] Write unit test for similarity_search() with valid query vector in tests/test_similarity.py (verify top-k results returned)
- [ ] T035 [P] [US2] Write unit test for similarity_search() with score_threshold in tests/test_similarity.py (verify filtering works)
- [ ] T036 [P] [US2] Write unit test for similarity_search() with metadata filters in tests/test_similarity.py (verify filter application)
- [ ] T037 [P] [US2] Write integration test for similarity_search() against live Qdrant in tests/test_similarity.py (verify <500ms latency, test relevance with known query-doc pairs)
- [ ] T038 [P] [US2] Create test fixtures for US2 in tests/fixtures/query_test_cases.json (query texts, expected doc IDs, relevance thresholds)

### Acceptance Test

**Run this to verify US2 is complete**:
```python
from retrieve import connect_qdrant, generate_query_embedding, similarity_search

client = connect_qdrant()
query_vector = generate_query_embedding("What is ROS 2?")

assert len(query_vector) == 1024  # Dimension check

results = similarity_search(
    client, "test_collection", query_vector,
    top_k=5, score_threshold=0.7
)

assert len(results) <= 5
assert all(r.score >= 0.7 for r in results)
assert results[0].retrieval_time_ms < 500  # SC-002
print("✅ US2: Similarity Search Validation - PASSED")
```

---

## Phase 5: User Story 3 - End-to-End Pipeline Validation (Priority: P3)

**Goal**: Implement test suite execution framework to validate complete pipeline integration

**Independent Test**: Run full test suite with multiple test cases, verify all scenarios pass and generate comprehensive test report

**Dependencies**: Requires US1 (retrieval) and US2 (similarity search) to be complete

### Implementation Tasks

- [ ] T039 [US3] Implement run_test_suite() function in retrieve.py per API contract (execute list of TestCase objects)
- [ ] T040 [US3] Implement test case execution logic in run_test_suite() (for each TestCase: generate embedding → search → validate results)
- [ ] T041 [US3] Implement result validation logic in run_test_suite() (check expected_doc_ids in top-k, verify relevance_threshold met)
- [ ] T042 [US3] Implement TestSuiteResult aggregation in run_test_suite() (count passed/failed/errors, calculate performance metrics)
- [ ] T043 [US3] Add performance metrics calculation to run_test_suite() (avg/p95/max retrieval times, pass rate percentage)
- [ ] T044 [US3] Add detailed logging to run_test_suite() (log each test case execution, results, failures with reasons)
- [ ] T045 [US3] Implement test report generation in run_test_suite() (format TestSuiteResult as readable summary)

### Test Tasks (Optional - for validation)

- [ ] T046 [P] [US3] Write unit test for run_test_suite() in tests/test_retrieve.py (test with sample TestCases, verify aggregation logic)
- [ ] T047 [P] [US3] Write integration test for run_test_suite() in tests/test_retrieve.py (run against live Qdrant with comprehensive test cases)
- [ ] T048 [P] [US3] Create comprehensive test fixtures in tests/fixtures/query_test_cases.json (10+ test cases covering success and edge cases)
- [ ] T049 [P] [US3] Write end-to-end validation script in tests/test_e2e.py (test extract → embed → store → retrieve flow with main.py integration)

### Acceptance Test

**Run this to verify US3 is complete**:
```python
from retrieve import connect_qdrant, run_test_suite, TestCase, TestStatus

client = connect_qdrant()

test_cases = [
    TestCase(
        name="test_ros2_query",
        query_text="What is ROS 2?",
        collection_name="test_collection",
        expected_doc_ids=["doc_ros2_intro"],
        expected_keywords=["ROS 2", "robot"],
        relevance_threshold=0.7,
        top_k=5,
        status=TestStatus.PENDING
    )
]

results = run_test_suite(client, "test_collection", test_cases)

assert results.total_tests == 1
assert results.passed == 1
assert results.pass_rate == 100.0  # SC-004
print("✅ US3: End-to-End Pipeline Validation - PASSED")
```

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, documentation, and quality improvements

- [ ] T050 [P] Add comprehensive docstrings to all functions in retrieve.py (follow Google/NumPy style)
- [ ] T051 [P] Add type hints to all function signatures in retrieve.py (use typing module)
- [ ] T052 [P] Implement CLI interface in retrieve.py (use argparse for --collection, --query, --test-suite, --benchmark, --validate flags per contract)
- [ ] T053 [P] Add __main__ block to retrieve.py for CLI execution (python retrieve.py ...)
- [ ] T054 [P] Write integration test for CLI interface in tests/test_cli.py (test all CLI flags and options)
- [ ] T055 [P] Create example test suite file at tests/fixtures/example_test_suite.json (demonstrate test case format)
- [ ] T056 [P] Add performance benchmarking function to retrieve.py (measure and report latency statistics)
- [ ] T057 [P] Write performance benchmark test in tests/test_performance.py (validate SC-001 <100ms and SC-002 <500ms targets)
- [ ] T058 Add edge case handling for all error scenarios from spec.md (empty collections, dimension mismatch, connection failures, invalid filters, large result sets, identical scores)
- [ ] T059 [P] Write edge case tests in tests/test_edge_cases.py (verify all 6 edge cases from spec handled correctly per SC-005)
- [ ] T060 [P] Update README.md with quickstart examples from quickstart.md (setup, basic usage, common tasks)
- [ ] T061 Run full test suite and verify all success criteria met (SC-001 through SC-006)

---

## Dependencies & Parallel Execution

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation)
                        ↓
                   Phase 3 (US1: Basic Retrieval) 🎯 MVP
                        ↓
                   Phase 4 (US2: Similarity Search)
                        ↓
                   Phase 5 (US3: End-to-End Testing)
                        ↓
                   Phase 6 (Polish)
```

### Parallel Execution Opportunities

**Within Phase 1 (Setup)**:
- T003, T005, T006, T007 can run in parallel (different files, no dependencies)

**Within Phase 2 (Foundation)**:
- T013, T014, T015 can run in parallel (test files independent of main implementation)
- T008-T012 must run sequentially (data models → connection → validation)

**Within Phase 3 (US1)**:
- T016-T020 should run sequentially (implementation dependencies)
- T021-T025 can ALL run in parallel (independent test files)

**Within Phase 4 (US2)**:
- T026-T027 should run sequentially (embedding generation first)
- T028-T032 should run sequentially (similarity search implementation)
- T033-T038 can ALL run in parallel (independent test files)

**Within Phase 5 (US3)**:
- T039-T045 should run sequentially (test suite framework)
- T046-T049 can ALL run in parallel (independent test files)

**Within Phase 6 (Polish)**:
- T050-T057, T059-T060 can ALL run in parallel (documentation, CLI, tests are independent)
- T058 depends on main implementation (run after T045)
- T061 must run last (final validation)

### Maximum Parallelization Example (Phase 3 - US1)

If implementing US1 with maximum parallelization:

**Sequential Steps**:
1. Complete T016-T020 (core implementation)

**Then in parallel**:
2. Run T021, T022, T023, T024, T025 simultaneously (all test tasks)

This reduces US1 completion time significantly.

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Focus**: User Story 1 (Basic Retrieval Validation) only

**Rationale**: US1 validates the foundational capability of retrieving stored embeddings. This is the minimum viable increment that delivers value and can be tested independently.

**Tasks for MVP**:
- Phase 1: T001-T007 (Setup)
- Phase 2: T008-T015 (Foundation)
- Phase 3: T016-T025 (US1 implementation and tests)

**MVP Acceptance**: Run US1 acceptance test successfully, verify SC-001 (<100ms retrieval latency)

### Incremental Delivery Plan

1. **Sprint 1**: MVP (US1 - Basic Retrieval)
   - Deliverable: retrieve.py with connect, validate, retrieve_by_id functions
   - Value: Can verify embeddings are stored and retrievable

2. **Sprint 2**: US2 (Similarity Search)
   - Deliverable: Add generate_query_embedding and similarity_search functions
   - Value: Can perform semantic search queries against collection

3. **Sprint 3**: US3 (End-to-End Testing)
   - Deliverable: Add run_test_suite function and test framework
   - Value: Comprehensive validation of full RAG retrieval pipeline

4. **Sprint 4**: Polish
   - Deliverable: CLI interface, documentation, performance benchmarks
   - Value: Production-ready testing utility with great UX

---

## Success Criteria Validation

### SC-001: Retrieval by ID <100ms
- **Validated by**: T024 (integration test with timing)
- **Measured in**: T018 (timing_decorator on retrieve_by_id)
- **Final check**: T061 (full test suite)

### SC-002: Similarity search <500ms
- **Validated by**: T037 (integration test with timing)
- **Measured in**: T030 (timing_decorator on similarity_search)
- **Final check**: T061 (full test suite)

### SC-003: 95% relevance in top-5
- **Validated by**: T037 (relevance validation with known query-doc pairs)
- **Measured in**: T041 (result validation logic in run_test_suite)
- **Final check**: T061 (full test suite)

### SC-004: 100% test case success
- **Validated by**: T047 (integration test of test suite)
- **Measured in**: T042 (TestSuiteResult pass rate calculation)
- **Final check**: T061 (full test suite)

### SC-005: 100% error handling
- **Validated by**: T059 (edge case tests for all 6 scenarios)
- **Implemented in**: T058 (edge case handling code)
- **Final check**: T061 (full test suite)

### SC-006: Repeatable test execution
- **Validated by**: T013 (pytest fixtures for reproducibility)
- **Implemented in**: T048 (comprehensive test fixtures)
- **Final check**: T061 (run suite multiple times, verify consistency)

---

## Task Summary

**Total Tasks**: 61

**By Phase**:
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundation): 8 tasks
- Phase 3 (US1): 10 tasks
- Phase 4 (US2): 13 tasks
- Phase 5 (US3): 11 tasks
- Phase 6 (Polish): 12 tasks

**By User Story**:
- Setup/Foundation: 15 tasks (prerequisite for all stories)
- US1 (Basic Retrieval): 10 tasks
- US2 (Similarity Search): 13 tasks
- US3 (End-to-End Testing): 11 tasks
- Cross-cutting (Polish): 12 tasks

**Parallelizable Tasks**: 32 tasks marked with [P]
**Sequential Tasks**: 29 tasks (implementation dependencies)

**MVP Tasks (US1 only)**: 25 tasks (T001-T025)

---

## Next Steps

1. **Start with MVP**: Execute Phase 1-3 (T001-T025) to deliver US1
2. **Validate MVP**: Run US1 acceptance test, verify SC-001
3. **Increment**: Add US2 (T026-T038), then US3 (T039-T049)
4. **Polish**: Complete Phase 6 (T050-T061) for production readiness
5. **Final validation**: Run T061 to verify all success criteria (SC-001 through SC-006)

# Data Model: Retrieval Pipeline Testing

**Feature**: 003-retrieval-pipeline-test
**Date**: 2025-12-12
**Purpose**: Define entities, data structures, and relationships for retrieval testing

## Core Entities

### 1. RetrievalQuery

Represents a query request to the retrieval system.

**Attributes**:
- `collection_name` (str): Name of the target Qdrant collection
- `query_vector` (List[float]): Embedding vector for similarity search (1024 dimensions for Cohere)
- `top_k` (int): Maximum number of results to return (default: 10, max: 100)
- `score_threshold` (Optional[float]): Minimum similarity score filter (0.0-1.0 for cosine similarity)
- `filters` (Optional[Dict]): Metadata filters for narrowing search results
- `with_vectors` (bool): Whether to include vector data in results (default: False)
- `with_payload` (bool): Whether to include payload/metadata in results (default: True)

**Validation Rules**:
- `query_vector` must have 1024 dimensions (for Cohere embeddings)
- `top_k` must be > 0 and <= 100
- `score_threshold` must be between 0.0 and 1.0 if provided
- `collection_name` must exist in Qdrant

**State Transitions**: N/A (Immutable query object)

**Example**:
```python
query = RetrievalQuery(
    collection_name="textbook_embeddings",
    query_vector=[0.1, 0.2, ..., 0.5],  # 1024 dimensions
    top_k=10,
    score_threshold=0.7,
    filters={"source_url": "https://example.com/chapter1"},
    with_vectors=False,
    with_payload=True
)
```

---

### 2. RetrievalResult

Represents a single retrieved point from Qdrant.

**Attributes**:
- `id` (Union[str, int]): Unique identifier of the point in Qdrant
- `score` (float): Similarity score (0.0 to 1.0 for cosine distance)
- `vector` (Optional[List[float]]): Embedding vector (included if `with_vectors=True`)
- `payload` (Dict[str, Any]): Metadata associated with the point
- `retrieval_time_ms` (float): Time taken to retrieve this result (milliseconds)

**Payload Structure** (from 001-embedding-pipeline):
- `content` (str): Text content of the chunk
- `source_url` (str): URL of the source document
- `chunk_id` (int): Sequential chunk identifier
- `chunk_index` (int): Position in the document
- `total_chunks` (int): Total number of chunks from this document
- `timestamp` (str): ISO format timestamp of when the embedding was created
- `embedding_model` (str): Model used for embedding (e.g., "embed-multilingual-v3.0")

**Relationships**:
- One RetrievalQuery → Many RetrievalResults
- One RetrievalResult → One stored embedding point in Qdrant

**Example**:
```python
result = RetrievalResult(
    id="uuid-1234-5678",
    score=0.92,
    vector=None,  # Not included in this example
    payload={
        "content": "ROS 2 is a robot operating system framework...",
        "source_url": "https://example.com/ros2-intro",
        "chunk_id": 3,
        "chunk_index": 2,
        "total_chunks": 10,
        "timestamp": "2025-12-10T15:30:00",
        "embedding_model": "embed-multilingual-v3.0"
    },
    retrieval_time_ms=45.2
)
```

---

### 3. TestCase

Represents a single test scenario for validation.

**Attributes**:
- `name` (str): Descriptive test case identifier (e.g., "test_ros2_query_relevance")
- `query_text` (str): Human-readable query text
- `collection_name` (str): Target collection for the test
- `expected_doc_ids` (List[str]): Expected document IDs that should appear in top results
- `expected_keywords` (List[str]): Keywords that should appear in result content
- `relevance_threshold` (float): Minimum similarity score for relevant results (0.0-1.0)
- `top_k` (int): Number of results to retrieve
- `status` (str): Test execution status ("pending", "running", "passed", "failed", "error")
- `actual_results` (Optional[List[RetrievalResult]]): Results from test execution
- `error_message` (Optional[str]): Error message if test failed

**Validation Rules**:
- `name` must be unique within test suite
- `relevance_threshold` must be between 0.0 and 1.0
- `top_k` must be > 0
- `status` must be one of: "pending", "running", "passed", "failed", "error"

**State Transitions**:
```
pending → running → (passed | failed | error)
```

**Example**:
```python
test_case = TestCase(
    name="test_ros2_basics_query",
    query_text="What is ROS 2 and how does it work?",
    collection_name="textbook_embeddings",
    expected_doc_ids=["doc_ros2_intro", "doc_ros2_architecture"],
    expected_keywords=["ROS 2", "robot", "operating system", "framework"],
    relevance_threshold=0.7,
    top_k=5,
    status="pending",
    actual_results=None,
    error_message=None
)
```

---

### 4. TestSuiteResult

Aggregates results from multiple test cases.

**Attributes**:
- `total_tests` (int): Total number of test cases executed
- `passed` (int): Number of tests that passed
- `failed` (int): Number of tests that failed
- `errors` (int): Number of tests that encountered errors
- `execution_time_ms` (float): Total execution time for all tests
- `test_results` (List[TestCase]): Individual test case results
- `performance_metrics` (Dict): Performance statistics
  - `avg_retrieval_time_ms` (float): Average retrieval time
  - `p95_retrieval_time_ms` (float): 95th percentile retrieval time
  - `max_retrieval_time_ms` (float): Maximum retrieval time
- `timestamp` (str): ISO format timestamp of test execution

**Calculated Fields**:
- `pass_rate` (float): `passed / total_tests * 100`
- `failure_rate` (float): `failed / total_tests * 100`

**Example**:
```python
suite_result = TestSuiteResult(
    total_tests=10,
    passed=9,
    failed=1,
    errors=0,
    execution_time_ms=5432.1,
    test_results=[test_case1, test_case2, ...],
    performance_metrics={
        "avg_retrieval_time_ms": 234.5,
        "p95_retrieval_time_ms": 450.2,
        "max_retrieval_time_ms": 502.8
    },
    timestamp="2025-12-12T14:30:00"
)
```

---

### 5. CollectionInfo

Represents metadata about a Qdrant collection.

**Attributes**:
- `name` (str): Collection name
- `vector_size` (int): Dimensionality of vectors (1024 for Cohere)
- `distance_metric` (str): Distance metric used ("Cosine", "Euclidean", "Dot")
- `points_count` (int): Total number of points in collection
- `indexed_vectors_count` (int): Number of indexed vectors
- `status` (str): Collection status ("green", "yellow", "red")

**Validation Rules**:
- `vector_size` must match query vector dimensions
- `points_count` >= 0

**Relationships**:
- One Collection → Many RetrievalResults (stored points)

**Example**:
```python
collection_info = CollectionInfo(
    name="textbook_embeddings",
    vector_size=1024,
    distance_metric="Cosine",
    points_count=5432,
    indexed_vectors_count=5432,
    status="green"
)
```

---

## Data Relationships

```
CollectionInfo (1) ──────── (N) RetrievalResult
                                      │
                                      │ (N)
                                      │
RetrievalQuery (1) ──────────────── (N) RetrievalResult

TestCase (1) ────────────────────── (N) RetrievalResult
      │                                   (actual_results)
      │ (N)
      │
TestSuiteResult (1)
```

**Key Relationships**:
1. One `RetrievalQuery` produces many `RetrievalResults`
2. One `TestCase` validates many `RetrievalResults`
3. One `TestSuiteResult` aggregates many `TestCases`
4. One `CollectionInfo` describes the collection containing many stored points

---

## Data Flow

### Similarity Search Flow

```
1. Input: query_text (str)
   ↓
2. Generate: query_vector (List[float]) via Cohere API
   ↓
3. Create: RetrievalQuery with query_vector + parameters
   ↓
4. Execute: Qdrant search() with RetrievalQuery
   ↓
5. Return: List[RetrievalResult] with scores and metadata
```

### Test Execution Flow

```
1. Load: TestCase definitions from test suite
   ↓
2. For each TestCase:
   a. Generate query embedding from query_text
   b. Execute similarity search
   c. Validate results against expected_doc_ids and relevance_threshold
   d. Update TestCase.status (passed/failed/error)
   ↓
3. Aggregate: All TestCase results into TestSuiteResult
   ↓
4. Report: TestSuiteResult with metrics and pass/fail summary
```

---

## Validation Rules Summary

### Query Validation
- Query vector dimensions must match collection vector size
- Top-k must be positive integer <= 100
- Score threshold must be in range [0.0, 1.0]
- Collection must exist in Qdrant

### Result Validation
- Similarity scores must be in range [0.0, 1.0] for cosine distance
- All results must have valid IDs
- Payload must contain expected fields from embedding pipeline

### Test Case Validation
- Expected document IDs must exist in collection
- Relevance threshold must be achievable (not too high)
- Query text must be non-empty

---

## Error Handling Patterns

### Validation Errors
- **DimensionMismatchError**: Query vector dimensions don't match collection
- **CollectionNotFoundError**: Target collection doesn't exist
- **InvalidParameterError**: Invalid top_k, score_threshold, or filter parameters

### Runtime Errors
- **ConnectionError**: Cannot connect to Qdrant instance
- **TimeoutError**: Query execution exceeds timeout threshold
- **EmbeddingError**: Cannot generate query embedding via Cohere

### Test Errors
- **RelevanceError**: Retrieved results don't meet relevance threshold
- **MissingDocumentError**: Expected documents not in top-k results
- **PerformanceError**: Retrieval time exceeds performance requirements

---

## Implementation Notes

### Type Definitions (Python)

```python
from typing import List, Dict, Optional, Union, Any
from dataclasses import dataclass
from enum import Enum

class TestStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    ERROR = "error"

@dataclass
class RetrievalQuery:
    collection_name: str
    query_vector: List[float]
    top_k: int = 10
    score_threshold: Optional[float] = None
    filters: Optional[Dict] = None
    with_vectors: bool = False
    with_payload: bool = True

@dataclass
class RetrievalResult:
    id: Union[str, int]
    score: float
    payload: Dict[str, Any]
    vector: Optional[List[float]] = None
    retrieval_time_ms: float = 0.0

@dataclass
class TestCase:
    name: str
    query_text: str
    collection_name: str
    expected_doc_ids: List[str]
    expected_keywords: List[str]
    relevance_threshold: float
    top_k: int = 10
    status: TestStatus = TestStatus.PENDING
    actual_results: Optional[List[RetrievalResult]] = None
    error_message: Optional[str] = None
```

### Serialization

All entities should be serializable to JSON for test reporting and logging:
- Use `dataclasses.asdict()` for conversion to dictionaries
- Store test results in JSON format for reproducibility
- Log queries and results for debugging

---

## Success Criteria Mapping

**SC-001**: Retrieval by ID <100ms
- Measured via `RetrievalResult.retrieval_time_ms`

**SC-002**: Similarity search <500ms
- Measured via `TestSuiteResult.performance_metrics.avg_retrieval_time_ms`

**SC-003**: 95% relevance in top-5
- Validated via `TestCase.expected_doc_ids` presence in top-5 `RetrievalResults`

**SC-004**: 100% test case success
- Measured via `TestSuiteResult.pass_rate`

**SC-005**: 100% error handling
- Validated via error handling tests in test suite

**SC-006**: Repeatable test execution
- Ensured via consistent `TestCase` definitions and deterministic test data

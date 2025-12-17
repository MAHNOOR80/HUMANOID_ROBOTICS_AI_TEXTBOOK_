# API Contract: retrieve.py

**Module**: retrieve.py
**Purpose**: Retrieval testing utility for Qdrant embeddings
**Version**: 1.0.0

## Public Functions

### 1. connect_qdrant()

**Purpose**: Establish connection to Qdrant instance using configuration from environment.

**Signature**:
```python
def connect_qdrant(
    url: Optional[str] = None,
    api_key: Optional[str] = None,
    timeout: float = 10.0
) -> QdrantClient
```

**Parameters**:
- `url` (Optional[str]): Qdrant instance URL. If None, reads from QDRANT_URL environment variable
- `api_key` (Optional[str]): API key for authentication. If None, reads from QDRANT_API_KEY environment variable
- `timeout` (float): Connection timeout in seconds. Default: 10.0

**Returns**: `QdrantClient` - Connected Qdrant client instance

**Raises**:
- `ConnectionError`: If connection to Qdrant fails
- `ValueError`: If URL or API key is missing and not in environment

**Example**:
```python
from retrieve import connect_qdrant

# Use environment variables
client = connect_qdrant()

# Or provide explicit credentials
client = connect_qdrant(
    url="https://qdrant.example.com:6333",
    api_key="your-api-key"
)
```

---

### 2. retrieve_by_id()

**Purpose**: Retrieve specific embeddings by their IDs.

**Signature**:
```python
def retrieve_by_id(
    client: QdrantClient,
    collection_name: str,
    point_ids: List[Union[str, int]],
    with_vectors: bool = False,
    with_payload: bool = True
) -> List[RetrievalResult]
```

**Parameters**:
- `client` (QdrantClient): Connected Qdrant client
- `collection_name` (str): Name of the target collection
- `point_ids` (List[Union[str, int]]): List of point IDs to retrieve
- `with_vectors` (bool): Include vector data in results. Default: False
- `with_payload` (bool): Include payload/metadata in results. Default: True

**Returns**: `List[RetrievalResult]` - Retrieved points with metadata

**Raises**:
- `ValueError`: If collection doesn't exist or point_ids is empty
- `ConnectionError`: If Qdrant connection fails during retrieval

**Performance**: Should complete in <100ms for collections up to 10K vectors

**Example**:
```python
results = retrieve_by_id(
    client=client,
    collection_name="textbook_embeddings",
    point_ids=["doc_001", "doc_002", "doc_003"],
    with_vectors=True
)

for result in results:
    print(f"ID: {result.id}, Score: {result.score}")
    print(f"Content: {result.payload['content'][:100]}...")
```

---

### 3. similarity_search()

**Purpose**: Perform semantic similarity search with query vector.

**Signature**:
```python
def similarity_search(
    client: QdrantClient,
    collection_name: str,
    query_vector: List[float],
    top_k: int = 10,
    score_threshold: Optional[float] = None,
    filters: Optional[Dict] = None,
    with_vectors: bool = False,
    with_payload: bool = True
) -> List[RetrievalResult]
```

**Parameters**:
- `client` (QdrantClient): Connected Qdrant client
- `collection_name` (str): Name of the target collection
- `query_vector` (List[float]): Query embedding vector (must match collection dimensions)
- `top_k` (int): Maximum number of results to return. Default: 10, Max: 100
- `score_threshold` (Optional[float]): Minimum similarity score filter (0.0-1.0). Default: None
- `filters` (Optional[Dict]): Metadata filters for search. Default: None
- `with_vectors` (bool): Include vector data in results. Default: False
- `with_payload` (bool): Include payload/metadata in results. Default: True

**Returns**: `List[RetrievalResult]` - Top-k most similar points ranked by score

**Raises**:
- `ValueError`: If query_vector dimensions don't match collection, or invalid parameters
- `ConnectionError`: If Qdrant connection fails during search

**Performance**: Should complete in <500ms for collections up to 100K vectors (top-10 search)

**Example**:
```python
# Generate query embedding first
query_vector = generate_query_embedding("What is ROS 2?", cohere_api_key)

# Search with basic parameters
results = similarity_search(
    client=client,
    collection_name="textbook_embeddings",
    query_vector=query_vector,
    top_k=10
)

# Search with threshold and filters
results = similarity_search(
    client=client,
    collection_name="textbook_embeddings",
    query_vector=query_vector,
    top_k=5,
    score_threshold=0.7,
    filters={"source_url": "https://example.com/chapter1"}
)

for rank, result in enumerate(results, 1):
    print(f"Rank {rank}: Score={result.score:.3f}")
    print(f"  Content: {result.payload['content'][:100]}...")
```

---

### 4. generate_query_embedding()

**Purpose**: Generate embedding vector for query text using Cohere API.

**Signature**:
```python
def generate_query_embedding(
    text: str,
    cohere_api_key: Optional[str] = None,
    model: str = "embed-multilingual-v3.0"
) -> List[float]
```

**Parameters**:
- `text` (str): Query text to embed
- `cohere_api_key` (Optional[str]): Cohere API key. If None, reads from COHERE_API_KEY environment variable
- `model` (str): Cohere embedding model. Default: "embed-multilingual-v3.0"

**Returns**: `List[float]` - Embedding vector (1024 dimensions for embed-multilingual-v3.0)

**Raises**:
- `ValueError`: If text is empty or API key is missing
- `RuntimeError`: If Cohere API call fails

**Note**: Uses `input_type="search_query"` for query embeddings (different from document embeddings)

**Example**:
```python
# Use environment variable for API key
query_vector = generate_query_embedding("What is ROS 2?")

# Or provide explicit API key
query_vector = generate_query_embedding(
    text="Explain Gazebo simulation",
    cohere_api_key="your-cohere-api-key"
)

print(f"Generated {len(query_vector)}-dimensional embedding")
# Output: Generated 1024-dimensional embedding
```

---

### 5. validate_collection()

**Purpose**: Validate that a collection exists and return its metadata.

**Signature**:
```python
def validate_collection(
    client: QdrantClient,
    collection_name: str
) -> Dict[str, Any]
```

**Parameters**:
- `client` (QdrantClient): Connected Qdrant client
- `collection_name` (str): Name of collection to validate

**Returns**: `Dict[str, Any]` - Collection metadata including:
  - `name` (str): Collection name
  - `vector_size` (int): Dimensionality of vectors
  - `distance_metric` (str): Distance metric ("Cosine", "Euclidean", "Dot")
  - `points_count` (int): Total number of points
  - `status` (str): Collection status
  - `exists` (bool): Whether collection exists

**Raises**:
- `ValueError`: If collection doesn't exist
- `ConnectionError`: If Qdrant connection fails

**Example**:
```python
info = validate_collection(client, "textbook_embeddings")

print(f"Collection: {info['name']}")
print(f"Vectors: {info['points_count']} x {info['vector_size']} dimensions")
print(f"Distance: {info['distance_metric']}")
print(f"Status: {info['status']}")

# Output:
# Collection: textbook_embeddings
# Vectors: 5432 x 1024 dimensions
# Distance: Cosine
# Status: green
```

---

### 6. run_test_suite()

**Purpose**: Execute comprehensive test suite with predefined test cases.

**Signature**:
```python
def run_test_suite(
    client: QdrantClient,
    collection_name: str,
    test_cases: List[TestCase],
    cohere_api_key: Optional[str] = None
) -> TestSuiteResult
```

**Parameters**:
- `client` (QdrantClient): Connected Qdrant client
- `collection_name` (str): Target collection for testing
- `test_cases` (List[TestCase]): List of test cases to execute
- `cohere_api_key` (Optional[str]): Cohere API key for query embeddings. If None, reads from environment

**Returns**: `TestSuiteResult` - Aggregated test results with metrics

**Raises**:
- `ValueError`: If test_cases is empty or collection doesn't exist
- `RuntimeError`: If critical test infrastructure fails

**Side Effects**:
- Updates `status` field of each TestCase
- Logs test execution details
- Measures performance metrics

**Example**:
```python
from retrieve import run_test_suite, TestCase

# Define test cases
test_cases = [
    TestCase(
        name="test_ros2_query",
        query_text="What is ROS 2?",
        collection_name="textbook_embeddings",
        expected_doc_ids=["doc_ros2_intro"],
        expected_keywords=["ROS 2", "robot"],
        relevance_threshold=0.7,
        top_k=5
    ),
    TestCase(
        name="test_gazebo_query",
        query_text="How does Gazebo simulation work?",
        collection_name="textbook_embeddings",
        expected_doc_ids=["doc_gazebo_intro"],
        expected_keywords=["Gazebo", "simulation"],
        relevance_threshold=0.7,
        top_k=5
    )
]

# Run test suite
results = run_test_suite(
    client=client,
    collection_name="textbook_embeddings",
    test_cases=test_cases
)

# Print summary
print(f"Total Tests: {results.total_tests}")
print(f"Passed: {results.passed}")
print(f"Failed: {results.failed}")
print(f"Pass Rate: {results.pass_rate:.1f}%")
print(f"Avg Retrieval Time: {results.performance_metrics['avg_retrieval_time_ms']:.2f}ms")
```

---

## CLI Interface (Optional)

**Command**: `python retrieve.py [options]`

**Options**:
- `--collection NAME`: Collection name to test (default: reads from .env or prompts)
- `--query TEXT`: Single query to test
- `--test-suite FILE`: Path to JSON file with test cases
- `--top-k N`: Number of results to retrieve (default: 10)
- `--threshold SCORE`: Minimum similarity threshold (0.0-1.0)
- `--benchmark`: Run performance benchmarks
- `--validate`: Validate collection only (no queries)

**Examples**:

```bash
# Validate collection
python retrieve.py --collection textbook_embeddings --validate

# Single query test
python retrieve.py --collection textbook_embeddings --query "What is ROS 2?" --top-k 5

# Run test suite from file
python retrieve.py --test-suite tests/fixtures/query_test_cases.json

# Run with benchmark
python retrieve.py --test-suite tests/fixtures/query_test_cases.json --benchmark
```

---

## Error Handling Contract

### Error Types

**ConnectionError**: Qdrant connection failures
- **Message Format**: `"Failed to connect to Qdrant at {url}: {error}"`
- **Recovery**: Verify QDRANT_URL and QDRANT_API_KEY in .env

**ValueError**: Invalid parameters or data
- **Message Format**: `"{parameter} is invalid: {reason}"`
- **Examples**:
  - `"query_vector dimensions (512) don't match collection (1024)"`
  - `"Collection 'invalid_name' does not exist. Available: ['textbook_embeddings', 'test_collection']"`

**RuntimeError**: Operational failures
- **Message Format**: `"Operation failed: {operation}: {error}"`
- **Examples**:
  - `"Cohere embedding generation failed: API rate limit exceeded"`
  - `"Search timeout exceeded (10.0s)"`

### Error Response Structure

All errors should include:
- Clear error message
- Context (which operation failed, with what parameters)
- Suggested remediation steps

**Example**:
```python
try:
    results = similarity_search(client, "invalid_collection", query_vector)
except ValueError as e:
    print(e)
    # Output: Collection 'invalid_collection' does not exist.
    #         Available collections: ['textbook_embeddings', 'test_collection']
    #         Suggestion: Verify collection name or create collection first.
```

---

## Performance Contracts

### Latency Targets

- `retrieve_by_id()`: <100ms (collections up to 10K vectors)
- `similarity_search()`: <500ms (top-10, collections up to 100K vectors)
- `generate_query_embedding()`: <2000ms (Cohere API latency)
- `validate_collection()`: <50ms

### Timeout Handling

- Qdrant operations: 10.0s timeout (configurable)
- Cohere API calls: 30.0s timeout
- Test suite execution: No timeout (may run long for large suites)

---

## Logging Contract

**Log Level**: INFO (default), configurable via LOG_LEVEL environment variable

**Log Format**:
```
%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

**Log Destinations**:
- Console (stdout)
- File: `retrieval_test.log`

**Logged Events**:
- Connection establishment/failure
- Query execution start/completion with timing
- Test case execution results
- Error conditions with stack traces
- Performance metrics

**Example Logs**:
```
2025-12-12 14:30:00 - retrieve - INFO - Connected to Qdrant at https://qdrant.example.com
2025-12-12 14:30:01 - retrieve - INFO - Validating collection 'textbook_embeddings': 5432 points
2025-12-12 14:30:02 - retrieve - INFO - Generating query embedding for: "What is ROS 2?"
2025-12-12 14:30:04 - retrieve - INFO - Similarity search completed in 234.5ms, returned 10 results
2025-12-12 14:30:04 - retrieve - INFO - Test 'test_ros2_query': PASSED (relevance: 0.89 > 0.70)
```

---

## Testing Contract

### Unit Tests (tests/test_retrieve.py)

Test individual functions in isolation:
- `test_connect_qdrant()`: Connection establishment
- `test_retrieve_by_id()`: ID-based retrieval
- `test_similarity_search()`: Similarity search
- `test_generate_query_embedding()`: Embedding generation
- `test_validate_collection()`: Collection validation

### Integration Tests (tests/test_similarity.py)

Test full workflows:
- `test_end_to_end_retrieval()`: Query text → embedding → search → results
- `test_test_suite_execution()`: Full test suite run
- `test_error_handling()`: Error scenarios

### Fixtures (tests/fixtures/)

- `sample_embeddings.json`: Known test embeddings
- `query_test_cases.json`: Predefined test cases
- `conftest.py`: Pytest fixtures for test setup

---

## Versioning and Compatibility

**Version**: 1.0.0
**Python**: >= 3.11
**Dependencies**:
- qdrant-client >= 1.8.0
- cohere >= 4.9.0
- python-dotenv >= 1.0.0
- pytest >= 7.4.0

**Breaking Changes**: None (initial version)

**Backwards Compatibility**: N/A (new module)

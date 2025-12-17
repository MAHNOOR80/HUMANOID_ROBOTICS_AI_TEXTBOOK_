# Research: Retrieval Pipeline Testing

**Feature**: 003-retrieval-pipeline-test
**Date**: 2025-12-12
**Purpose**: Technical research to resolve unknowns and establish implementation patterns

## Research Questions & Findings

### 1. Qdrant Query API Methods and Parameters

**Question**: What are the exact methods and parameters for retrieval operations in Qdrant Python client?

**Findings**:

#### Retrieve by ID
```python
from qdrant_client import QdrantClient

# Method: retrieve()
results = client.retrieve(
    collection_name="my_collection",
    ids=[uuid1, uuid2, uuid3],  # List of point IDs (UUID or int)
    with_vectors=True,           # Include vector data in response
    with_payload=True            # Include payload/metadata
)
```

**Key Parameters**:
- `collection_name` (str): Target collection name
- `ids` (List[Union[str, int]]): Point IDs to retrieve
- `with_vectors` (bool): Include vector data (default: False)
- `with_payload` (bool, Union[list, PayloadSelector]): Include/select payload fields

**Return Type**: List[Record] - Each record contains id, vector (optional), payload (optional)

#### Similarity Search
```python
# Method: search()
results = client.search(
    collection_name="my_collection",
    query_vector=[0.1, 0.2, ...],  # Query embedding vector
    limit=10,                       # Top-k results (default: 10)
    score_threshold=0.7,           # Minimum similarity score
    query_filter=Filter(...),      # Metadata filters
    with_vectors=True,             # Include vectors in results
    with_payload=True              # Include payload/metadata
)
```

**Key Parameters**:
- `collection_name` (str): Target collection
- `query_vector` (List[float]): Query embedding (must match collection dimension)
- `limit` (int): Maximum number of results (top-k)
- `score_threshold` (float, optional): Minimum similarity score filter
- `query_filter` (Filter, optional): Metadata-based filtering
- `with_vectors` (bool): Include vector data
- `with_payload` (bool, PayloadSelector): Include payload

**Return Type**: List[ScoredPoint] - Each point contains id, score, vector (optional), payload (optional)

#### Batch Operations
```python
# Method: scroll() - Efficient batch retrieval
records, next_page_offset = client.scroll(
    collection_name="my_collection",
    limit=100,                   # Points per batch
    with_vectors=True,
    with_payload=True,
    offset=None                  # Pagination offset (use next_page_offset for next batch)
)
```

**Use Case**: Efficient iteration over large collections without loading all points at once.

**Decision**: Use `retrieve()` for ID-based access, `search()` for similarity queries, and `scroll()` for batch validation in end-to-end tests.

**Rationale**: These are the primary Qdrant client methods designed for retrieval use cases. They provide clean, type-safe APIs with flexible parameters.

### 2. Cohere Embedding Generation for Query Vectors

**Question**: How to generate query embeddings compatible with stored embeddings from the 001-embedding-pipeline?

**Findings**:

#### Model Consistency
From `main.py` (001-embedding-pipeline):
```python
response = cohere_client.embed(
    texts=[text],
    model="embed-multilingual-v3.0",
    input_type="search_document",
    embedding_types=["float"]
)
```

**For Query Embeddings**:
```python
import cohere

co = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))

# Use input_type="search_query" for queries (not "search_document")
response = co.embed(
    texts=[query_text],
    model="embed-multilingual-v3.0",  # MUST match storage model
    input_type="search_query",         # Different from storage!
    embedding_types=["float"]
)

query_vector = response.embeddings[0]  # 1024-dimensional vector
```

**Critical Details**:
- **Model**: Must use same model (`embed-multilingual-v3.0`) as storage pipeline
- **Input Type**: Use `"search_query"` for queries vs `"search_document"` for documents
- **Dimensions**: Cohere embed-multilingual-v3.0 produces 1024-dimensional vectors
- **Embedding Type**: Use `"float"` for compatibility

**Decision**: Implement `generate_query_embedding()` function using Cohere client with `input_type="search_query"` and `model="embed-multilingual-v3.0"`.

**Rationale**: Cohere's embedding model is optimized for asymmetric search when using different input types for documents vs queries. This improves retrieval relevance.

**Alternative Considered**: Reusing stored document embeddings as queries. Rejected because using proper query embeddings improves semantic search quality.

### 3. Testing Patterns for Vector Retrieval

**Question**: What are best practices for testing vector retrieval systems?

**Findings**:

#### Fixture Design
```python
# tests/fixtures/sample_embeddings.json
{
  "test_collection": "test_retrieval_pipeline",
  "points": [
    {
      "id": "doc_001",
      "vector": [0.1, 0.2, ..., 0.5],  # Known embedding
      "payload": {
        "content": "ROS 2 is a robot operating system",
        "source_url": "https://example.com/ros2",
        "chunk_id": 1
      }
    },
    ...
  ],
  "query_test_cases": [
    {
      "query_text": "What is ROS 2?",
      "expected_doc_ids": ["doc_001", "doc_005"],
      "relevance_threshold": 0.7
    }
  ]
}
```

**Pattern**: Create small test collection with known embeddings and query-document pairs for validation.

#### Relevance Validation Strategies

1. **Known Query-Document Pairs**: Validate that expected documents appear in top-k results
2. **Similarity Score Thresholds**: Ensure relevant results exceed minimum score threshold
3. **Ranking Quality**: Verify that more relevant results rank higher
4. **Negative Cases**: Confirm irrelevant documents score below threshold

#### Performance Benchmarking

```python
import time

def benchmark_retrieval(client, collection_name, iterations=10):
    """Measure retrieval performance over multiple iterations."""
    timings = []
    for _ in range(iterations):
        start = time.perf_counter()
        results = client.retrieve(collection_name, ids=[test_id])
        end = time.perf_counter()
        timings.append((end - start) * 1000)  # Convert to ms

    return {
        'avg_ms': sum(timings) / len(timings),
        'min_ms': min(timings),
        'max_ms': max(timings),
        'p95_ms': sorted(timings)[int(len(timings) * 0.95)]
    }
```

**Decision**: Use pytest fixtures for test data, implement relevance validation with known pairs, and benchmark performance with timing measurements.

**Rationale**: This approach provides reproducible, quantifiable test results that validate both correctness and performance.

### 4. Error Handling and Edge Cases

**Question**: What error scenarios must be handled comprehensively?

**Findings**:

#### Network Failures and Timeouts

```python
from qdrant_client.http.exceptions import UnexpectedResponse, ResponseHandlingException

try:
    client = QdrantClient(
        url=qdrant_url,
        api_key=api_key,
        timeout=10.0  # Set timeout to prevent hanging
    )
except (UnexpectedResponse, ResponseHandlingException) as e:
    # Handle connection failures
    logger.error(f"Failed to connect to Qdrant: {e}")
    raise ConnectionError(f"Qdrant connection failed: {e}")
```

#### Empty Collection Handling

```python
try:
    collection_info = client.get_collection(collection_name)
    if collection_info.points_count == 0:
        logger.warning(f"Collection '{collection_name}' is empty")
        return []  # Return empty results, not error
except Exception as e:
    logger.error(f"Collection '{collection_name}' not found: {e}")
    raise ValueError(f"Collection does not exist: {collection_name}")
```

#### Dimension Mismatch Errors

```python
def validate_query_vector(client, collection_name, query_vector):
    """Validate query vector dimensions match collection."""
    collection_info = client.get_collection(collection_name)
    expected_dim = collection_info.config.params.vectors.size
    actual_dim = len(query_vector)

    if actual_dim != expected_dim:
        raise ValueError(
            f"Query vector dimension mismatch: "
            f"expected {expected_dim}, got {actual_dim}"
        )
```

#### Invalid Filter Syntax

```python
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

try:
    # Valid filter construction
    query_filter = Filter(
        must=[
            FieldCondition(
                key="source_url",
                match=MatchValue(value="https://example.com")
            )
        ]
    )
    results = client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        query_filter=query_filter
    )
except Exception as e:
    logger.error(f"Invalid filter: {e}")
    raise ValueError(f"Filter syntax error: {e}")
```

**Decision**: Implement comprehensive error handling with specific exception types, validation checks before operations, and clear error messages for debugging.

**Rationale**: Clear error handling improves debuggability and provides better user experience when testing fails.

**Edge Cases Catalog**:
1. Empty collection → Return empty list with warning
2. Collection not found → Raise ValueError with available collections
3. Network timeout → Raise ConnectionError with retry suggestion
4. Dimension mismatch → Raise ValueError with expected vs actual dimensions
5. Invalid ID → Return empty list or raise ValueError based on context
6. Invalid filter syntax → Raise ValueError with filter construction guidance

## Technology Stack Summary

### Core Dependencies (Already in pyproject.toml)

- **qdrant-client>=1.8.0**: Vector database client
  - Methods: retrieve(), search(), scroll(), get_collection()
  - Exception handling: UnexpectedResponse, ResponseHandlingException

- **cohere>=4.9.0**: Embedding generation
  - Model: embed-multilingual-v3.0
  - Input types: search_query (queries), search_document (storage)
  - Output: 1024-dimensional float vectors

- **python-dotenv>=1.0.0**: Configuration management
  - Environment variables: QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY

- **pytest>=7.4.0**: Test framework
  - Features: fixtures, parametrize, benchmarking

### Configuration (from .env)

```
QDRANT_URL=https://0718a00f-1407-4b66-98b3-5c5a37fe3e1a.europe-west3-0.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=<api_key>
COHERE_API_KEY=<api_key>
```

## Implementation Patterns from Existing Code

### From test_qdrant_connection.py

```python
# Connection pattern
client = QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key,
    timeout=10.0
)

# Collection validation pattern
collection_info = client.get_collection(collection_name)
print(f"Collection has {collection_info.points_count} points")
```

### From main.py

```python
# Logging pattern
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('retrieval_test.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Timing decorator pattern
def timing_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.debug(f"{func.__name__} executed in {end_time - start_time:.4f}s")
        return result
    return wrapper
```

## Recommendations for Implementation

1. **Reuse Existing Patterns**: Adopt connection, logging, and timing patterns from existing code
2. **Type Safety**: Use type hints for all function signatures (already demonstrated in plan)
3. **Error Messages**: Provide actionable error messages with suggested fixes
4. **Logging**: Log all operations with timing for debugging and performance analysis
5. **Validation**: Validate inputs before expensive operations (embeddings, searches)
6. **Testing**: Use pytest fixtures for reproducible test data and scenarios

## Open Questions (Resolved)

All research questions have been addressed with concrete findings and implementation decisions.

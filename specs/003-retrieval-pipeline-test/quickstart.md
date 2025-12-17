# Quickstart Guide: Retrieval Pipeline Testing

**Module**: retrieve.py
**Purpose**: Test and validate Qdrant retrieval functionality
**Audience**: Developers validating backend RAG retrieval flow

## Prerequisites

1. **Python Environment**: Python 3.11 or higher
2. **Dependencies**: Installed via `uv` or `pip` (already in pyproject.toml)
3. **Qdrant Instance**: Running and accessible (cloud or local)
4. **Embeddings**: Collection with embeddings from 001-embedding-pipeline
5. **API Keys**: Cohere API key for query embeddings

## Setup

### 1. Verify Environment Configuration

Check that your `.env` file contains:

```bash
# Qdrant Configuration
QDRANT_URL=https://your-qdrant-instance.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key

# Cohere API Configuration
COHERE_API_KEY=your-cohere-api-key
```

### 2. Verify Dependencies

All required dependencies are already in `pyproject.toml`:

```bash
# Check dependencies are installed
python -c "import qdrant_client, cohere, dotenv; print('Dependencies OK')"
```

If dependencies are missing:

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install qdrant-client cohere python-dotenv pytest
```

### 3. Verify Qdrant Connection

Run the existing connection test:

```bash
python test_qdrant_connection.py
```

Expected output:
```
Testing Qdrant connection...
QDRANT_URL: https://...
[OK] Successfully connected to Qdrant
[OK] Found N existing collections
  - textbook_embeddings: X points
...
```

## Basic Usage

### Example 1: Validate Collection

```python
from retrieve import connect_qdrant, validate_collection

# Connect to Qdrant
client = connect_qdrant()

# Validate collection exists and get metadata
collection_info = validate_collection(client, "textbook_embeddings")

print(f"Collection: {collection_info['name']}")
print(f"Total Points: {collection_info['points_count']}")
print(f"Vector Size: {collection_info['vector_size']} dimensions")
print(f"Distance Metric: {collection_info['distance_metric']}")
```

### Example 2: Retrieve Embeddings by ID

```python
from retrieve import connect_qdrant, retrieve_by_id

# Connect
client = connect_qdrant()

# Retrieve specific points by ID
results = retrieve_by_id(
    client=client,
    collection_name="textbook_embeddings",
    point_ids=["doc_001", "doc_002"],
    with_payload=True
)

# Display results
for result in results:
    print(f"\nID: {result.id}")
    print(f"Content: {result.payload['content'][:100]}...")
    print(f"Source: {result.payload['source_url']}")
    print(f"Retrieval Time: {result.retrieval_time_ms:.2f}ms")
```

### Example 3: Semantic Similarity Search

```python
from retrieve import connect_qdrant, generate_query_embedding, similarity_search

# Connect
client = connect_qdrant()

# Generate query embedding
query_text = "What is ROS 2 and how does it work?"
query_vector = generate_query_embedding(query_text)

# Perform similarity search
results = similarity_search(
    client=client,
    collection_name="textbook_embeddings",
    query_vector=query_vector,
    top_k=5,
    score_threshold=0.7
)

# Display ranked results
print(f"\nQuery: {query_text}\n")
print(f"Found {len(results)} relevant results:\n")

for rank, result in enumerate(results, 1):
    print(f"--- Rank {rank} (Score: {result.score:.3f}) ---")
    print(f"Source: {result.payload['source_url']}")
    print(f"Content: {result.payload['content'][:200]}...")
    print(f"Retrieval Time: {result.retrieval_time_ms:.2f}ms\n")
```

### Example 4: Search with Metadata Filters

```python
from retrieve import connect_qdrant, generate_query_embedding, similarity_search

client = connect_qdrant()
query_vector = generate_query_embedding("Explain Gazebo simulation")

# Search only in specific source URLs
results = similarity_search(
    client=client,
    collection_name="textbook_embeddings",
    query_vector=query_vector,
    top_k=10,
    filters={"source_url": "https://example.com/chapter3"}
)

print(f"Found {len(results)} results in filtered scope")
```

## Running Test Suites

### Example 5: Execute Test Cases

```python
from retrieve import connect_qdrant, run_test_suite, TestCase, TestStatus

# Connect
client = connect_qdrant()

# Define test cases
test_cases = [
    TestCase(
        name="test_ros2_basics",
        query_text="What is ROS 2?",
        collection_name="textbook_embeddings",
        expected_doc_ids=["doc_ros2_intro"],
        expected_keywords=["ROS 2", "robot", "operating system"],
        relevance_threshold=0.7,
        top_k=5,
        status=TestStatus.PENDING
    ),
    TestCase(
        name="test_gazebo_simulation",
        query_text="How does Gazebo work?",
        collection_name="textbook_embeddings",
        expected_doc_ids=["doc_gazebo_intro"],
        expected_keywords=["Gazebo", "simulation", "physics"],
        relevance_threshold=0.7,
        top_k=5,
        status=TestStatus.PENDING
    )
]

# Run test suite
suite_results = run_test_suite(
    client=client,
    collection_name="textbook_embeddings",
    test_cases=test_cases
)

# Print summary
print("\n=== Test Suite Results ===")
print(f"Total Tests: {suite_results.total_tests}")
print(f"Passed: {suite_results.passed}")
print(f"Failed: {suite_results.failed}")
print(f"Errors: {suite_results.errors}")
print(f"Pass Rate: {suite_results.pass_rate:.1f}%")
print(f"\n=== Performance Metrics ===")
print(f"Avg Retrieval Time: {suite_results.performance_metrics['avg_retrieval_time_ms']:.2f}ms")
print(f"P95 Retrieval Time: {suite_results.performance_metrics['p95_retrieval_time_ms']:.2f}ms")
print(f"Max Retrieval Time: {suite_results.performance_metrics['max_retrieval_time_ms']:.2f}ms")

# Print individual test results
print("\n=== Individual Test Results ===")
for test in suite_results.test_results:
    status_icon = "✅" if test.status == TestStatus.PASSED else "❌"
    print(f"{status_icon} {test.name}: {test.status.value}")
    if test.error_message:
        print(f"   Error: {test.error_message}")
```

## Command-Line Usage (Optional)

If CLI interface is implemented:

### Validate Collection

```bash
python retrieve.py --collection textbook_embeddings --validate
```

### Single Query Test

```bash
python retrieve.py \
  --collection textbook_embeddings \
  --query "What is ROS 2?" \
  --top-k 5 \
  --threshold 0.7
```

### Run Test Suite from File

```bash
python retrieve.py --test-suite tests/fixtures/query_test_cases.json
```

### Benchmark Performance

```bash
python retrieve.py \
  --test-suite tests/fixtures/query_test_cases.json \
  --benchmark
```

## Common Tasks

### Task 1: Verify Embeddings Are Stored Correctly

```python
from retrieve import connect_qdrant, validate_collection

client = connect_qdrant()
info = validate_collection(client, "textbook_embeddings")

if info['points_count'] == 0:
    print("⚠️  Collection is empty! Run embedding pipeline first.")
else:
    print(f"✅ Collection has {info['points_count']} embeddings")
    print(f"   Vector dimensions: {info['vector_size']}")
    print(f"   Distance metric: {info['distance_metric']}")
```

### Task 2: Test Query Relevance

```python
from retrieve import connect_qdrant, generate_query_embedding, similarity_search

client = connect_qdrant()

# Test a specific query
query = "Explain the ROS 2 architecture"
query_vector = generate_query_embedding(query)

results = similarity_search(
    client=client,
    collection_name="textbook_embeddings",
    query_vector=query_vector,
    top_k=3
)

print(f"Query: {query}\n")
print("Top 3 Results:")
for i, result in enumerate(results, 1):
    print(f"\n{i}. Score: {result.score:.3f}")
    print(f"   Content: {result.payload['content'][:150]}...")

    # Check if result is relevant
    if result.score >= 0.7:
        print("   ✅ RELEVANT (score >= 0.7)")
    else:
        print("   ⚠️  LOW RELEVANCE (score < 0.7)")
```

### Task 3: Performance Benchmarking

```python
import time
from retrieve import connect_qdrant, generate_query_embedding, similarity_search

client = connect_qdrant()

# Test queries
queries = [
    "What is ROS 2?",
    "How does Gazebo simulation work?",
    "Explain NVIDIA Isaac Sim",
    "What are VLA models?",
    "Describe humanoid robot locomotion"
]

# Benchmark
print("Running performance benchmark...")
timings = []

for query in queries:
    query_vector = generate_query_embedding(query)

    start = time.perf_counter()
    results = similarity_search(
        client=client,
        collection_name="textbook_embeddings",
        query_vector=query_vector,
        top_k=10
    )
    end = time.perf_counter()

    latency_ms = (end - start) * 1000
    timings.append(latency_ms)
    print(f"  {query[:40]}: {latency_ms:.2f}ms")

# Calculate statistics
avg_ms = sum(timings) / len(timings)
min_ms = min(timings)
max_ms = max(timings)
p95_ms = sorted(timings)[int(len(timings) * 0.95)]

print(f"\n=== Benchmark Results ===")
print(f"Queries: {len(queries)}")
print(f"Avg Latency: {avg_ms:.2f}ms")
print(f"Min Latency: {min_ms:.2f}ms")
print(f"Max Latency: {max_ms:.2f}ms")
print(f"P95 Latency: {p95_ms:.2f}ms")

# Validate against success criteria
if avg_ms < 500:
    print("✅ PASS: Avg latency < 500ms (SC-002)")
else:
    print("❌ FAIL: Avg latency >= 500ms (SC-002)")
```

## Troubleshooting

### Problem: "Failed to connect to Qdrant"

**Solution**:
1. Verify QDRANT_URL in .env is correct
2. Check QDRANT_API_KEY is valid
3. Ensure Qdrant instance is running and accessible
4. Test with: `python test_qdrant_connection.py`

### Problem: "Collection not found"

**Solution**:
1. List available collections:
   ```python
   client = connect_qdrant()
   collections = client.get_collections()
   for col in collections.collections:
       print(col.name)
   ```
2. Create collection using embedding pipeline: `python main.py --url <url> --collection-name <name>`

### Problem: "Query vector dimensions don't match collection"

**Solution**:
1. Verify you're using the same embedding model:
   - Collection uses: `embed-multilingual-v3.0` (1024 dimensions)
   - Query must use same model
2. Check query embedding generation:
   ```python
   vector = generate_query_embedding("test query")
   print(f"Query vector dimensions: {len(vector)}")
   # Should output: Query vector dimensions: 1024
   ```

### Problem: "Low relevance scores (all results < 0.5)"

**Possible Causes**:
1. Query is too generic or unrelated to collection content
2. Collection contains embeddings from different domain
3. Embedding model mismatch

**Solution**:
1. Verify collection content matches query domain
2. Try more specific queries
3. Check a known-good query:
   ```python
   # Get a document from collection
   sample = retrieve_by_id(client, "textbook_embeddings", ["doc_001"])

   # Use its content as a query (should get very high score)
   query_vector = generate_query_embedding(sample[0].payload['content'][:200])
   results = similarity_search(client, "textbook_embeddings", query_vector, top_k=1)

   print(f"Self-similarity score: {results[0].score}")
   # Should be very high (>0.9)
   ```

### Problem: "Slow retrieval performance (>500ms)"

**Possible Causes**:
1. Network latency to cloud Qdrant instance
2. Large result sets (top_k > 100)
3. Complex filters

**Solution**:
1. Check network latency: `ping your-qdrant-instance.com`
2. Reduce top_k to <= 100
3. Simplify filters or create indexes in Qdrant

## Next Steps

1. **Implement retrieve.py**: Follow the API contract in `contracts/retrieve_api.md`
2. **Write Tests**: Create pytest tests in `tests/test_retrieve.py`
3. **Create Fixtures**: Prepare test data in `tests/fixtures/`
4. **Run Validation**: Execute test suite against live collection
5. **Benchmark**: Measure performance against success criteria (SC-001, SC-002)

## Reference

- **Specification**: `specs/003-retrieval-pipeline-test/spec.md`
- **Implementation Plan**: `specs/003-retrieval-pipeline-test/plan.md`
- **Data Model**: `specs/003-retrieval-pipeline-test/data-model.md`
- **API Contract**: `specs/003-retrieval-pipeline-test/contracts/retrieve_api.md`
- **Qdrant Docs**: https://qdrant.tech/documentation/
- **Cohere Docs**: https://docs.cohere.com/docs/embeddings

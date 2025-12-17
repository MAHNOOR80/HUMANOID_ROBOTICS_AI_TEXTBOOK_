# Quickstart: Retrieval-Enabled Agent

**Feature**: 004-retrieval-agent
**Created**: 2025-12-12

## Overview

The Retrieval-Enabled Agent is an OpenAI-based system that retrieves information from a Qdrant vector database containing embedded humanoid robotics textbook content. It answers user questions using only the retrieved context, ensuring grounded responses with proper source attribution.

## Prerequisites

1. **Environment Setup**:
   - Python 3.9+
   - OpenAI API key
   - Cohere API key
   - Qdrant URL and API key
   - Qdrant collection with embedded textbook content

2. **Required Environment Variables** (in `.env` file):
   ```bash
   OPENAI_API_KEY="your_openai_api_key"
   COHERE_API_KEY="your_cohere_api_key"
   QDRANT_URL="your_qdrant_url"
   QDRANT_API_KEY="your_qdrant_api_key"
   QDRANT_COLLECTION_NAME="your_collection_name"
   ```

## Installation

1. **Install Dependencies**:
   ```bash
   pip install openai cohere qdrant-client python-dotenv
   ```

2. **Create Agent File**:
   The agent implementation is in `agent.py` in the root directory.

## Usage

### Basic Usage

```python
from agent import RetrievalAgent

# Initialize the agent
agent = RetrievalAgent()

# Ask a question
response = agent.query("What is inverse kinematics in humanoid robotics?")

# Print the answer
print(response.answer)
print(f"Confidence: {response.confidence.overall:.2f}")
print(f"Sources: {len(response.sources)} chunks")
```

### Advanced Usage with Parameters

```python
from agent import RetrievalAgent

# Initialize the agent with custom parameters
agent = RetrievalAgent(
    model="gpt-4-turbo-preview",
    temperature=0.2,
    top_k=5,
    score_threshold=0.7
)

# Query with custom parameters
response = agent.query(
    query="What are the key challenges in humanoid locomotion?",
    top_k=7,  # Retrieve more chunks for complex questions
    score_threshold=0.6  # Lower threshold for broader search
)

# Process the response
if response.status == "success":
    print(f"Answer: {response.answer}")
    print(f"Confidence: {response.confidence.level}")

    # Print source information
    for source in response.sources:
        print(f"Source {source.citation_index}: {source.metadata.section_title}")
        print(f"  Relevance: {source.relevance_score:.2f}")
        print(f"  Page: {source.metadata.page_number}")
        print(f"  Excerpt: {source.excerpt[:100]}...")
else:
    print(f"Query failed: {response.error_message}")
```

### Response Structure

The agent returns a structured `AgentResponse` object with:

- `status`: "success", "insufficient_context", or "error"
- `answer`: The generated answer (None if status is not "success")
- `confidence`: Multi-factor confidence score with overall assessment
- `sources`: List of source references with citations
- `metadata`: Generation metadata including timing and model used

### Example Response

```python
{
    "status": "success",
    "answer": "Inverse kinematics (IK) is the mathematical process of calculating the variable joint parameters needed to place the end of a kinematic chain, such as a robot manipulator, in a desired position and orientation [1]. In humanoid robotics, IK is essential for computing joint angles that achieve specific end-effector poses [2].",
    "confidence": {
        "overall": 0.87,
        "level": "high"
    },
    "sources": [
        {
            "chunk_id": "chunk_1234",
            "citation_index": 1,
            "relevance_score": 0.89,
            "metadata": {
                "page_number": 42,
                "section_title": "Inverse Kinematics Fundamentals"
            }
        }
    ],
    "metadata": {
        "model": "gpt-4-turbo-preview",
        "total_time_ms": 1850.5,
        "retrieval_time_ms": 245.3,
        "generation_time_ms": 1605.2
    }
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM calls | Required |
| `COHERE_API_KEY` | Cohere API key for embeddings | Required |
| `QDRANT_URL` | Qdrant vector database URL | Required |
| `QDRANT_API_KEY` | Qdrant API key for authentication | Required |
| `QDRANT_COLLECTION_NAME` | Name of the collection with textbook embeddings | Required |
| `QDRANT_TIMEOUT` | Connection timeout in seconds | 10.0 |

### Agent Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `model` | OpenAI model to use for generation | "gpt-4-turbo-preview" |
| `temperature` | Generation temperature (0.1-0.3 for factual responses) | 0.2 |
| `top_k` | Maximum number of chunks to retrieve | 5 |
| `score_threshold` | Minimum similarity score for retrieved chunks | 0.7 |

## Error Handling

The agent handles various error scenarios:

- **Insufficient Context**: When no chunks meet the similarity threshold, returns status "insufficient_context" with helpful message
- **Qdrant Connection Errors**: Returns status "error" with connection failure details
- **Embedding Generation Errors**: Returns status "error" when Cohere API fails
- **OpenAI API Errors**: Returns status "error" when generation fails

## Development

### Running Tests

```bash
python -m pytest tests/test_agent.py
```

### Running the Agent Directly

```bash
python agent.py --query "Your question here"
```

### Debug Mode

Set `DEBUG=1` in environment variables to enable detailed logging:

```bash
DEBUG=1 python agent.py --query "What is inverse kinematics?"
```

## Performance Considerations

- **Retrieval Time**: Typically 200-500ms depending on collection size
- **Generation Time**: Typically 1000-3000ms depending on answer length
- **Total Response Time**: Typically 1500-3500ms for complete flow
- **Similarity Threshold**: Higher values (0.7+) provide more relevant results but may return fewer chunks
- **Top-K Parameter**: Higher values provide more context but increase token usage and generation time

## Best Practices

1. **For Complex Questions**: Increase `top_k` to 7-10 to provide more context
2. **For Precision**: Increase `score_threshold` to 0.8-0.9 for higher relevance
3. **For Speed**: Lower `top_k` and use faster models like "gpt-3.5-turbo"
4. **For Accuracy**: Use lower `temperature` (0.1-0.2) and verify sources in responses

## Troubleshooting

### Common Issues

1. **"No results found"**: Try lowering the `score_threshold` parameter
2. **Slow responses**: Check Qdrant connection and consider reducing `top_k`
3. **Low confidence answers**: Verify that the Qdrant collection contains relevant content
4. **API errors**: Check that all API keys are valid and properly formatted

### Debugging Steps

1. Verify environment variables are set correctly
2. Test Qdrant connection independently
3. Check that the collection name exists and contains embeddings
4. Validate that Cohere embeddings match the stored format (1024-dim embed-english-v3.0)

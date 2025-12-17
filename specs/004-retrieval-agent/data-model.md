# Data Model: Retrieval-Enabled Agent

**Feature**: 004-retrieval-agent
**Created**: 2025-12-12
**Status**: Draft

## Overview

This document defines the core data entities for the Retrieval-Enabled Agent system. These entities represent the flow from user query through retrieval to grounded response generation.

## Core Entities

### 1. Query

**Purpose**: Represents a user's natural language question about humanoid robotics topics.

**Attributes**:
```python
@dataclass
class Query:
    text: str                          # The natural language query text
    timestamp: datetime                # When the query was submitted
    query_id: str                      # Unique identifier for the query
    metadata: Optional[Dict[str, Any]] # Optional metadata (user_id, session_id, etc.)
```

**Validation Rules**:
- `text` must be non-empty string
- `text` length should be between 1-500 characters
- `timestamp` defaults to current UTC time
- `query_id` auto-generated using UUID4

**Example**:
```python
Query(
    text="What is inverse kinematics in humanoid robotics?",
    timestamp=datetime(2025, 12, 12, 10, 30, 0),
    query_id="550e8400-e29b-41d4-a716-446655440000",
    metadata={"session_id": "abc123"}
)
```

---

### 2. TextChunk

**Purpose**: Represents a segment of the embedded textbook content stored in Qdrant vector database.

**Attributes**:
```python
@dataclass
class TextChunk:
    chunk_id: Union[str, int]          # Unique identifier from Qdrant
    text: str                          # The actual text content of the chunk
    vector: Optional[List[float]]      # 1024-dim Cohere embedding (optional in retrieval)
    metadata: ChunkMetadata            # Source metadata from the textbook
    similarity_score: Optional[float]  # Cosine similarity score (when retrieved)
```

**ChunkMetadata**:
```python
@dataclass
class ChunkMetadata:
    page_number: Optional[int]         # Page number in original textbook
    section_title: Optional[str]       # Section or chapter title
    chapter: Optional[str]             # Chapter name
    url: Optional[str]                 # Source URL from the textbook website
    chunk_index: Optional[int]         # Sequential index of chunk in document
```

**Validation Rules**:
- `chunk_id` must be unique within collection
- `text` must be non-empty
- `vector` has exactly 1024 dimensions when present (Cohere embed-english-v3.0)
- `similarity_score` range: [0.0, 1.0] when present

**Example**:
```python
TextChunk(
    chunk_id="chunk_1234",
    text="Inverse kinematics (IK) is the mathematical process of calculating the variable joint parameters needed to place the end of a kinematic chain...",
    vector=None,  # Excluded from retrieval results to reduce payload size
    metadata=ChunkMetadata(
        page_number=42,
        section_title="Inverse Kinematics Fundamentals",
        chapter="Chapter 3: Motion Control",
        url="https://physical-ai-humanoid-robotics-textb-dun.vercel.app/chapter-3",
        chunk_index=15
    ),
    similarity_score=0.89
)
```

---

### 3. RetrievalResult

**Purpose**: Represents the output from Qdrant semantic search operation.

**Attributes**:
```python
@dataclass
class RetrievalResult:
    query: Query                       # Original query that triggered retrieval
    chunks: List[TextChunk]            # Retrieved chunks ranked by similarity
    retrieval_time_ms: float           # Time taken for retrieval operation
    total_candidates: int              # Total chunks in collection
    filtered_count: int                # Chunks above score_threshold
    parameters: RetrievalParameters    # Search parameters used
```

**RetrievalParameters**:
```python
@dataclass
class RetrievalParameters:
    top_k: int = 5                     # Number of chunks to retrieve
    score_threshold: float = 0.7       # Minimum similarity score
    collection_name: str               # Qdrant collection name
    embedding_model: str = "embed-english-v3.0"  # Cohere model used
```

**Validation Rules**:
- `chunks` list ordered by descending `similarity_score`
- All chunks have `similarity_score >= score_threshold`
- `len(chunks) <= top_k`
- `retrieval_time_ms >= 0`

**Example**:
```python
RetrievalResult(
    query=Query(text="What is inverse kinematics?", ...),
    chunks=[
        TextChunk(chunk_id="chunk_1234", similarity_score=0.89, ...),
        TextChunk(chunk_id="chunk_5678", similarity_score=0.82, ...),
        TextChunk(chunk_id="chunk_9012", similarity_score=0.76, ...)
    ],
    retrieval_time_ms=245.3,
    total_candidates=1500,
    filtered_count=12,
    parameters=RetrievalParameters(
        top_k=5,
        score_threshold=0.7,
        collection_name="humanoid_robotics_textbook",
        embedding_model="embed-english-v3.0"
    )
)
```

---

### 4. AgentResponse

**Purpose**: Represents the structured output from the retrieval agent containing the grounded answer with source attribution.

**Attributes**:
```python
@dataclass
class AgentResponse:
    query_id: str                      # Links back to original Query
    status: ResponseStatus             # Success, insufficient_context, or error
    answer: Optional[str]              # The generated answer (None if status != success)
    confidence: ConfidenceScore        # Multi-factor confidence assessment
    sources: List[SourceReference]     # Citations linking answer to chunks
    metadata: ResponseMetadata         # Generation metadata
    error_message: Optional[str]       # Error details if status == error
```

**ResponseStatus** (Enum):
```python
class ResponseStatus(Enum):
    SUCCESS = "success"                          # Answer generated successfully
    INSUFFICIENT_CONTEXT = "insufficient_context"  # No relevant chunks found
    ERROR = "error"                              # System error occurred
```

**ConfidenceScore**:
```python
@dataclass
class ConfidenceScore:
    retrieval_quality: float           # Max similarity score from retrieval (0-1)
    coverage_score: float              # % of query topics covered (0-1)
    entailment_score: float            # Answer-context entailment (0-1)
    lexical_overlap: float             # Lexical overlap answer/chunks (0-1)

    @property
    def overall(self) -> float:
        """Weighted average of all confidence factors."""
        weights = {
            'retrieval_quality': 0.35,
            'coverage_score': 0.25,
            'entailment_score': 0.25,
            'lexical_overlap': 0.15
        }
        return sum(weights[k] * getattr(self, k) for k in weights)

    @property
    def level(self) -> str:
        """Human-readable confidence level."""
        score = self.overall
        if score >= 0.8: return "high"
        elif score >= 0.6: return "medium"
        else: return "low"
```

**SourceReference**:
```python
@dataclass
class SourceReference:
    chunk_id: Union[str, int]          # References TextChunk.chunk_id
    citation_index: int                # Position in answer (e.g., [1], [2])
    relevance_score: float             # Similarity score from retrieval
    excerpt: str                       # Short excerpt from chunk (for verification)
    metadata: ChunkMetadata            # Full metadata from TextChunk
```

**ResponseMetadata**:
```python
@dataclass
class ResponseMetadata:
    model: str                         # OpenAI model used (e.g., "gpt-4-turbo-preview")
    temperature: float                 # Generation temperature (0.1-0.3)
    total_time_ms: float               # End-to-end response time
    retrieval_time_ms: float           # Time spent on Qdrant retrieval
    generation_time_ms: float          # Time spent on LLM generation
    tokens_used: Optional[int]         # Total tokens consumed
    timestamp: datetime                # Response generation timestamp
```

**Validation Rules**:
- If `status == SUCCESS`, `answer` must be non-None and `len(sources) > 0`
- If `status == INSUFFICIENT_CONTEXT`, `answer` is None and includes helpful message in `error_message`
- If `status == ERROR`, `error_message` must be present
- All `SourceReference.citation_index` must appear in `answer` text as citations
- `confidence.overall` range: [0.0, 1.0]

**Example (Success)**:
```python
AgentResponse(
    query_id="550e8400-e29b-41d4-a716-446655440000",
    status=ResponseStatus.SUCCESS,
    answer="Inverse kinematics (IK) is the mathematical process of calculating the variable joint parameters needed to place the end of a kinematic chain, such as a robot manipulator, in a desired position and orientation [1]. In humanoid robotics, IK is essential for computing joint angles that achieve specific end-effector poses [2].",
    confidence=ConfidenceScore(
        retrieval_quality=0.89,
        coverage_score=0.85,
        entailment_score=0.92,
        lexical_overlap=0.78
    ),  # overall=0.87, level="high"
    sources=[
        SourceReference(
            chunk_id="chunk_1234",
            citation_index=1,
            relevance_score=0.89,
            excerpt="Inverse kinematics (IK) is the mathematical process of calculating...",
            metadata=ChunkMetadata(page_number=42, section_title="IK Fundamentals", ...)
        ),
        SourceReference(
            chunk_id="chunk_5678",
            citation_index=2,
            relevance_score=0.82,
            excerpt="In humanoid robotics, IK is essential for computing joint angles...",
            metadata=ChunkMetadata(page_number=43, section_title="IK Applications", ...)
        )
    ],
    metadata=ResponseMetadata(
        model="gpt-4-turbo-preview",
        temperature=0.2,
        total_time_ms=1850.5,
        retrieval_time_ms=245.3,
        generation_time_ms=1605.2,
        tokens_used=450,
        timestamp=datetime(2025, 12, 12, 10, 30, 2)
    ),
    error_message=None
)
```

**Example (Insufficient Context)**:
```python
AgentResponse(
    query_id="550e8400-e29b-41d4-a716-446655440001",
    status=ResponseStatus.INSUFFICIENT_CONTEXT,
    answer=None,
    confidence=ConfidenceScore(
        retrieval_quality=0.45,  # Below threshold
        coverage_score=0.0,
        entailment_score=0.0,
        lexical_overlap=0.0
    ),  # overall=0.16, level="low"
    sources=[],
    metadata=ResponseMetadata(
        model="gpt-4-turbo-preview",
        temperature=0.2,
        total_time_ms=280.1,
        retrieval_time_ms=280.1,
        generation_time_ms=0.0,
        tokens_used=0,
        timestamp=datetime(2025, 12, 12, 10, 35, 0)
    ),
    error_message="I cannot find sufficient information in the provided textbook content to answer this question. The most relevant chunks found had similarity scores below the 0.7 threshold."
)
```

## Entity Relationships

```
Query (1) ──────> (1) RetrievalResult
                        │
                        │ contains
                        ▼
                  (0..N) TextChunk
                        │
                        │ referenced by
                        ▼
RetrievalResult (1) ──> (1) AgentResponse
                        │
                        │ cites
                        ▼
                  (0..N) SourceReference ──> (1) TextChunk
```

**Flow**:
1. User submits **Query**
2. System generates embedding and searches Qdrant
3. Qdrant returns **RetrievalResult** with ranked **TextChunks**
4. Agent generates **AgentResponse** with answer and **SourceReferences**
5. Each **SourceReference** links back to a **TextChunk** from the retrieval

## Serialization

All entities support JSON serialization for API responses and logging:

```python
# Example JSON serialization of AgentResponse
{
  "query_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "answer": "Inverse kinematics (IK) is the mathematical process...",
  "confidence": {
    "retrieval_quality": 0.89,
    "coverage_score": 0.85,
    "entailment_score": 0.92,
    "lexical_overlap": 0.78,
    "overall": 0.87,
    "level": "high"
  },
  "sources": [
    {
      "chunk_id": "chunk_1234",
      "citation_index": 1,
      "relevance_score": 0.89,
      "excerpt": "Inverse kinematics (IK) is the mathematical process...",
      "metadata": {
        "page_number": 42,
        "section_title": "IK Fundamentals",
        "chapter": "Chapter 3: Motion Control",
        "url": "https://physical-ai-humanoid-robotics-textb-dun.vercel.app/chapter-3",
        "chunk_index": 15
      }
    }
  ],
  "metadata": {
    "model": "gpt-4-turbo-preview",
    "temperature": 0.2,
    "total_time_ms": 1850.5,
    "retrieval_time_ms": 245.3,
    "generation_time_ms": 1605.2,
    "tokens_used": 450,
    "timestamp": "2025-12-12T10:30:02Z"
  },
  "error_message": null
}
```

## Implementation Notes

1. **Type Safety**: Use Python dataclasses with type hints for all entities
2. **Validation**: Implement `__post_init__` validation in dataclasses
3. **Immutability**: Consider using `frozen=True` for immutable entities (Query, TextChunk)
4. **Error Handling**: All entities should handle missing optional fields gracefully
5. **Testing**: Each entity should have unit tests for validation rules and serialization

## Dependencies

- **Python 3.9+**: For dataclasses and type hints
- **datetime**: For timestamp handling
- **typing**: For type annotations (Optional, List, Union, Dict, Any)
- **enum**: For ResponseStatus enum
- **uuid**: For query_id generation

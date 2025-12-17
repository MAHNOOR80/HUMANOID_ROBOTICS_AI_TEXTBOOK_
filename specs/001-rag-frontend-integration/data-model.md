# Data Model: RAG Agent Frontend Integration

**Date**: 2025-12-13
**Feature**: 001-rag-frontend-integration
**Source**: Extracted from spec.md Key Entities section

## Entity Definitions

### 1. QueryRequest (Request Payload)

**Purpose**: User question sent from frontend to backend API

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| text | string | Required, 1-500 chars | The natural language question |
| selected_text | string | Optional, max 2000 chars | Text snippet from page (for selected-text mode) |
| mode | enum | Required, default "full_book" | Query mode: "full_book" or "selected_text" |

**Validation Rules**:
- `text` must not be empty or whitespace-only
- `text` length: 1 ≤ len ≤ 500
- `selected_text` length: len ≤ 2000 (if provided)
- `mode` must be one of: "full_book", "selected_text"
- If `mode` = "selected_text", `selected_text` must be provided

**State Transitions**: N/A (immutable request object)

**Backend Implementation**:
```python
from pydantic import BaseModel, Field, field_validator
from typing import Literal

class QueryRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    selected_text: str | None = Field(None, max_length=2000)
    mode: Literal["full_book", "selected_text"] = "full_book"

    @field_validator('text')
    @classmethod
    def validate_text_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Query text cannot be empty or whitespace')
        return v

    @field_validator('selected_text')
    @classmethod
    def validate_selected_text_mode(cls, v, info):
        if info.data.get('mode') == 'selected_text' and not v:
            raise ValueError('selected_text required when mode is selected_text')
        return v
```

**Frontend Implementation**:
```typescript
interface QueryRequest {
  text: string;
  selected_text?: string;
  mode: 'full_book' | 'selected_text';
}
```

---

### 2. AgentResponse (Response Payload)

**Purpose**: Structured data returned from backend to frontend containing answer and metadata

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| query_id | string | Required, UUID format | Unique identifier linking to original query |
| status | enum | Required | One of: "success", "insufficient_context", "error" |
| answer | string | Required if status="success" | Generated answer text with citations |
| confidence | ConfidenceScore | Required if status="success" | Confidence assessment object |
| sources | SourceReference[] | Required if status="success" | Array of source citations |
| metadata | ResponseMetadata | Optional | Response timing and model info |
| error_message | string | Required if status="error" or "insufficient_context" | Error details |

**Validation Rules**:
- If `status` = "success": `answer`, `confidence`, and `sources` (min 1 item) are required
- If `status` = "conversational": `answer` and `confidence` required, `sources` optional
- If `status` = "insufficient_context": `answer` must be null, `error_message` provided
- If `status` = "error": `answer` must be null, `error_message` provided
- `query_id` must be valid UUID v4 format
- `sources` array must not be empty when status="success"

**State Transitions**: N/A (immutable response object)

**Backend Implementation**:
```python
from dataclasses import dataclass, asdict
from typing import List, Optional
from enum import Enum

class ResponseStatus(Enum):
    SUCCESS = "success"
    CONVERSATIONAL = "conversational"
    INSUFFICIENT_CONTEXT = "insufficient_context"
    ERROR = "error"

@dataclass
class AgentResponse:
    query_id: str
    status: ResponseStatus
    answer: Optional[str] = None
    confidence: Optional['ConfidenceScore'] = None
    sources: List['SourceReference'] = field(default_factory=list)
    metadata: Optional['ResponseMetadata'] = None
    error_message: Optional[str] = None

    def __post_init__(self):
        # Validation logic from agent.py:285-302
        if self.status == ResponseStatus.SUCCESS:
            if self.answer is None:
                raise ValueError("Answer must be provided when status is SUCCESS")
            if len(self.sources) == 0:
                raise ValueError("At least one source must be provided when status is SUCCESS")
        elif self.status == ResponseStatus.CONVERSATIONAL:
            if self.answer is None:
                raise ValueError("Answer must be provided when status is CONVERSATIONAL")
            # Conversational responses don't require sources
        elif self.status == ResponseStatus.INSUFFICIENT_CONTEXT:
            if self.answer is not None:
                raise ValueError("Answer should be None when status is INSUFFICIENT_CONTEXT")
        elif self.status == ResponseStatus.ERROR:
            if self.error_message is None:
                raise ValueError("Error message must be provided when status is ERROR")

    def to_dict(self):
        """Convert to JSON-serializable dict"""
        result = asdict(self)
        result['status'] = self.status.value
        return result
```

**Frontend Implementation**:
```typescript
interface AgentResponse {
  query_id: string;
  status: 'success' | 'conversational' | 'insufficient_context' | 'error';
  answer?: string;
  confidence?: ConfidenceScore;
  sources?: SourceReference[];
  metadata?: ResponseMetadata;
  error_message?: string;
}
```

---

### 3. ConfidenceScore (Embedded Object)

**Purpose**: Multi-factor confidence assessment for agent responses

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| retrieval_quality | number | 0.0-1.0 | Max similarity score from retrieval |
| coverage_score | number | 0.0-1.0 | % of query topics covered |
| entailment_score | number | 0.0-1.0 | Answer-context entailment |
| lexical_overlap | number | 0.0-1.0 | Lexical overlap answer/chunks |
| overall | number | Computed, 0.0-1.0 | Weighted average of all factors |
| level | string | Computed, enum | Human-readable: "high", "medium", "low" |

**Computed Properties**:
- `overall` = 0.35 * retrieval_quality + 0.25 * coverage_score + 0.25 * entailment_score + 0.15 * lexical_overlap
- `level` = "high" if overall ≥ 0.8, "medium" if overall ≥ 0.6, else "low"

**Backend Implementation**:
```python
@dataclass
class ConfidenceScore:
    retrieval_quality: float = 0.0
    coverage_score: float = 0.0
    entailment_score: float = 0.0
    lexical_overlap: float = 0.0

    @property
    def overall(self) -> float:
        weights = {
            'retrieval_quality': 0.35,
            'coverage_score': 0.25,
            'entailment_score': 0.25,
            'lexical_overlap': 0.15
        }
        return sum(weights[k] * getattr(self, k) for k in weights)

    @property
    def level(self) -> str:
        score = self.overall
        if score >= 0.8:
            return "high"
        elif score >= 0.6:
            return "medium"
        else:
            return "low"
```

**Frontend Implementation**:
```typescript
interface ConfidenceScore {
  retrieval_quality: number;
  coverage_score: number;
  entailment_score: number;
  lexical_overlap: number;
  overall: number;
  level: 'high' | 'medium' | 'low';
}
```

---

### 4. SourceReference (Array Element)

**Purpose**: Citation linking answer to specific textbook chunk

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| chunk_id | string or number | Required | References stored chunk in Qdrant |
| citation_index | number | Required, positive integer | Position in answer (1 for [1], 2 for [2]) |
| relevance_score | number | Required, 0.0-1.0 | Similarity score from retrieval |
| excerpt | string | Required | Short text preview from chunk |
| metadata | ChunkMetadata | Required | Full metadata object |

**Validation Rules**:
- `citation_index` must be positive integer (1, 2, 3, ...)
- `relevance_score` must be between 0.0 and 1.0
- `excerpt` recommended length: 100-200 characters

**Backend Implementation**:
```python
@dataclass
class SourceReference:
    chunk_id: Union[str, int]
    citation_index: int
    relevance_score: float
    excerpt: str
    metadata: 'ChunkMetadata'
```

**Frontend Implementation**:
```typescript
interface SourceReference {
  chunk_id: string | number;
  citation_index: number;
  relevance_score: number;
  excerpt: string;
  metadata: ChunkMetadata;
}
```

---

### 5. ChunkMetadata (Embedded Object)

**Purpose**: Metadata for text chunks from the textbook

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| page_number | number | Optional | Page number in original textbook |
| section_title | string | Optional | Section or chapter title |
| chapter | string | Optional | Chapter name |
| url | string | Optional | Source URL from textbook website |
| chunk_index | number | Optional | Sequential index of chunk in document |

**Validation Rules**:
- All fields optional (may not be available in Qdrant payload)
- `url` should be valid URL if provided

**Backend Implementation**:
```python
@dataclass
class ChunkMetadata:
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    chapter: Optional[str] = None
    url: Optional[str] = None
    chunk_index: Optional[int] = None
```

**Frontend Implementation**:
```typescript
interface ChunkMetadata {
  page_number?: number;
  section_title?: string;
  chapter?: string;
  url?: string;
  chunk_index?: number;
}
```

---

### 6. ResponseMetadata (Embedded Object)

**Purpose**: Generation metadata for agent responses (timing, model info)

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| model | string | Required | LLM model used (e.g., "gemini-pro") |
| temperature | number | Required, 0.0-1.0 | Generation temperature |
| total_time_ms | number | Required, non-negative | End-to-end response time (ms) |
| retrieval_time_ms | number | Required, non-negative | Time spent on Qdrant retrieval (ms) |
| generation_time_ms | number | Required, non-negative | Time spent on LLM generation (ms) |
| tokens_used | number | Optional | Total tokens consumed |
| timestamp | string | Required, ISO 8601 | Response generation timestamp |

**Validation Rules**:
- All time fields in milliseconds (non-negative numbers, 0.0 allowed for conversational responses)
- `timestamp` in ISO 8601 format (YYYY-MM-DDTHH:MM:SS.sssZ)

**Backend Implementation**:
```python
from datetime import datetime

@dataclass
class ResponseMetadata:
    model: str
    temperature: float
    total_time_ms: float
    retrieval_time_ms: float
    generation_time_ms: float
    tokens_used: Optional[int] = None
    timestamp: datetime = field(default_factory=datetime.now)
```

**Frontend Implementation**:
```typescript
interface ResponseMetadata {
  model: string;
  temperature: number;
  total_time_ms: number;
  retrieval_time_ms: number;
  generation_time_ms: number;
  tokens_used?: number;
  timestamp: string; // ISO 8601
}
```

---

### 7. QueryHistoryItem (Frontend Only)

**Purpose**: Stored record of past queries in browser localStorage

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| query | QueryRequest | Required | Original query request |
| response | AgentResponse | Required | Agent response received |
| timestamp | string | Required, ISO 8601 | When query was processed |
| session_id | string | Required | Browser session identifier |

**Storage Strategy**:
- Store in localStorage key: `rag-query-history`
- Maximum 50 items (FIFO eviction)
- Serialized as JSON array
- Session ID generated once per browser session (sessionStorage)

**Frontend Implementation**:
```typescript
interface QueryHistoryItem {
  query: QueryRequest;
  response: AgentResponse;
  timestamp: string; // ISO 8601
  session_id: string;
}

// Storage helpers
const HISTORY_KEY = 'rag-query-history';
const MAX_HISTORY_ITEMS = 50;

function saveToHistory(item: QueryHistoryItem): void {
  const history = getHistory();
  history.unshift(item); // Add to beginning
  if (history.length > MAX_HISTORY_ITEMS) {
    history.splice(MAX_HISTORY_ITEMS); // Trim to max size
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getHistory(): QueryHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend (Docusaurus / React)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [User Input] ──> QueryRequest                                  │
│       │                                                          │
│       │  { text, selected_text?, mode }                         │
│       │                                                          │
│       v                                                          │
│  POST /api/query ────────────────────────────────────────────> │
│                                                                 │
│                                           ┌─────────────────────┤
│                                           │ Backend (FastAPI)   │
│                                           ├─────────────────────┤
│                                           │                     │
│                                           │  RetrievalAgent     │
│                                           │    .query()         │
│                                           │       │             │
│                                           │       v             │
│                                           │  Qdrant Search      │
│                                           │       │             │
│                                           │       v             │
│                                           │  LLM Generation     │
│                                           │       │             │
│                                           │       v             │
│                                           │  AgentResponse      │
│                                           │                     │
│  <──────────────────────────────────────────────────────────── │
│       │                                                          │
│       │  { query_id, status, answer, confidence, sources, ... } │
│       │                                                          │
│       v                                                          │
│  [Answer Display Component]                                     │
│       │                                                          │
│       v                                                          │
│  localStorage ──> QueryHistoryItem                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Relationship Summary

- **QueryRequest** → sent to backend via HTTP POST
- **AgentResponse** ← returned from backend (contains ConfidenceScore, SourceReference[], ResponseMetadata)
- **SourceReference** → references **ChunkMetadata** (from Qdrant payload)
- **QueryHistoryItem** → combines **QueryRequest** + **AgentResponse** for localStorage

All entities are immutable after creation (no state mutations). Data flows one-way from user input through backend processing to frontend display and storage.

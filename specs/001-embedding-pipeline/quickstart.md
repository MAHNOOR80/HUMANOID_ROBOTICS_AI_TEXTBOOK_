# Quickstart: Embedding Pipeline Setup

## Prerequisites

- Python 3.11 or higher
- UV package manager
- Cohere API key
- Qdrant database instance (local or cloud)

## Setup

### 1. Clone and Navigate to Project
```bash
cd ai_native_textbook
```

### 2. Install Dependencies
```bash
uv sync
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root with the following:
```env
COHERE_API_KEY=your_cohere_api_key_here
QDRANT_URL=your_qdrant_url_here  # Optional, defaults to localhost
QDRANT_API_KEY=your_qdrant_api_key_here  # Optional, if using cloud
```

### 4. Initialize Qdrant Database
Make sure Qdrant is running. For local development:
```bash
# Using Docker
docker run -p 6333:6333 -p 6334:6334 \
  --env QDRANT__SERVICE__API_KEY=your-secret-api-key \
  qdrant/qdrant

# Or using Qdrant cloud service
```

## Usage

### Run the Complete Pipeline
```bash
python main.py --url "https://your-docusaurus-site.com" --collection-name "rag_embedding"
```

### Run Individual Components (Development)
```bash
# Just crawl and extract
python main.py --url "https://your-docusaurus-site.com" --step crawl

# Just embed existing content
python main.py --url "https://your-docusaurus-site.com" --step embed

# Just store embeddings
python main.py --url "https://your-docusaurus-site.com" --step store
```

## Configuration Options

- `--url`: Root URL of the Docusaurus site to process
- `--collection-name`: Name of the Qdrant collection (defaults to "rag_embedding")
- `--chunk-size`: Maximum size of text chunks (defaults to 1000 characters)
- `--chunk-overlap`: Overlap between chunks (defaults to 100 characters)
- `--batch-size`: Number of documents to process in each batch (defaults to 10)

## Verification

After running the pipeline, verify that:
1. The "rag_embedding" collection exists in Qdrant
2. The collection contains the expected number of vectors
3. Each vector has associated metadata including source URLs
4. Embeddings can be retrieved via similarity search
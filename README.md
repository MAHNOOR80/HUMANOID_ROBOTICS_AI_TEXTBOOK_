# Physical AI & Humanoid Robotics - AI-Native Textbook

An AI-generated, comprehensive textbook for learning Physical AI and Humanoid Robotics, built with Docusaurus for modern, searchable, and maintainable educational content.

## Overview

This textbook provides a complete curriculum covering:
- **Chapter 1**: Introduction to Physical AI
- **Chapter 2**: The Robotic Nervous System (ROS 2)
- **Chapter 3**: The Digital Twin (Gazebo & Unity)
- **Chapter 4**: The AI-Robot Brain (NVIDIA Isaac)
- **Chapter 5**: Vision-Language-Action (VLA)
- **Chapter 6**: Humanoid Robot Development
- **Chapter 7**: Conversational Robotics
- **Chapter 8**: Capstone Project - The Autonomous Humanoid

## Features

- 📚 **8 Comprehensive Chapters**: From foundational concepts to advanced capstone project
- 💻 **100+ Code Examples**: Executable Python, ROS 2, Bash, XML, YAML, and C# code
- 📊 **15+ Diagrams**: Mermaid diagrams and text descriptions for visual learning
- 🎯 **Learning Objectives**: Clear, measurable goals using Bloom's taxonomy
- 🔗 **Cross-References**: Interconnected chapters for progressive learning
- ✅ **Constitution-Compliant**: Follows 7 core principles for educational content quality

## Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai_native_textbook
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**:
   ```bash
   npm start
   # or
   yarn start
   ```

   This will start a local development server at `http://localhost:3000` with hot-reloading.

### Building for Production

1. **Build the static site**:
   ```bash
   npm run build
   # or
   yarn build
   ```

   This generates static content in the `build/` directory.

2. **Test the production build locally**:
   ```bash
   npm run serve
   # or
   yarn serve
   ```

3. **Deploy to hosting**:
   - The `build/` directory can be deployed to any static hosting service (GitHub Pages, Netlify, Vercel, AWS S3, etc.)

## Docusaurus Configuration

This textbook uses Docusaurus 2.x/3.x with the following structure:

```
ai_native_textbook/
├── docs/                    # Chapter markdown files
│   ├── chapter-1.md        # Introduction to Physical AI
│   ├── chapter-2.md        # ROS 2
│   ├── chapter-3.md        # Gazebo & Unity
│   ├── chapter-4.md        # NVIDIA Isaac
│   ├── chapter-5.md        # Vision-Language-Action
│   ├── chapter-6.md        # Humanoid Robot Development
│   ├── chapter-7.md        # Conversational Robotics
│   └── chapter-8.md        # Capstone Project
├── sidebars.js             # Navigation configuration
├── docusaurus.config.js    # Main Docusaurus configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Technology Stack

### Robotics Platforms
- **ROS 2 Humble**: Robot Operating System 2
- **Gazebo Fortress**: Physics simulation
- **Unity 2022 LTS**: High-fidelity visualization
- **NVIDIA Isaac Sim 2023.1+**: GPU-accelerated simulation and perception

### AI/ML Tools
- **OpenAI Whisper**: Speech recognition
- **GPT-4/GPT-3.5**: Natural language processing and task planning
- **Python 3.10+**: Primary programming language for examples

### Development Tools
- **Docusaurus 2.x/3.x**: Documentation framework
- **Markdown**: Content format
- **Mermaid**: Diagram generation

## Content Quality Standards

### Learning Objectives
Every chapter begins with clear, measurable learning objectives using Bloom's taxonomy verbs (understand, apply, analyze, evaluate, create).

### Code Examples
- ✅ Syntactically correct and executable
- ✅ Includes explanatory comments
- ✅ Follows best practices (PEP 8 for Python, ROS 2 conventions)
- ✅ Demonstrates error handling and modularity

### Accessibility
- ✅ All code blocks have language identifiers for syntax highlighting
- ✅ Diagrams include text descriptions
- ✅ Cross-references use relative links for easy navigation

## File Size Optimization

All chapters are optimized for fast loading:
- Chapter 1: 23KB
- Chapter 2: 32KB
- Chapter 3: 32KB
- Chapter 4: 24KB
- Chapter 5: 23KB
- Chapter 6: 19KB
- Chapter 7: 24KB
- Chapter 8: 24KB

**All chapters < 200KB target** ✅

## Constitution Principles

This textbook adheres to 7 core principles:

1. **Docusaurus-First Architecture**: Full Docusaurus compatibility
2. **Phase-Chapter Correspondence**: Exactly 8 chapters, no reordering
3. **Content Completeness & Clarity**: Learning objectives, code, diagrams, summaries
4. **AI-Native Content Generation**: Verified against authoritative sources
5. **Minimal Design, Maximum Utility**: Simple structure, focused content
6. **Hierarchical Navigation & Accessibility**: Complete sidebar, cross-references
7. **Iterative Refinement & Version Control**: Git tracking, constitution compliance

## Deployment

### GitHub Pages

1. Configure `docusaurus.config.js` with your GitHub repository details
2. Run:
   ```bash
   GIT_USER=<your-username> npm run deploy
   ```

### Netlify

1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build/`

### Vercel

1. Import your Git repository
2. Framework preset: Docusaurus
3. Build command: `npm run build`
4. Output directory: `build/`

## Contributing

This is an AI-native textbook generated following strict constitution principles. For updates or corrections:

1. Review the constitution in `.specify/memory/constitution.md`
2. Create feature specifications in `specs/`
3. Follow the planning workflow (spec → plan → tasks → implement)
4. Ensure all changes maintain constitution compliance

## License

[Specify your license here]

## Acknowledgments

- **ROS 2 Community**: For comprehensive robotics middleware
- **NVIDIA**: For Isaac platform and GPU-accelerated simulation
- **OpenAI**: For Whisper and GPT APIs
- **Docusaurus Team**: For excellent documentation framework

## RAG Integration

This project includes a comprehensive RAG (Retrieval-Augmented Generation) integration that allows users to ask questions about the textbook content and receive grounded answers with source citations. The system combines the embedding pipeline with a FastAPI backend and React frontend components.

### Features

- **AI Question Answering**: Ask questions about the textbook content and receive AI-generated answers
- **Source Citations**: All answers include citations linking back to specific textbook sections
- **Confidence Scoring**: Answers include confidence scores to indicate reliability
- **Selected Text Queries**: Ask questions specifically about selected text passages
- **Query History**: Maintain session history of previous questions and answers
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Accessibility**: Full keyboard navigation and ARIA labels for screen readers
- **Performance Optimized**: React.memo for efficient rendering and loading skeletons for better perceived performance

### Architecture

The RAG system consists of three main components:

1. **Backend API** (`api_server.py`): FastAPI server that interfaces with the RetrievalAgent
2. **Frontend Widget** (`RAGQueryWidget`): React component embedded in Docusaurus pages
3. **Embedding Pipeline**: Processes textbook content into vector database for retrieval

### Prerequisites

- Python 3.8+ for backend
- Node.js 18.0+ for frontend
- Cohere API key (or OpenAI API key as fallback)
- Qdrant vector database (local or cloud)
- Running embedding pipeline with textbook content

### Installation

1. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd my-book
   npm install
   ```

3. Create a `.env` file with the required environment variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here  # or COHERE_API_KEY
   COHERE_API_KEY=your_cohere_api_key_here
   QDRANT_URL=http://localhost:6333  # or your Qdrant cloud URL
   QDRANT_API_KEY=your_qdrant_api_key_here  # if using cloud
   FRONTEND_URL=http://localhost:3000  # Docusaurus dev server
   ```

### Usage

1. **Start the backend API server**:
   ```bash
   python api_server.py
   ```
   The API will be available at `http://localhost:8000`

2. **Start the Docusaurus frontend**:
   ```bash
   cd my-book
   npm start
   ```
   The site will be available at `http://localhost:3000`

3. **Use the RAG widget**: Navigate to any textbook page and use the RAG query widget in the bottom-right corner

### Frontend Features

- **Global Widget**: RAGQueryWidget automatically appears on textbook pages
- **Text Selection**: Select text on any page to ask questions specifically about that content
- **Keyboard Shortcuts**: Use `Ctrl+K` (or `Cmd+K`) to focus the query input
- **Loading States**: Skeleton loading indicators for better UX
- **Error Handling**: User-friendly error messages with dismiss functionality
- **Query History**: Session-based history with clear functionality

### Backend Endpoints

- `POST /api/query`: Submit a query to the RAG agent
  - Request: `{ "text": "question", "mode": "full_book|selected_text", "selected_text": "optional context" }`
  - Response: `{ "query_id", "status", "answer", "sources", "confidence", "metadata" }`

- `GET /health`: Check the health status of the API server

### Configuration

The RAG integration can be configured using environment variables:

- `OPENAI_API_KEY` or `COHERE_API_KEY`: LLM API key (required)
- `QDRANT_URL`: URL to your Qdrant instance (default: `http://localhost:6333`)
- `QDRANT_API_KEY`: API key for Qdrant cloud (optional)
- `FRONTEND_URL`: URL of the Docusaurus frontend (for CORS)
- `REACT_APP_API_URL`: API URL used by frontend (default: `http://localhost:8000`)

### Customization

The RAG widget can be customized by modifying:
- `my-book/src/components/RAGQueryWidget/`: React components and styles
- `my-book/src/services/api.ts`: API service and TypeScript interfaces
- `my-book/src/services/historyStorage.ts`: History management
- `my-book/src/services/errorMessages.ts`: Error message mapping

### Troubleshooting

- **Widget not appearing**: Ensure the `Root.tsx` theme wrapper is properly configured
- **CORS errors**: Verify `FRONTEND_URL` matches your Docusaurus server URL
- **No answers returned**: Check that the embedding pipeline has processed textbook content
- **API errors**: Verify API keys and Qdrant connection in the backend

## Embedding Pipeline

This project also includes an AI-native embedding pipeline that can crawl Docusaurus sites, extract content, generate embeddings, and store them in a vector database for RAG applications.

### Features

- **Docusaurus Content Extraction**: Crawls Docusaurus sites and extracts clean text content
- **Text Chunking**: Automatically chunks large documents to handle API size limits
- **Embedding Generation**: Uses Cohere API to generate high-quality embeddings
- **Vector Storage**: Stores embeddings in Qdrant vector database with metadata
- **Duplicate Detection**: Prevents storing duplicate content
- **Performance Monitoring**: Tracks execution metrics and timing
- **Comprehensive Error Handling**: Robust error handling throughout the pipeline

### Prerequisites

- Python 3.8+
- Cohere API key
- Qdrant vector database (local or cloud)

### Installation

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with the required environment variables:
   ```env
   COHERE_API_KEY=your_cohere_api_key_here
   QDRANT_URL=http://localhost:6333  # or your Qdrant cloud URL
   QDRANT_API_KEY=your_qdrant_api_key_here  # if using cloud
   ```

### Usage

Run the embedding pipeline with the following command:

```bash
python main.py --url <docusaurus_url> --collection-name <collection_name> [options]
```

#### Command Line Options

- `--url`: Root URL of the Docusaurus site to process (required)
- `--collection-name`: Name of Qdrant collection (default: `rag_embedding`)
- `--chunk-size`: Size of text chunks (default: `1000`)
- `--chunk-overlap`: Overlap between chunks (default: `100`)
- `--batch-size`: Batch size for vector storage (default: `10`)
- `--test-mode`: Run in test mode with limited processing

### Configuration

The pipeline can be configured using environment variables:

- `COHERE_API_KEY`: Your Cohere API key (required)
- `QDRANT_URL`: URL to your Qdrant instance (default: `http://localhost:6333`)
- `QDRANT_API_KEY`: API key for Qdrant cloud (optional)
- `CHUNK_SIZE`: Size of text chunks (default: `1000`)
- `CHUNK_OVERLAP`: Overlap between chunks (default: `100`)
- `BATCH_SIZE`: Batch size for vector storage (default: `10`)
- `MAX_DEPTH`: Maximum depth for URL crawling (default: `2`)
- `REQUEST_DELAY`: Delay between requests (default: `0.5`)
- `LOG_LEVEL`: Logging level (default: `INFO`)
- `LOG_FILE`: Log file path (default: `embedding_pipeline.log`)

## Support

For questions or issues:
- Review the chapter content in `/docs/`
- Check the planning documents in `/specs/001-textbook-generation/`
- For embedding pipeline issues, check the main.py file and configuration
- Consult the constitution principles in `.specify/memory/constitution.md`

---

**Generated**: 2025-12-07
**Version**: 1.0.0
**Format**: Docusaurus-compatible Markdown
**Total Chapters**: 8
**Total Code Examples**: 102+
**Total Diagrams**: 15+

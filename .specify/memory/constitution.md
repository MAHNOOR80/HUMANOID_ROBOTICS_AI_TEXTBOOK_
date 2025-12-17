<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Change type: MAJOR - Initial constitution establishment
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (7 principles)
  - Content Quality Standards
  - Technical Standards
  - Governance
Templates requiring updates:
  ✅ constitution.md (created)
  ⚠ plan-template.md (pending review)
  ⚠ spec-template.md (pending review)
  ⚠ tasks-template.md (pending review)
Follow-up TODOs: Review dependent templates for alignment with textbook-specific principles
-->

# Physical AI & Humanoid Robotics AI-Native Textbook — Constitution

## Core Principles

### I. Docusaurus-First Architecture
All content MUST be generated in Markdown format fully compatible with Docusaurus. Each phase/chapter corresponds to a separate Markdown file in the `/docs` directory. Navigation metadata (title, sidebar label) MUST be included for every chapter. The folder structure and navigation MUST support hierarchical organization and logical flow from introduction to capstone.

**Rationale**: Docusaurus provides a modern, searchable, and maintainable platform for educational content. A Docusaurus-first approach ensures the textbook is immediately deployable and accessible to students and educators.

### II. Phase-Chapter Correspondence (NON-NEGOTIABLE)
The textbook MUST be structured into exactly 8 phases, each representing one chapter:
1. Introduction to Physical AI
2. The Robotic Nervous System (ROS 2)
3. The Digital Twin (Gazebo & Unity)
4. The AI-Robot Brain (NVIDIA Isaac)
5. Vision-Language-Action (VLA)
6. Humanoid Robot Development
7. Conversational Robotics
8. Capstone Project: The Autonomous Humanoid

Each chapter MUST be self-contained yet flow logically to the next. No phase may be skipped, merged, or reordered without explicit justification and approval.

**Rationale**: This structure mirrors the pedagogical progression from foundational concepts to advanced integration, ensuring students build competency systematically.

### III. Content Completeness & Clarity
Every chapter MUST include:
- Clear hierarchical structure using Markdown headers (#, ##, ###)
- Code examples with syntax highlighting and explanatory comments
- Diagrams (as text placeholders or Mermaid/PlantUML when feasible)
- Lists, tables, and callouts where appropriate
- Learning objectives at the beginning
- Summary and key takeaways at the end

Content MUST use clear, professional language suitable for students and educators. Technical accuracy is paramount; no assumptions or unverified information may be included.

**Rationale**: Educational content requires clarity, structure, and completeness to facilitate learning and comprehension.

### IV. AI-Native Content Generation
All content generation MUST leverage authoritative sources and MCP tools. The assistant MUST NOT rely on internal knowledge alone. When creating technical content:
- Verify commands, APIs, and code patterns through documentation or execution
- Reference official documentation for ROS 2, Gazebo, Unity, NVIDIA Isaac
- Use CLI tools and MCP servers for discovery and verification
- Cite sources where appropriate

**Rationale**: AI-native textbooks must maintain accuracy and currency by grounding content in verifiable, external sources rather than potentially outdated internal knowledge.

### V. Minimal Design, Maximum Utility
Content MUST focus exclusively on educational material. Avoid:
- Unnecessary embellishments or marketing language
- Over-engineered folder structures
- Redundant files or configurations
- Features not explicitly required for Docusaurus deployment

Keep solutions simple, focused, and maintainable. Every file and folder must have a clear purpose.

**Rationale**: Educational materials benefit from simplicity and focus. Complexity distracts from learning and complicates maintenance.

### VI. Hierarchical Navigation & Accessibility
The `sidebars.js` configuration MUST list all chapters in logical order. Each chapter MUST be accessible through the sidebar navigation. Internal cross-references between chapters MUST use Docusaurus-compatible relative links.

**Rationale**: Navigation is critical for educational materials. Students must easily locate content and understand the course structure.

### VII. Iterative Refinement & Version Control
All content changes MUST be tracked in version control (Git). Each chapter iteration MUST be reviewed for:
- Technical accuracy
- Pedagogical effectiveness
- Docusaurus compatibility
- Consistency with constitution principles

Major content updates MUST be documented in ADRs when they involve significant pedagogical or architectural decisions.

**Rationale**: Educational content evolves. Version control and documentation ensure transparency, accountability, and continuous improvement.

## Content Quality Standards

### Learning Objectives
Every chapter MUST begin with clear, measurable learning objectives using Bloom's taxonomy (understand, apply, analyze, evaluate, create).

### Code Examples
All code snippets MUST:
- Be syntactically correct and executable
- Include comments explaining key concepts
- Use consistent coding style (PEP 8 for Python, ROS 2 conventions for launch files)
- Demonstrate best practices (error handling, modularity, clarity)

### Diagrams & Visualizations
Diagrams MUST:
- Be included as text placeholders with clear descriptions (e.g., `[Diagram: ROS 2 Node Communication Graph]`)
- Optionally use Mermaid or PlantUML for programmatic generation
- Clearly illustrate concepts that are difficult to convey in text alone

### Exercises & Assessments
Each chapter SHOULD include:
- Practice exercises aligned with learning objectives
- Suggested projects or labs
- Assessment questions (multiple choice, short answer, coding challenges)

## Technical Standards

### Markdown Formatting
- Headers: Use ATX-style headers (`#`, `##`, `###`) consistently
- Code blocks: Always specify language for syntax highlighting (```python, ```bash, ```xml)
- Links: Use relative links for internal references, absolute for external
- Lists: Use consistent bullet style (-, *, or numbered)
- Tables: Use GitHub-flavored Markdown table syntax

### Docusaurus Metadata
Every chapter file MUST include frontmatter:
```markdown
---
id: chapter-X
title: "Chapter X: Title"
sidebar_label: "Chapter X"
sidebar_position: X
---
```

### File Naming Conventions
- Chapter files: `chapter-1.md`, `chapter-2.md`, etc.
- Supporting assets: `/static/img/chapter-X/`, `/static/code/chapter-X/`
- Case: lowercase with hyphens for multi-word names

### Technology Stack References
Content MUST reference current, stable versions:
- ROS 2: Humble Hawksbill or later
- Gazebo: Gazebo 11 or Ignition/Gazebo Fortress
- Unity: Unity 2022 LTS or later
- NVIDIA Isaac: Isaac Sim 2023.1 or later

Version numbers MUST be clearly stated in the Introduction chapter.

## Governance

### Constitution Authority
This constitution supersedes all other project practices and guidelines. Any deviation MUST be explicitly justified, documented, and approved.

### Amendment Process
Constitution amendments MUST:
1. Be proposed with clear rationale
2. Include impact analysis on existing content and templates
3. Follow semantic versioning (MAJOR.MINOR.PATCH)
4. Be documented in an ADR
5. Trigger review and update of dependent artifacts (plan-template, spec-template, tasks-template)

### Compliance Verification
All content contributions (chapters, code examples, diagrams) MUST:
- Verify alignment with Core Principles before merging
- Pass Docusaurus build validation
- Be reviewed for technical accuracy and pedagogical effectiveness

### Constitution as Living Document
The constitution may evolve as the project matures. Each amendment MUST increment the version number and update the `Last Amended` date. The Sync Impact Report (HTML comment at top) MUST be updated with each change.

**Version**: 1.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-06

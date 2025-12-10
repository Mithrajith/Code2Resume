# Code2Resume

> **Transform Your GitHub Profile into AI-Powered, Domain-Specific Resumes**

A fully local, privacy-first AI system that analyzes your GitHub repositories, classifies them by domain (ML, Full Stack, DevOps, etc.), and generates LaTeX resumes tailored to specific job roles—all powered by your own GPU.

---

## 📋 Table of Contents

- [Project Domain & Problem Statement](#project-domain--problem-statement)
- [High-Level Overview](#high-level-overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Algorithms & Techniques](#algorithms--techniques)
- [Installation & Setup](#installation--setup)
- [How It Works](#how-it-works)
- [Use Cases](#use-cases)
- [Future Scope](#future-scope)
- [License](#license)

---

## 🎯 Project Domain & Problem Statement

### **Domain**
Career Technology (CareerTech) / AI-Powered Resume Generation

### **Real-World Problem**
Developers maintain diverse GitHub portfolios spanning multiple domains (Machine Learning, Full Stack Development, Mobile Apps, DevOps, etc.). When applying for jobs:

1. **Manual Resume Creation is Time-Consuming**: Writing resumes from scratch for each role requires hours of work.
2. **Generic Resumes Fail**: Submitting the same resume for an "ML Engineer" and "Full Stack Developer" position reduces relevance and interview chances.
3. **Missing Context**: Hiring managers can't easily understand technical depth from README files alone.
4. **Privacy Concerns**: Cloud-based AI tools expose your code and project data to third parties.

### **Target Users**
- **Software Developers** seeking role-specific resumes (ML Engineer, Backend Dev, etc.)
- **Students** building portfolios from academic projects
- **Freelancers** needing quick, professional resumes for client proposals
- **Privacy-Conscious Professionals** who want AI processing on their own hardware

---

## 🚀 High-Level Overview

### **What Code2Resume Does**
Code2Resume is a **local AI system** that:
1. Fetches your GitHub repositories via the GitHub API
2. Analyzes each project's README, tech stack, and structure using **Llama 3.1** (running locally via Ollama)
3. Classifies projects by domain (e.g., "Machine Learning", "Full Stack", "DevOps")
4. Stores analyzed data in a **vector database (ChromaDB)** for semantic search
5. Generates **domain-filtered LaTeX resumes** using Retrieval-Augmented Generation (RAG)
6. Provides a **ChatGPT-style interface** for querying your projects (e.g., "List all my ML projects")

### **Core Objectives**
- **Privacy**: All AI processing happens locally on your RTX 2050 GPU (or CPU)
- **Personalization**: Resumes are tailored to specific roles (ML Engineer vs. Full Stack Developer)
- **Automation**: Eliminate manual resume writing by leveraging your existing GitHub history
- **Intelligence**: Uses RAG to generate accurate, contextual descriptions even when project details are sparse

### **Key Capabilities**
- **Domain-Aware Resume Generation**: Automatically filters projects by domain (ML, Full Stack, etc.)
- **Streaming Chat Interface**: Real-time token-by-token responses like ChatGPT
- **Fine-Tuning Ready**: Train Llama 3.1 on your project data using Unsloth (GPU-accelerated)
- **Downloadable LaTeX Files**: Get `.tex` files ready for Overleaf compilation

---

## 🏗️ System Architecture

### **End-to-End Data Flow**

```
┌─────────────────┐
│  GitHub API     │  ← Fetch repos metadata + README
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI Server │  ← Process batch requests (concurrency: 3, timeout: 30s)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ollama + Llama │  ← Analyze README → Extract: description, tech stack,
│  3.1:8b (GPU)   │     features, domain classification
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to JSONL  │  ← Raw data: Git_details/{user}/data.jsonl
└────────┬────────┘  ← Fine-tune data: fine_tune_data.jsonl (Alpaca format)
         │
         ▼
┌─────────────────┐
│  ChromaDB       │  ← Vector embeddings via SentenceTransformer
│  (RAG Store)    │     (all-MiniLM-L6-v2)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Query     │  ← "Generate ML engineer resume"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RAG Retrieval  │  ← Semantic search (filter by domain)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LLM Generation │  ← Fill LaTeX template (main.tex)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  .tex File      │  ← Save to tmp/{user}_{timestamp}.tex
└─────────────────┘  ← User downloads via /download endpoint
```

### **Component Interaction**

| Component            | Role                                                                 | Communication                          |
|----------------------|----------------------------------------------------------------------|----------------------------------------|
| **FastAPI Backend**  | Orchestrates GitHub fetching, LLM calls, RAG queries, file serving  | HTTP REST API                          |
| **Ollama Server**    | Serves Llama 3.1:8b with GPU acceleration (num_gpu=99)              | HTTP API (localhost:11434)             |
| **ChromaDB**         | Stores project embeddings for semantic search                        | Python Client (Persistent DB)          |
| **Frontend (HTML/JS)**| Streaming chat UI, session management, theme toggle                | Fetch API (SSE for streaming)          |
| **SQLite (via SQLAlchemy)**| User authentication (username, hashed password, GitHub token)  | ORM (Bcrypt for password hashing)      |

---

## 🛠️ Tech Stack

### **Frontend**
| Technology       | Purpose                                                               |
|------------------|-----------------------------------------------------------------------|
| **HTML5/CSS3**   | Modern UI with glassmorphism effects, gradient themes                |
| **JavaScript**   | Session management, streaming chat (Fetch API + ReadableStream)      |
| **Marked.js**    | Markdown rendering for AI responses                                  |

### **Backend**
| Technology       | Purpose                                                               |
|------------------|-----------------------------------------------------------------------|
| **FastAPI**      | Async HTTP server with JWT authentication (OAuth2)                   |
| **Ollama**       | Local LLM inference server (GPU-accelerated via CUDA)                |
| **Llama 3.1:8b** | Open-source LLM (8 billion parameters, runs on 4GB VRAM with offloading) |
| **Pydantic**     | Data validation for API requests/responses                           |
| **httpx**        | Async HTTP client for GitHub API calls (timeout: 10s connect, 30s read) |
| **SQLAlchemy**   | ORM for user database (SQLite)                                       |
| **Bcrypt**       | Password hashing (salted, secure)                                    |

### **Database**
| Technology       | Purpose                                                               |
|------------------|-----------------------------------------------------------------------|
| **ChromaDB**     | Vector database for RAG (semantic search via cosine similarity)      |
| **SQLite**       | User authentication database (username, password, tokens)            |
| **JSONL Files**  | Raw project data + fine-tuning datasets (Alpaca format)              |

### **AI/ML**
| Technology              | Purpose                                                        |
|-------------------------|----------------------------------------------------------------|
| **Llama 3.1:8b**        | Primary LLM (GitHub analysis, resume generation, chat)        |
| **SentenceTransformer** | Embedding model (`all-MiniLM-L6-v2`) for ChromaDB            |
| **Unsloth**             | Memory-efficient fine-tuning (4-bit quantization, QLoRA)      |
| **PyTorch 2.5.1**       | Deep learning framework (CUDA 12.8 support)                   |

### **DevOps & Tooling**
| Technology       | Purpose                                                               |
|------------------|-----------------------------------------------------------------------|
| **uv**           | Python package manager (faster than pip, handles torch versions)     |
| **Git/GitHub**   | Source control + data source (GitHub API v3)                         |
| **Fish Shell**   | User's default shell (all scripts tested)                            |
| **Bash**         | `run.sh` startup script                                              |

---

## ✨ Core Features

### **Functional Features**
1. **GitHub Profile Analysis**
   - Fetches up to 100 repositories per user
   - Concurrency-limited API calls (3 simultaneous, 0.8s delay) to avoid rate limits
   - Extracts: name, description, tech stack, languages, README content

2. **Intelligent Domain Classification**
   - Uses LLM to categorize projects into 8 domains:
     - Machine Learning, Data Science, Full Stack, Frontend, Backend, Mobile App, DevOps, Other
   - Enforces strict domain labels via prompt engineering

3. **Domain-Specific Resume Generation**
   - Detects target role from user query (e.g., "ML engineer resume" → filters ML projects)
   - Switches to `main.tex` template (clean, professional LaTeX layout)
   - Generates missing descriptions/features intelligently when README lacks details

4. **RAG-Powered Chat Interface**
   - Streaming responses (token-by-token, ChatGPT-style animation)
   - Semantic search across projects (ChromaDB + embeddings)
   - Session-based history (localStorage, persistent across refreshes)

5. **Downloadable Resume Files**
   - Saves LaTeX to `tmp/{username}_{timestamp}.tex`
   - Serves via `/download/{filename}` endpoint (secured by user verification)
   - Direct compilation link to Overleaf

### **Internal System Features**
- **Authentication**: JWT-based (30-min expiry), OAuth2 password flow
- **Concurrency Control**: Asyncio semaphores (3 concurrent GitHub requests)
- **Error Handling**: Timeouts (10s connect, 30s read), retry logic for model pulls
- **GPU Optimization**: Forces all Ollama calls to use GPU (`num_gpu=99`)
- **Telemetry Disabled**: ChromaDB telemetry turned off to avoid version conflicts

---

## 🧠 Algorithms & Techniques

### **1. Domain Classification via Prompt Engineering**
**Technique**: Few-shot prompting with strict output constraints  
**Implementation**:
```python
prompt = """
Analyze this repository and classify its domain.
MUST be ONE of: Machine Learning, Data Science, Full Stack, Frontend, Backend, Mobile App, DevOps, Other
Based on: README content, tech stack (Python + TensorFlow → ML), project purpose
Return JSON: {"domain": "Machine Learning"}
"""
```
**Why**: LLMs excel at classification when given clear options. Enforcing exact labels prevents inconsistent values ("ML" vs "Machine Learning").

### **2. Retrieval-Augmented Generation (RAG)**
**Technique**: Semantic search → Context injection → LLM generation  
**Flow**:
1. Embed user query using `all-MiniLM-L6-v2` (384-dim vectors)
2. Query ChromaDB with cosine similarity (top-k=50 for "list all" queries)
3. Inject retrieved projects as context into Llama 3.1 prompt
4. Generate response grounded in actual project data

**Why**: Prevents LLM hallucination. Instead of inventing projects, it references real data from GitHub.

### **3. Streaming Token Generation**
**Technique**: Server-Sent Events (SSE) via FastAPI StreamingResponse  
**Implementation**:
```python
def generate():
    stream = ollama.chat(model="llama3.1", messages=[...], stream=True)
    for chunk in stream:
        yield f"data: {json.dumps({'token': chunk['message']['content']})}\n\n"
```
**Why**: Improves perceived performance (users see responses forming immediately vs waiting 10+ seconds).

### **4. GPU Memory Optimization**
**Technique**: Offloading + Mixed Precision  
**Settings**:
- `num_gpu=99` → Ollama loads as many layers as possible onto GPU (RTX 2050: 4GB VRAM)
- Remaining layers offload to RAM (16GB system memory)
- PyTorch 2.5.1 with CUDA 12.8 for efficient tensor operations

**Why**: Llama 3.1:8b requires ~5GB VRAM in FP16. With 4GB VRAM, offloading is necessary but still faster than pure CPU.

### **5. Fine-Tuning (Unsloth + QLoRA)**
**Technique**: 4-bit quantization + Low-Rank Adaptation  
**Training Data Format** (Alpaca):
```json
{
  "instruction": "Write a resume bullet point for {project_name}.",
  "input": "",
  "output": "🚀 Engineered {name}, a {domain} solution that {description}, leveraging {tech_stack}."
}
```
**Why**: QLoRA reduces memory usage by 75% while maintaining 99% of full fine-tuning quality. Critical for 4GB VRAM.

### **6. Concurrency Control**
**Technique**: Asyncio Semaphores + Exponential Backoff  
**Implementation**:
```python
sem = asyncio.Semaphore(3)  # Max 3 concurrent requests
async def fetch_with_sem(repo):
    async with sem:
        await asyncio.sleep(0.8)  # Rate limiting
        return await fetch_github_data(repo)
```
**Why**: GitHub API has rate limits (5000 req/hour for authenticated users). Batching prevents 403 errors.

---

## 📦 Installation & Setup

### **Prerequisites**
- **OS**: Linux (Ubuntu 20.04+) or macOS
- **GPU**: NVIDIA RTX 2050 (4GB VRAM) or higher (optional but recommended)
- **RAM**: 16GB minimum
- **Python**: 3.12+
- **Git**: Installed and configured
- **Ollama**: [Download from ollama.ai](https://ollama.ai)

### **Step-by-Step Setup**

#### **1. Clone the Repository**
```bash
git clone https://github.com/Mithrajith/Code2Resume.git
cd Code2Resume
```

#### **2. Install Dependencies via `uv`**
```bash
# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
uv sync
```

**Critical**: `uv` handles PyTorch version conflicts automatically. Manual pip installation may break due to CUDA version mismatches.

#### **3. Install and Configure Ollama**
```bash
# Install Ollama (Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Llama 3.1:8b model
ollama pull llama3.1:8b

# Start Ollama server (runs in background)
ollama serve
```

Verify installation:
```bash
ollama list  # Should show llama3.1:8b
```

#### **4. Set Up Environment Variables**
Create a `.env` file (optional, for custom configurations):
```bash
cp .env.example .env
```

**Contents**:
```env
SECRET_KEY=your-secret-key-change-in-production
OLLAMA_HOST=http://localhost:11434
```

#### **5. Initialize Database**
```bash
# Database is created automatically on first run
# No manual migration needed (SQLAlchemy handles it)
```

#### **6. Start the Application**
```bash
./run.sh
```

The app will start on `http://localhost:8000`

**Note**: For GPU usage, ensure:
```bash
nvidia-smi  # Verify GPU is detected
nvcc --version  # CUDA 12.8+ required
```

---

## 🔄 How It Works (Internals Explained)

### **1. User Registration & Login**
**Flow**:
```
User submits form → FastAPI validates → Bcrypt hashes password → SQLite stores user
```
**Security**: Passwords are salted and hashed (never stored in plaintext). JWT tokens expire after 30 minutes.

### **2. GitHub Analysis**
**Trigger**: User clicks "Update from GitHub"  
**Process**:
1. **Fetch Repos**: `GET /users/{username}/repos?per_page=100` (GitHub API)
2. **Batch Processing**: Group repos into batches of 5
3. **LLM Analysis**:
   ```
   For each repo:
     - Fetch README (base64 decode)
     - Detect languages (GitHub API)
     - Send to Llama 3.1: "Analyze this project..."
     - Parse JSON response: {name, description, tech_stack[], features[], domain}
   ```
4. **Storage**:
   - Raw JSON → `Git_details/{user}/data.jsonl`
   - Fine-tune format → `Git_details/{user}/fine_tune_data.jsonl`
   - Embeddings → ChromaDB (vector store)

**Error Handling**: Timeouts (30s), rate limit detection (retry with backoff), malformed JSON (skip repo).

### **3. Chat Query Processing**
**Example**: User asks "List all my ML projects"  
**Flow**:
1. **Query Embedding**: Convert "List all my ML projects" → 384-dim vector
2. **Semantic Search**: ChromaDB finds top-50 similar projects (cosine similarity)
3. **Context Building**:
   ```
   Context: Project 1 | ML | Built a CNN for image classification using PyTorch...
   Context: Project 2 | ML | NLP sentiment analyzer with Transformers...
   ```
4. **LLM Prompt**:
   ```
   You are a resume assistant.
   Context: [Retrieved projects]
   User: List all my ML projects
   Instructions: Use ONLY the context. Format as Markdown.
   ```
5. **Streaming Response**: Tokens sent via SSE → Frontend renders incrementally

### **4. Resume Generation**
**Trigger**: User types "Generate ML engineer resume"  
**Process**:
1. **Domain Detection**: Regex match → "ML" keyword detected → `target_domain = "Machine Learning"`
2. **Filtered Retrieval**: Query ChromaDB with "Machine Learning projects" → Get only ML projects
3. **Template Loading**: Read `LateX_template/main.tex`
4. **LLM Instruction**:
   ```
   Fill this LaTeX template for an ML Engineer role.
   Projects: [Filtered ML projects]
   Rules:
   - Generate missing descriptions from tech stack if README is sparse
   - Write 3 bullet points per project (achievement-focused)
   - Extract skills from all projects
   ```
5. **File Saving**: LaTeX output → `tmp/resume_{user}_{timestamp}.tex`
6. **Frontend Response**:
   ```json
   {
     "success": true,
     "filename": "resume_mithrajith_20251210_143022.tex",
     "message": "Resume generated successfully!"
   }
   ```
7. **Download**: User clicks button → `GET /download/{filename}` → Browser downloads `.tex`

---

## 💡 Use Cases

### **1. Job Application Sprint**
**Scenario**: Developer applies to 10 jobs (5 ML roles, 5 Full Stack roles)  
**Workflow**:
1. Run GitHub analysis once (10 minutes for 50 repos)
2. Generate ML resume: `"Generate machine learning engineer resume"` → Download `resume_ml.tex`
3. Generate Full Stack resume: `"Generate full stack developer resume"` → Download `resume_fullstack.tex`
4. Upload both to Overleaf → Compile to PDF → Submit

**Time Saved**: 8 hours of manual resume writing → 15 minutes

### **2. Portfolio Query**
**Scenario**: During interview, recruiter asks: "Tell me about your DevOps experience"  
**Workflow**:
1. Open Code2Resume chat
2. Ask: `"List all my DevOps projects with tech stacks"`
3. Get instant, accurate list with descriptions
4. Reference specific projects during conversation

### **3. Student Portfolio Builder**
**Scenario**: CS student has 15 academic projects scattered across GitHub  
**Workflow**:
1. Connect GitHub account
2. System auto-classifies: 3 ML, 5 Web Dev, 2 Mobile, 5 Algorithms
3. Generate resume for internship: `"Generate software engineering internship resume"`
4. System intelligently picks top 6 diverse projects
5. Download and submit

---

## 🚀 Future Scope

### **Scaling & Performance**
- [ ] **Multi-User Support**: Move from SQLite to PostgreSQL with Redis caching
- [ ] **Distributed Processing**: Use Celery for background GitHub analysis
- [ ] **Model Quantization**: Implement GPTQ/GGUF for faster inference (2x speedup)
- [ ] **Cloud Deployment**: Containerize with Docker, deploy to AWS/GCP with GPU instances

### **Advanced Features**
- [ ] **PDF Generation**: Integrate `pdflatex` for one-click PDF output
- [ ] **ATS Optimization**: Score resumes against job descriptions (keyword matching)
- [ ] **Multi-Language Support**: i18n for UI (Spanish, Hindi, Chinese)
- [ ] **GitHub PR Analysis**: Analyze code contributions, not just repo metadata
- [ ] **LinkedIn Integration**: Auto-sync profile data

### **AI Enhancements**
- [ ] **Custom Fine-Tuned Model**: Train on 10,000+ resumes for better output
- [ ] **Multi-Modal Analysis**: Process project images, diagrams (CLIP/BLIP models)
- [ ] **Skill Gap Analysis**: Compare your stack vs. job requirements
- [ ] **Interview Prep**: Generate technical questions based on your projects

### **UX Improvements**
- [ ] **Live Preview**: Real-time LaTeX rendering in browser (KaTeX)
- [ ] **Template Gallery**: Multiple resume styles (Modern, Classic, Academic)
- [ ] **Drag-and-Drop**: Reorder projects in resume manually
- [ ] **Collaboration**: Share resume drafts with mentors (shareable links)

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Mithrajith K S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Style**: Follow PEP 8 (Python), use `black` formatter, write docstrings.

---

## 📧 Contact

**Mithrajith K S**  
- GitHub: [@Mithrajith](https://github.com/Mithrajith)  
- LinkedIn: [mithrajitks046](https://www.linkedin.com/in/mithrajitks046)

---

## 🙏 Acknowledgments

- **Ollama Team** for the incredible local LLM server
- **Meta AI** for open-sourcing Llama 3.1
- **Unsloth** for memory-efficient fine-tuning
- **ChromaDB** for the lightweight vector database
- **FastAPI** for the blazing-fast async framework

---

**Built with ❤️ by developers, for developers. All processing happens on YOUR machine. Your code, your data, your privacy.**

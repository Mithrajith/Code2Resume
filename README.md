# Code2Resume

Transform your GitHub projects into ATS-friendly resume content using local AI models.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- [Ollama](https://ollama.ai) for local AI models

### Installation

1. **Clone and setup:**
```bash
git clone https://github.com/Mithrajith/Code2Resume.git
cd Code2Resume
./setup.sh
```

2. **Start the application:**
```bash
source venv/bin/activate
cd backend
python app.py
```

3. **Open in browser:**
```
http://localhost:8000
```

## 🎯 What It Does

Code2Resume converts your:
- **GitHub repository URLs** 
- **Manual project descriptions**

Into professional, ATS-optimized:
- **Resume bullet points** with metrics and impact
- **Project summaries** for resumes
- **Tech stack descriptions**
- **Portfolio descriptions**

## 🔧 Features

### From GitHub Repository
- Analyzes repository metadata (stars, languages, structure)
- Reads README content for project understanding  
- Detects tech stack from code and dependencies
- Generates role-specific resume content

### Manual Project Input
- Custom project name and description
- Technology stack specification
- Role-based content generation
- Target job role optimization

### AI-Powered Generation
- Uses local Llama/Gemma2 models via Ollama
- No data sent to external services
- Structured prompt engineering
- ATS-friendly language optimization

## 📁 Tech Stack

**Frontend:**
- HTML5/CSS3 with responsive design
- Vanilla JavaScript
- Modern UI with copy-to-clipboard functionality

**Backend:**
- FastAPI (Python)
- Async/await architecture
- Pydantic for data validation

**AI/LLM:**
- Ollama for local model hosting
- Gemma2:9B (primary model)
- Llama3.1:8B (fallback model)

**External APIs:**
- GitHub API for repository analysis
- Optional GitHub token for higher rate limits

## 🎮 Usage

### GitHub Repository Mode
1. Select "From GitHub Repository"
2. Paste repository URL (e.g., `https://github.com/username/project`)
3. Choose target job role
4. Optionally specify your role in the project
5. Click "Generate Resume Content"

### Manual Input Mode
1. Select "Manual Project Input"
2. Fill in project details:
   - Project name
   - Description  
   - Technologies used
   - Your role (optional)
3. Choose target job role
4. Click "Generate Resume Content"

### Output
The tool generates:
- **Summary:** 2-3 line professional project overview
- **Bullet Points:** 4-5 ATS-friendly resume bullets with action verbs
- **Tech Stack:** Clean technology list
- **Portfolio Version:** Detailed narrative description

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Server
HOST=127.0.0.1
PORT=8000

# AI Models
OLLAMA_HOST=http://localhost:11434
DEFAULT_MODEL=gemma2:9b
FALLBACK_MODEL=llama3.1:8b

# Optional GitHub Token (for higher rate limits)
GITHUB_TOKEN=your_token_here
```

### Supported Target Roles
- Python Developer
- Full Stack Developer  
- Frontend Developer
- Backend Developer
- Machine Learning Engineer
- Data Scientist
- DevOps Engineer
- Software Engineer
- Web Developer
- Mobile Developer

## 🔧 Development

### Project Structure
```
Code2Resume/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── config/
│   │   └── settings.py     # Configuration management
│   ├── models/
│   │   └── llm_handler.py  # Ollama integration
│   ├── services/
│   │   ├── github_service.py    # GitHub API client
│   │   ├── prompt_builder.py    # LLM prompt templates
│   │   └── resume_generator.py  # Main orchestrator
│   └── requirements.txt
├── static/
│   ├── css/styles.css      # Frontend styling
│   └── js/main.js          # Frontend logic
├── index.html              # Main interface
└── LateX_template/         # Resume templates
```

### API Endpoints

**POST /generate**
```json
{
  "source_type": "github|manual",
  "repo_url": "https://github.com/user/repo",
  "project_name": "Project Name",
  "project_description": "Description...",
  "tech_stack": "Python, React, PostgreSQL",
  "user_role": "Lead Developer",
  "target_role": "Python Developer"
}
```

**Response:**
```json
{
  "success": true,
  "project_name": "Project Name",
  "summary": "Professional summary...",
  "bullet_points": ["• Bullet 1", "• Bullet 2"],
  "tech_stack_line": "Tech: Python, React, PostgreSQL",
  "portfolio_version": "Detailed description...",
  "metadata": {}
}
```

### Adding New Models
1. Update `DEFAULT_MODEL` or `FALLBACK_MODEL` in settings
2. Pull the model: `ollama pull model-name`
3. Restart the application

### Customizing Prompts
Edit templates in `backend/services/prompt_builder.py`:
- Modify base template structure
- Add role-specific customizations
- Adjust output formatting rules

## 🐛 Troubleshooting

### Common Issues

**Ollama Connection Failed:**
- Ensure Ollama is installed and running
- Check `OLLAMA_HOST` in .env file
- Verify models are pulled: `ollama list`

**GitHub API Rate Limits:**
- Add `GITHUB_TOKEN` to .env file
- Get token from GitHub Settings > Developer settings

**Model Download Issues:**
- Check internet connection
- Verify disk space (models are 4-7GB each)
- Try pulling manually: `ollama pull gemma2:9b`

**Generation Errors:**
- Check Ollama service status
- Verify model availability
- Review backend logs for details

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Add tests if applicable
5. Submit a pull request

## 🔗 Links

- [Ollama Documentation](https://github.com/ollama/ollama)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [GitHub API Documentation](https://docs.github.com/en/rest)

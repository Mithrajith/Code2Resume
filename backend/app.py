import os
import httpx
import ollama
import asyncio
from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Dict, Any, Union, Optional
import json
from urllib.parse import urlparse
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.database import engine, get_db, Base
from backend.models.user import User
from backend.services.rag_service import RAGService
from backend.services.agent_service import AgentService

# Create tables
Base.metadata.create_all(bind=engine)

# Auth Configuration
SECRET_KEY = "your-secret-key-keep-it-secret" # In production, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # Removed due to passlib incompatibility
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

app = FastAPI()

# Initialize Services
rag_service = RAGService()
agent_service = AgentService()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Models & Helpers ---

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    password: str
    github_url: str
    github_token: str

class UserResponse(BaseModel):
    username: str
    github_url: str

import bcrypt

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# --- Auth Endpoints ---

@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Verify GitHub Token
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"token {user.github_token}"}
        resp = await client.get("https://api.github.com/user", headers=headers)
        if resp.status_code != 200:
             raise HTTPException(status_code=400, detail="Invalid GitHub Token")
        
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        hashed_password=hashed_password,
        github_url=user.github_url,
        github_token=user.github_token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse(username=current_user.username, github_url=current_user.github_url)

# --- Application Logic ---

class RepoRequest(BaseModel):
    url: Optional[str] = None # Optional now, defaults to user's URL

class AskRequest(BaseModel):
    query: str

@app.post("/ask")
async def ask_agent(request: AskRequest, current_user: User = Depends(get_current_user)):
    try:
        response = agent_service.ask(request.query, username=current_user.username)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_github_data(owner: str, repo: str, token: str):
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"

    async with httpx.AsyncClient(follow_redirects=True, headers=headers) as client:
        # Fetch repo details
        repo_resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}")
        
        if repo_resp.status_code == 403:
            print(f"Rate limit exceeded while fetching {owner}/{repo}")
            return None, None, None
            
        if repo_resp.status_code != 200:
            # Don't raise here, just return None so we can skip it in batch processing
            return None, None, None
        repo_data = repo_resp.json()

        # Fetch languages
        lang_resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}/languages")
        languages = lang_resp.json() if lang_resp.status_code == 200 else {}

        # Fetch README
        readme_resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}/readme")
        readme_content = ""
        if readme_resp.status_code == 200:
            import base64
            try:
                readme_content = base64.b64decode(readme_resp.json()["content"]).decode("utf-8")
            except:
                readme_content = "Could not decode README."
        
        return repo_data, languages, readme_content

async def run_llm(prompt: str, context_name: str):
    # Strategy: Prioritize GPU. If VRAM (4GB) is insufficient, offload to CPU/RAM.
    # Using llama3.1 (8B) which provides better analysis but will require mixed GPU/CPU execution on RTX 2050.
    model = "llama3.1:8b" 
    try:
        response = ollama.chat(model=model, messages=[
            {'role': 'user', 'content': prompt}
        ])
        content = response['message']['content']
        content = content.replace("```json", "").replace("```", "").strip()
        return {"raw_response": content, "repo_name": context_name}
    except ollama.ResponseError as e:
        if e.status_code == 404:
            print(f"Model {model} not found. Attempting to pull...")
            try:
                ollama.pull(model)
                # Retry once
                response = ollama.chat(model=model, messages=[
                    {'role': 'user', 'content': prompt}
                ])
                content = response['message']['content']
                content = content.replace("```json", "").replace("```", "").strip()
                return {"raw_response": content, "repo_name": context_name}
            except Exception as pull_error:
                return {"raw_response": json.dumps({"error": f"Failed to pull model {model}: {str(pull_error)}"}), "repo_name": context_name}
        return {"raw_response": json.dumps({"error": str(e)}), "repo_name": context_name}
    except Exception as e:
        print(f"Ollama error: {e}")
async def analyze_single_repo(owner: str, repo: str, token: str = None):
    repo_data, languages, readme = await fetch_github_data(owner, repo, token)
    if not repo_data:
        raise HTTPException(status_code=404, detail="Repository not found or private")

    prompt = f"""
    Analyze the following GitHub repository based on its README content.
    
    Repository: {repo_data.get('name')}
    
    README Content (truncated):
    {readme[:6000]}
    
    (Languages detected by GitHub: {', '.join(languages.keys())})
    
    Please extract the following details strictly from the README:
    1. A comprehensive description of what the project does.
    2. The detailed tech stack (languages, frameworks, libraries, tools).
    3. Key features or capabilities of the project.
    
    Format the output as a valid JSON object with keys: 
    - "what_it_does" (string)
    - "tech_stack" (list of strings)
    - "key_features" (list of strings)
    
    Do not include any markdown formatting like ```json. Just the raw JSON string.
    """
    
    return await run_llm(prompt, repo_data.get('name'))

def save_to_dataset(repos_data: List[Dict[str, Any]], username: str):
    """
    Saves extracted repository information into a JSONL file in Git_details/{username}/
    Also generates a fine-tuning dataset in 'alpaca' format for the 'energetic friend' persona.
    """
    base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Git_details", username)
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)
        
    # 1. Save raw data for RAG
    dataset_path = os.path.join(base_dir, "data.jsonl")
    with open(dataset_path, "a", encoding="utf-8") as f:
        for repo in repos_data:
            f.write(json.dumps(repo) + "\n")
            
    # 2. Save Fine-Tuning Data (Alpaca Format)
    ft_path = os.path.join(base_dir, "fine_tune_data.jsonl")
    with open(ft_path, "a", encoding="utf-8") as f:
        for repo in repos_data:
            name = repo.get("name", "Project")
            desc = repo.get("what_it_does", "A cool project.")
            stack = ", ".join(repo.get("tech_stack", []))
            features = ", ".join(repo.get("key_features", []))
            
            # Instruction 1: Describe the project
            entry1 = {
                "instruction": f"What is the project {name} about?",
                "input": "",
                "output": f"Yo! So {name} is this awesome project that {desc} It's built using {stack}. Check it out!"
            }
            f.write(json.dumps(entry1) + "\n")
            
            # Instruction 2: Resume Bullet Point
            entry2 = {
                "instruction": f"Write a resume bullet point for {name}.",
                "input": "",
                "output": f"🚀 Engineered {name}, a high-impact solution that {desc}, leveraging {stack} to deliver {features}."
            }
            f.write(json.dumps(entry2) + "\n")
            
            # Instruction 3: Tech Stack
            entry3 = {
                "instruction": f"What tech stack does {name} use?",
                "input": "",
                "output": f"For {name}, we went full beast mode with {stack}! It's a solid setup for this kind of work."
            }
            f.write(json.dumps(entry3) + "\n")
    
    print(f"Saved {len(repos_data)} repos to {dataset_path} and fine-tuning data to {ft_path}")

async def analyze_user_profile(owner: str, token: str, username: str):
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"

    async with httpx.AsyncClient(follow_redirects=True, headers=headers) as client:
        # Fetch user repos
        repos_resp = await client.get(f"https://api.github.com/users/{owner}/repos?per_page=100&sort=updated")
        if repos_resp.status_code != 200:
            print(f"Failed to fetch repos for {owner}: {repos_resp.status_code}")
            return {"type": "profile", "owner": owner, "repos": []}
        repos = repos_resp.json()

    # Fetch details for all repos with concurrency limit
    print(f"Found {len(repos)} repos. Fetching details...")
    sem = asyncio.Semaphore(5) # Limit to 5 concurrent requests to avoid rate limits

    async def fetch_with_sem(repo_name):
        async with sem:
            # Add a small delay to be nice to the API
            await asyncio.sleep(0.5)
            return await fetch_github_data(owner, repo_name, token)

    tasks = [fetch_with_sem(r['name']) for r in repos]
    results = await asyncio.gather(*tasks)
    
    # Filter out failed fetches
    valid_results = [r for r in results if r[0] is not None]
    print(f"Successfully fetched details for {len(valid_results)}/{len(repos)} repos.")
    
    if not valid_results:
        return {"type": "profile", "owner": owner, "repos": []}

    # Process in batches of 5
    batch_size = 5
    final_repos = []
    
    for i in range(0, len(valid_results), batch_size):
        batch = valid_results[i:i + batch_size]
        
        prompt = f"Analyze the following {len(batch)} GitHub repositories for user '{owner}'.\n\n"
        
        for j, (repo_data, languages, readme) in enumerate(batch):
            prompt += f"""
            --- Repository {j+1} ---
            Name: {repo_data.get('name')}
            Description: {repo_data.get('description')}
            Languages: {', '.join(languages.keys())}
            README (truncated): {readme[:1000]}
            ------------------------
            """
        
        prompt += """
        For EACH repository, provide:
        1. Name
        2. A concise explanation of what it does (based on README).
        3. The tech stack used.
        4. Key features (max 3).

        Format the output as a valid JSON LIST of objects. 
        Example: [{"name": "repo1", "what_it_does": "...", "tech_stack": ["..."], "key_features": ["..."]}, ...]
        Do not include any markdown formatting. Just the raw JSON string.
        """
        
        print(f"Debug: Processing batch {i//batch_size + 1}...")
        llm_response = await run_llm(prompt, f"{owner}'s Profile Batch {i}")
        
        try:
            raw = llm_response['raw_response']
            # Try to find a JSON list in the response using regex
            import re
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                json_str = match.group(0)
                batch_parsed = json.loads(json_str)
            else:
                # Fallback to direct parsing
                batch_parsed = json.loads(raw)
                
            if isinstance(batch_parsed, list):
                final_repos.extend(batch_parsed)
            else:
                print(f"Warning: Batch {i} parsed but not a list: {type(batch_parsed)}")
                
        except Exception as e:
            print(f"Failed to parse batch {i}. Error: {e}")
            print(f"Raw response snippet: {llm_response['raw_response'][:200]}...")
            pass

    # Save to dataset
    if final_repos:
        save_to_dataset(final_repos, username)
        # Add to RAG
        for repo in final_repos:
            try:
                rag_service.add_repo_data(repo, username)
            except Exception as e:
                print(f"Failed to add {repo.get('name')} to RAG: {e}")

    return {
        "type": "profile",
        "owner": owner,
        "repos": final_repos
    } 


@app.post("/analyze")
async def analyze_repo(request: RepoRequest, current_user: User = Depends(get_current_user)):
    try:
        # Use user's GitHub URL if not provided
        target_url = request.url or current_user.github_url
        if not target_url:
             raise HTTPException(status_code=400, detail="No GitHub URL provided or found in profile")

        print(f"Received URL: '{target_url}'")
        
        clean_url = target_url.strip()
        
        # Remove protocol
        if clean_url.startswith("https://"):
            clean_url = clean_url[8:]
        elif clean_url.startswith("http://"):
            clean_url = clean_url[7:]
            
        # Remove domain
        if clean_url.startswith("github.com/"):
            clean_url = clean_url[11:]
        elif clean_url.startswith("www.github.com/"):
            clean_url = clean_url[15:]
            
        parts = [p for p in clean_url.split("/") if p]
        
        if len(parts) == 0:
             raise HTTPException(status_code=400, detail="Invalid URL")
        
        owner = parts[0]
        if len(parts) == 1:
            # User Profile Mode
            print(f"Debug: Analyzing profile for owner={owner}")
            return await analyze_user_profile(owner, current_user.github_token, current_user.username)
        else:
            # Single Repo Mode
            repo = parts[1]
            if repo.endswith(".git"):
                repo = repo[:-4]
            print(f"Debug: Analyzing repo owner={owner}, repo={repo}")
            result = await analyze_single_repo(owner, repo, current_user.github_token)
            
            # Save single repo to dataset
            try:
                parsed = json.loads(result['raw_response'])
                # Add name if missing
                if 'name' not in parsed:
                    parsed['name'] = result['repo_name']
                save_to_dataset([parsed], current_user.username)
                
                # Add to RAG
                try:
                    rag_service.add_repo_data(parsed, current_user.username)
                except Exception as e:
                    print(f"Failed to add {result['repo_name']} to RAG: {e}")
                
                return {
                    "type": "repo",
                    "repo_name": result['repo_name'],
                    "data": parsed
                }
            except:
                return {
                    "type": "repo",
                    "repo_name": result['repo_name'],
                    "raw_response": result['raw_response']
                }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fine-tune")
async def trigger_fine_tuning(current_user: User = Depends(get_current_user), background_tasks: BackgroundTasks = BackgroundTasks()):
    """
    Triggers the fine-tuning process for the current user.
    Runs in the background.
    """
    try:
        # Check if data exists
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Git_details", current_user.username, "fine_tune_data.jsonl")
        if not os.path.exists(data_path):
            raise HTTPException(status_code=400, detail="No training data found. Please analyze your GitHub profile first.")

        # Import here to avoid startup errors if unsloth is missing
        try:
            from backend.fine_tune_service import fine_tune_model
        except ImportError:
            try:
                from fine_tune_service import fine_tune_model
            except ImportError:
                raise HTTPException(status_code=500, detail="Unsloth is not installed. Please install it to use GPU fine-tuning.")

        # Run in background
        background_tasks.add_task(fine_tune_model, current_user.username)
        
        return {"status": "started", "message": "Fine-tuning started in background. This may take a while."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/gpu-status")
def get_gpu_status():
    try:
        import torch
        return {
            "cuda_available": torch.cuda.is_available(),
            "device_count": torch.cuda.device_count(),
            "current_device": torch.cuda.current_device() if torch.cuda.is_available() else None,
            "device_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
        }
    except ImportError:
        return {"error": "PyTorch not installed"}

from fastapi.staticfiles import StaticFiles

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return FileResponse("template/login.html")

@app.get("/register", response_class=HTMLResponse)
async def read_register():
    return FileResponse("template/register.html")

@app.get("/dashboard", response_class=HTMLResponse)
async def read_dashboard():
    return FileResponse("template/dashboard.html")

@app.get("/settings", response_class=HTMLResponse)
async def read_settings():
    return FileResponse("template/settings.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

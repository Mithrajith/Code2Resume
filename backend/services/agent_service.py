import ollama
import os
from .rag_service import RAGService

class AgentService:
    def __init__(self):
        self.rag = RAGService()

    def ask(self, query: str, username: str, model: str = "llama3.1"):
        # Check for resume generation intent
        if "resume" in query.lower() or "cv" in query.lower():
            return self.generate_resume(query, username, model)

        # 1. Retrieve context
        results = self.rag.query(query, username=username)
        
        documents = results.get('documents', [[]])[0]
        
        if not documents:
            context = "No specific project information found."
        else:
            context = "\n---\n".join(documents)

        # 2. Construct prompt
        prompt = f"""
You are an intelligent assistant helping a developer create a resume or portfolio content based on their GitHub projects.
Use the following retrieved context about the user's projects to answer the question or fulfill the request.

Context from analyzed repositories:
{context}

User Request: {query}

Instructions:
- Use the provided context to give accurate details about the projects.
- If the context doesn't contain the answer, say so, but try to infer from the tech stacks if possible.
- Format the output clearly (Markdown is supported).
"""

        # 3. Generate response
        print(f"Agent querying {model} with context length {len(context)}")
        try:
            response = ollama.chat(model=model, messages=[
                {'role': 'user', 'content': prompt},
            ])
            return response['message']['content']
        except Exception as e:
            return f"Error generating response: {str(e)}"

    def generate_resume(self, query: str, username: str, model: str):
        # 1. Get all project context (fetch more results)
        results = self.rag.query("List all projects and their details", username=username, n_results=10)
        documents = results.get('documents', [[]])[0]
        context = "\n---\n".join(documents) if documents else "No project data found."

        # 2. Read LaTeX template
        template_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "LateX_template", "rezume.tex")
        try:
            with open(template_path, "r") as f:
                template_content = f.read()
        except FileNotFoundError:
            return "Error: Resume template not found."

        # 3. Construct Prompt
        prompt = f"""
You are an expert Resume Writer and LaTeX developer.
The user wants a resume for the following request: "{query}"

Here is the user's project history (from GitHub):
{context}

Here is the LaTeX template to use:
```tex
{template_content}
```

**Instructions:**
1.  **Role Customization**: Identify the target job role from the user's request (e.g., "ML Engineer", "Full Stack Dev"). If not specified, infer it from the projects.
2.  **Fill the Template**:
    *   Update the `\\section{{Full Stack Developer}}` to the target role (e.g., `\\section{{Machine Learning Engineer}}`).
    *   Update the **Summary** to reflect the target role and the user's skills.
    *   Update **Technical Skills** based on the projects provided.
    *   **Projects Section**: Replace the placeholder projects with the REAL projects from the context. Use `\\resumeTrioHeading` or `\\resumeQuadHeading` as appropriate.
        *   Select the most relevant projects for the target role.
        *   Write 3-4 bullet points for each project, highlighting achievements and tech stack.
    *   **Experience/Education**: Leave placeholders (like "Anycompany", "University of Anystate") if you don't have that info, but fill in what you can or leave comments like `% TODO: User to fill`.
    *   **Contact Info**: Leave placeholders like "Jane Doe" but you can put "{username}" as a placeholder name.
3.  **Output Format**: Return **ONLY** the valid LaTeX code. Do not include markdown formatting like "Here is your resume...". Start directly with `\\documentclass`.
"""

        print(f"Generating resume with {model}...")
        try:
            response = ollama.chat(model=model, messages=[
                {'role': 'user', 'content': prompt},
            ])
            content = response['message']['content']
            
            # Clean up markdown code blocks if the model adds them
            if content.startswith("```tex"):
                content = content[6:]
            if content.startswith("```latex"):
                content = content[8:]
            if content.endswith("```"):
                content = content[:-3]
                
            return f"Here is your generated LaTeX resume. You can compile this using Overleaf or a local LaTeX editor.\n\n```latex\n{content.strip()}\n```"
        except Exception as e:
            return f"Error generating resume: {str(e)}"


import ollama
from .rag_service import RAGService

class AgentService:
    def __init__(self):
        self.rag = RAGService()

    def ask(self, query: str, username: str, model: str = "llama3.1"):
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

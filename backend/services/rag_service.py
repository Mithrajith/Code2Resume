import chromadb
from chromadb.utils import embedding_functions
from chromadb.config import Settings
import os
import json

class RAGService:
    def __init__(self, persist_directory="./chroma_db"):
        # Ensure directory exists
        if not os.path.exists(persist_directory):
            os.makedirs(persist_directory)
            
        # Disable telemetry to avoid posthog errors
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        # Use a lightweight local model for embeddings
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
        
        self.collection = self.client.get_or_create_collection(
            name="github_repos",
            embedding_function=self.embedding_fn
        )

    def add_repo_data(self, repo_data: dict, username: str):
        """
        Adds a repository analysis result to the vector store.
        """
        documents = []
        metadatas = []
        ids = []

        repo_name = repo_data.get("name", "unknown")
        description = repo_data.get("description", "")
        # Handle tech_stack being a list or string
        tech_stack = repo_data.get("tech_stack", [])
        if isinstance(tech_stack, list):
            tech_stack = ", ".join(tech_stack)
            
        # Handle features being a list or string
        features = repo_data.get("features", [])
        if isinstance(features, list):
            features = "; ".join(features)
        
        # Create a rich text representation for the main summary
        text_content = f"Project: {repo_name}\nDescription: {description}\nTech Stack: {tech_stack}\nFeatures: {features}"
        
        documents.append(text_content)
        # Add username to metadata for filtering
        metadatas.append({"name": repo_name, "type": "repo_summary", "username": username})
        # Make ID unique per user
        ids.append(f"{username}_{repo_name}_summary")

        # Upsert handles both insert and update
        self.collection.upsert(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"Indexed {repo_name} for user {username} into RAG store.")

    def query(self, query_text: str, username: str, n_results: int = 3):
        """
        Searches for relevant documents for a specific user.
        """
        # Check if collection is empty
        if self.collection.count() == 0:
            return {"documents": [[]], "metadatas": [[]]}

        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where={"username": username}  # Filter by username
        )
        return results

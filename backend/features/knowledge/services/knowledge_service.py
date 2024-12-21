import logging
from typing import List

import chromadb
from chromadb.config import Settings
from django.conf import settings
from ollama import Client

from features.knowledge.repositories.knowledge_repository import KnowledgeRepository
from api.utils.exceptions import NotFoundException


class KnowledgeService:
    def __init__(self):
        self.repository = KnowledgeRepository()
        self.logger = logging.getLogger(__name__)
        self.ollama_client = Client(host=settings.OLLAMA_ENDPOINT)

        # Initialize ChromaDB with new client configuration
        self.chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False, allow_reset=False, is_persistent=True),
        )

        # Create or get collection with updated configuration
        self.collection = self.chroma_client.get_or_create_collection(
            name="knowledge_embeddings",
            metadata={"hnsw:space": "cosine"},
            embedding_function=None,  # We're using Ollama for embeddings
        )

    def create_knowledge(self, data: dict, user):
        """Create a new knowledge document"""
        try:
            # First create in Django for metadata
            data["user"] = user
            knowledge = self.repository.create(data)

            # Generate embedding and store in ChromaDB
            embedding = self._generate_embedding(data["content"])
            self.collection.add(
                ids=[str(knowledge.id)],
                embeddings=[embedding],
                documents=[data["content"]],
                metadatas=[
                    {
                        "user_id": str(user.id),
                        "name": data["name"],
                        "identifier": data["identifier"],
                    }
                ],
            )
            return knowledge
        except Exception as e:
            self.logger.error(f"Error creating knowledge: {str(e)}")
            raise

    def get_knowledge(self, knowledge_id: int, user_id: int):
        """Get knowledge by ID"""
        knowledge = self.repository.get_by_id(knowledge_id)
        if not knowledge or knowledge.user_id != user_id:
            raise NotFoundException("Knowledge document not found")
        return knowledge

    def get_by_identifier(self, identifier: str, user_id: int):
        """Get knowledge by identifier"""
        knowledge = self.repository.get_by_identifier(identifier, user_id)
        if not knowledge:
            raise NotFoundException("Knowledge document not found")
        return knowledge

    def list_knowledge(self, user_id: int):
        """List knowledge documents"""
        return self.repository.get_user_knowledge(user_id)

    def update_knowledge(self, knowledge_id: int, data: dict, user_id: int):
        """Update knowledge document and its embedding"""
        try:
            # Verify ownership and get knowledge
            knowledge = self.get_knowledge(knowledge_id, user_id)

            # Update Django model
            updated = self.repository.update(knowledge.id, data)

            # Update ChromaDB if content changed
            if "content" in data:
                embedding = self._generate_embedding(data["content"])
                self.collection.update(
                    ids=[str(knowledge_id)],
                    embeddings=[embedding],
                    documents=[data["content"]],
                    metadatas=[
                        {
                            "user_id": str(user_id),
                            "name": data.get("name", knowledge.name),
                            "identifier": data.get("identifier", knowledge.identifier),
                        }
                    ],
                )

            return updated
        except Exception as e:
            self.logger.error(f"Error updating knowledge: {str(e)}")
            raise

    def delete_knowledge(self, knowledge_id: int, user_id: int):
        """Delete knowledge document from both Django and ChromaDB"""
        try:
            # Verify ownership and get knowledge
            knowledge = self.get_knowledge(knowledge_id, user_id)

            # Delete from both storages
            self.repository.delete(knowledge.id)
            self.collection.delete(ids=[str(knowledge_id)])
            return True
        except Exception as e:
            self.logger.error(f"Error deleting knowledge: {str(e)}")
            raise

    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Ollama"""
        try:
            response = self.ollama_client.embeddings(model=settings.EMBEDDING_MODEL, prompt=text)
            return response["embedding"]
        except Exception as e:
            self.logger.error(f"Error generating embedding: {str(e)}")
            raise

    def find_relevant_context(self, query: str, user_id: int, max_results: int = 3) -> List[dict]:
        """Find relevant knowledge documents using ChromaDB"""
        try:
            query_embedding = self._generate_embedding(query)
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=max_results,
                where={"user_id": str(user_id)},
                include=["documents", "metadatas", "distances"],
            )

            return [
                {
                    "content": doc,
                    "metadata": meta,
                    "similarity": 1 - dist,  # Convert distance to similarity score
                }
                for doc, meta, dist in zip(
                    results["documents"][0], results["metadatas"][0], results["distances"][0]
                )
            ]
        except Exception as e:
            self.logger.error(f"Error finding relevant context: {str(e)}")
            return []

    def bulk_create_knowledge(self, data_list: List[dict], user):
        """Bulk create knowledge documents"""
        try:
            # First create all documents in Django
            knowledge_docs = []
            for data in data_list:
                data["user"] = user
                knowledge = self.repository.create(data)
                knowledge_docs.append(knowledge)

            # Generate embeddings and store in ChromaDB
            embeddings = [self._generate_embedding(data["content"]) for data in data_list]

            self.collection.add(
                ids=[str(k.id) for k in knowledge_docs],
                embeddings=embeddings,
                documents=[data["content"] for data in data_list],
                metadatas=[
                    {
                        "user_id": str(user.id),
                        "name": data["name"],
                        "identifier": data["identifier"],
                    }
                    for data in data_list
                ],
            )

            return knowledge_docs
        except Exception as e:
            self.logger.error(f"Error in bulk create knowledge: {str(e)}")
            raise

    async def reindex_all_knowledge(self):
        """Reindex all knowledge documents in ChromaDB"""
        try:
            # Clear the collection
            self.collection.delete(where={})

            # Get all knowledge documents
            all_knowledge = self.repository.list()

            # Batch process to avoid memory issues
            batch_size = 100
            for i in range(0, len(all_knowledge), batch_size):
                batch = all_knowledge[i : i + batch_size]

                embeddings = [self._generate_embedding(k.content) for k in batch]

                self.collection.add(
                    ids=[str(k.id) for k in batch],
                    embeddings=embeddings,
                    documents=[k.content for k in batch],
                    metadatas=[
                        {"user_id": str(k.user_id), "name": k.name, "identifier": k.identifier}
                        for k in batch
                    ],
                )

            return True
        except Exception as e:
            self.logger.error(f"Error reindexing knowledge: {str(e)}")
            raise

    def get_embeddings(self, knowledge_id: int, user_id: int) -> List[float]:
        """Get embeddings for a specific knowledge document"""
        try:
            # First verify ownership
            knowledge = self.get_knowledge(knowledge_id, user_id)

            # Get embeddings from ChromaDB
            result = self.collection.get(ids=[str(knowledge_id)], include=["embeddings"])

            # Handle numpy array properly
            if result and "embeddings" in result and len(result["embeddings"]) > 0:
                # Convert numpy array to list and get first embedding
                embeddings = result["embeddings"][0]
                return embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings

            # If no embeddings found, generate new ones
            embedding = self._generate_embedding(knowledge.content)

            # Store in ChromaDB
            self.collection.upsert(
                ids=[str(knowledge_id)],
                embeddings=[embedding],
                documents=[knowledge.content],
                metadatas=[
                    {
                        "user_id": str(user_id),
                        "name": knowledge.name,
                        "identifier": knowledge.identifier,
                    }
                ],
            )

            return embedding

        except Exception as e:
            self.logger.error(f"Error getting embeddings for knowledge {knowledge_id}: {str(e)}")
            raise

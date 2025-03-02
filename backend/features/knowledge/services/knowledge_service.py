import logging
from typing import List, Dict, Any, Optional
import os
import tempfile
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor
import traceback
import time

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
        
        # Create executor for background processing
        self.executor = ThreadPoolExecutor(max_workers=2)

    def create_knowledge_with_file(self, data: dict, user, file) -> Any:
        """
        Create a new knowledge document from a file.
        This method handles the initial creation with processing status,
        then processes the file in the background.
        
        Args:
            data: The knowledge document data
            user: The user creating the document
            file: The uploaded file object
            
        Returns:
            The created knowledge document
        """
        try:
            # First create the knowledge document with processing status
            data["user"] = user
            data["status"] = "processing"  # Explicitly set status to processing
            knowledge = self.repository.create(data)
            
            # Use a unique task ID to prevent duplicate processing
            task_id = f"process_file_{knowledge.id}"
            
            # Check if this task is already running
            if not hasattr(self, '_processing_tasks'):
                self._processing_tasks = set()
            
            if task_id in self._processing_tasks:
                self.logger.warning(f"File processing for knowledge {knowledge.id} is already in progress")
            else:
                # Mark this task as running
                self._processing_tasks.add(task_id)
                
                # Create a file-like object with the file content to avoid closed file issues
                file_info = {
                    'name': file.name,
                    'content_type': file.content_type,
                    'size': file.size
                }
                
                # Read the file content into memory first
                try:
                    if hasattr(file, 'read'):
                        file_content = file.read()
                        file_info['content'] = file_content
                    else:
                        # If file is already closed, try to open it from the path
                        try:
                            with open(file.temporary_file_path(), 'rb') as f:
                                file_content = f.read()
                                file_info['content'] = file_content
                        except (AttributeError, FileNotFoundError):
                            # If we can't get the file content, raise an error
                            raise ValueError(f"Could not read file content for {file.name}")
                except Exception as e:
                    self.logger.error(f"Error reading file content: {str(e)}")
                    raise
                
                # Process the file in the background with the file info instead of the file object
                future = self.executor.submit(self._process_file_with_content, knowledge, file_info)
                
                # Add a callback to remove the task ID when done
                def _task_done_callback(future):
                    try:
                        self._processing_tasks.remove(task_id)
                    except KeyError:
                        pass
                
                future.add_done_callback(_task_done_callback)
            
            return knowledge
        except Exception as e:
            self.logger.error(f"Error creating knowledge with file: {str(e)}")
            raise
    
    def _process_file_with_content(self, knowledge, file_info):
        """
        Process a file using its content that was already read into memory.
        
        Args:
            knowledge: The knowledge document to update
            file_info: Dictionary containing file information and content
        """
        try:
            self.logger.info(f"Processing file {file_info['name']} for knowledge {knowledge.id}")
            
            # Create a temporary file to store the file content
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Write the content to the temporary file
                temp_file.write(file_info['content'])
                temp_file_path = temp_file.name
            
            try:
                # Process the file based on its type
                content = ""
                chunks = []
                metadata = {}
                
                file_type = file_info['content_type'].lower()
                
                if "pdf" in file_type:
                    # Process PDF file
                    content, chunks, metadata = self._process_pdf(temp_file_path, knowledge.name)
                elif "text" in file_type or file_info['name'].endswith('.txt'):
                    # Process text file
                    with open(temp_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    text_chunks = self._chunk_text(content)
                    # Convert text chunks to the expected dictionary format
                    chunks = []
                    for i, chunk_text in enumerate(text_chunks):
                        chunk_id = f"{file_info['name']}_c{i}"
                        chunks.append({
                            "id": chunk_id,
                            "content": chunk_text,
                            "metadata": {
                                "source": file_info['name'],
                                "chunk": i,
                                "citation": file_info['name']
                            }
                        })
                    metadata = {"source": file_info['name']}
                elif "csv" in file_type or file_info['name'].endswith('.csv'):
                    # Process CSV file
                    content, chunks, metadata = self._process_csv(temp_file_path)
                else:
                    # Default processing for other file types
                    with open(temp_file_path, 'rb') as f:
                        binary_content = f.read()
                    try:
                        content = binary_content.decode('utf-8', errors='ignore')
                    except:
                        content = f"Binary file content could not be processed: {file_info['name']}"
                    text_chunks = self._chunk_text(content)
                    # Convert text chunks to the expected dictionary format
                    chunks = []
                    for i, chunk_text in enumerate(text_chunks):
                        chunk_id = f"{file_info['name']}_c{i}"
                        chunks.append({
                            "id": chunk_id,
                            "content": chunk_text,
                            "metadata": {
                                "source": file_info['name'],
                                "chunk": i,
                                "citation": file_info['name']
                            }
                        })
                    metadata = {"source": file_info['name']}
                
                # Update the knowledge document with the processed content
                self.repository.update(knowledge.id, {
                    "content": content,
                    "status": "ready",
                })
                
                # Store chunks in ChromaDB with metadata for citation
                self._store_chunks_in_chroma(knowledge.id, chunks, metadata, knowledge.user_id)
                
                self.logger.info(f"Successfully processed file for knowledge {knowledge.id}")
            finally:
                # Clean up the temporary file
                os.unlink(temp_file_path)
                
        except Exception as e:
            self.logger.error(f"Error processing file: {str(e)}")
            traceback.print_exc()
            # Update knowledge document with error status
            self.repository.update(knowledge.id, {
                "status": "error",
                "error_message": str(e),
            })
    
    def _process_pdf(self, file_path, document_name):
        """
        Process a PDF file and extract its content with page information.
        
        Args:
            file_path: Path to the PDF file
            document_name: Name of the document
            
        Returns:
            Tuple of (full_content, chunks, metadata)
        """
        try:
            # Import PyPDF2 here to avoid dependency issues
            import PyPDF2
            
            full_content = ""
            chunks = []
            metadata = {"source": document_name, "type": "pdf"}
            
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                metadata["total_pages"] = len(pdf_reader.pages)
                
                for i, page in enumerate(pdf_reader.pages):
                    page_num = i + 1
                    page_text = page.extract_text()
                    
                    if page_text:
                        # Add page number to the content
                        page_content = f"Page {page_num}:\n{page_text}\n\n"
                        full_content += page_content
                        
                        # Create chunks from the page with citation metadata
                        page_chunks = self._chunk_text(page_text)
                        for j, chunk in enumerate(page_chunks):
                            chunk_id = f"{document_name}_p{page_num}_c{j}"
                            chunks.append({
                                "id": chunk_id,
                                "content": chunk,
                                "metadata": {
                                    "source": document_name,
                                    "page": page_num,
                                    "chunk": j,
                                    "citation": f"{document_name}, Page {page_num}"
                                }
                            })
            
            return full_content, chunks, metadata
        except ImportError:
            self.logger.error("PyPDF2 is not installed. Please install it to process PDF files.")
            raise Exception("PDF processing library not available")
        except Exception as e:
            self.logger.error(f"Error processing PDF: {str(e)}")
            raise
    
    def _process_csv(self, file_path):
        """
        Process a CSV file and extract its content.
        
        Args:
            file_path: Path to the CSV file
            
        Returns:
            Tuple of (full_content, chunks, metadata)
        """
        try:
            import csv
            
            full_content = ""
            chunks = []
            metadata = {"source": os.path.basename(file_path), "type": "csv"}
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                csv_reader = csv.reader(file)
                rows = list(csv_reader)
                
                # Get headers if available
                headers = rows[0] if rows else []
                metadata["headers"] = headers
                
                # Convert CSV to text format
                for i, row in enumerate(rows):
                    row_text = ", ".join(row)
                    full_content += f"Row {i+1}: {row_text}\n"
                    
                    # Create chunk for each row with citation metadata
                    chunk_id = f"{metadata['source']}_r{i+1}"
                    chunks.append({
                        "id": chunk_id,
                        "content": row_text,
                        "metadata": {
                            "source": metadata['source'],
                            "row": i+1,
                            "citation": f"{metadata['source']}, Row {i+1}"
                        }
                    })
            
            return full_content, chunks, metadata
        except Exception as e:
            self.logger.error(f"Error processing CSV: {str(e)}")
            raise
    
    def _chunk_text(self, text, chunk_size=1000, overlap=100):
        """
        Split text into overlapping chunks for better retrieval.
        
        Args:
            text: The text to chunk
            chunk_size: Maximum size of each chunk
            overlap: Number of characters to overlap between chunks
            
        Returns:
            List of text chunks
        """
        chunks = []
        if not text:
            return chunks
            
        # Split text into sentences to avoid cutting in the middle of sentences
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        current_chunk = ""
        for sentence in sentences:
            # If adding this sentence would exceed chunk size, save current chunk and start a new one
            if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
                chunks.append(current_chunk)
                # Start new chunk with overlap from the end of the previous chunk
                if len(current_chunk) > overlap:
                    current_chunk = current_chunk[-overlap:] + sentence
                else:
                    current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence
        
        # Add the last chunk if it's not empty
        if current_chunk:
            chunks.append(current_chunk)
            
        return chunks
    
    def _store_chunks_in_chroma(self, knowledge_id, chunks, metadata, user_id):
        """
        Store document chunks in ChromaDB with metadata for retrieval and citation.
        
        Args:
            knowledge_id: ID of the knowledge document
            chunks: List of chunks with content and metadata
            metadata: General metadata for the document
            user_id: ID of the user who owns the document
        """
        try:
            if not chunks:
                self.logger.warning(f"No chunks to store for knowledge {knowledge_id}")
                return
                
            # Log chunk information for debugging
            self.logger.debug(f"Storing {len(chunks)} chunks for knowledge {knowledge_id}")
            if chunks and isinstance(chunks[0], str):
                self.logger.warning(f"Chunks are strings, not dictionaries. Converting to proper format.")
                formatted_chunks = []
                for i, chunk_text in enumerate(chunks):
                    chunk_id = f"auto_{i}"
                    formatted_chunks.append({
                        "id": chunk_id,
                        "content": chunk_text,
                        "metadata": {
                            "source": metadata.get("source", "unknown"),
                            "chunk": i,
                            "citation": metadata.get("source", "unknown")
                        }
                    })
                chunks = formatted_chunks
                self.logger.debug(f"Converted {len(chunks)} string chunks to dictionary format")
            
            # Generate embeddings for all chunks
            embeddings = []
            ids = []
            documents = []
            metadatas = []
            
            for chunk in chunks:
                # Create a unique ID for this chunk
                try:
                    # Handle case where chunk might be a string instead of a dictionary
                    if isinstance(chunk, str):
                        self.logger.warning(f"Found string chunk instead of dictionary. Converting to proper format.")
                        chunk_text = chunk
                        chunk = {
                            "id": f"auto_{uuid.uuid4()}",
                            "content": chunk_text,
                            "metadata": {
                                "source": metadata.get("source", "unknown"),
                                "citation": metadata.get("source", "unknown")
                            }
                        }
                    
                    chunk_id = f"{knowledge_id}_{chunk['id']}" if 'id' in chunk else f"{knowledge_id}_{uuid.uuid4()}"
                    
                    # Log chunk information for debugging
                    self.logger.debug(f"Processing chunk: {chunk_id}")
                    self.logger.debug(f"Chunk type: {type(chunk)}")
                    self.logger.debug(f"Chunk keys: {chunk.keys() if isinstance(chunk, dict) else 'Not a dictionary'}")
                    
                    chunk_embedding = self._generate_embedding(chunk["content"])
                    
                    # Combine chunk metadata with document metadata
                    chunk_metadata = chunk.get("metadata", {})
                    combined_metadata = {
                        "user_id": str(user_id),
                        "knowledge_id": str(knowledge_id),
                        "source": metadata.get("source", ""),
                        **chunk_metadata
                    }
                    
                    embeddings.append(chunk_embedding)
                    ids.append(chunk_id)
                    documents.append(chunk["content"])
                    metadatas.append(combined_metadata)
                except Exception as e:
                    self.logger.error(f"Error generating embedding for chunk: {str(e)}")
                    self.logger.error(f"Chunk data: {chunk}")
                    traceback.print_exc()
                    continue
            
            if not embeddings:
                self.logger.warning(f"No valid embeddings generated for knowledge {knowledge_id}")
                return
                
            # Store in ChromaDB in batches to avoid memory issues
            batch_size = 50
            for i in range(0, len(embeddings), batch_size):
                end_idx = min(i + batch_size, len(embeddings))
                self.collection.add(
                    ids=ids[i:end_idx],
                    embeddings=embeddings[i:end_idx],
                    documents=documents[i:end_idx],
                    metadatas=metadatas[i:end_idx],
                )
            
            self.logger.info(f"Stored {len(chunks)} chunks for knowledge {knowledge_id} in ChromaDB")
        except Exception as e:
            self.logger.error(f"Error storing chunks in ChromaDB: {str(e)}")
            traceback.print_exc()

    def create_knowledge(self, data: dict, user):
        """Create a new knowledge document"""
        try:
            # First create in Django for metadata
            data["user"] = user
            knowledge = self.repository.create(data)

            # Generate embedding and store in ChromaDB
            embedding = self._generate_embedding(data["content"])
            
            # Store in ChromaDB
            self.collection.add(
                ids=[str(knowledge.id)],
                embeddings=[embedding],
                documents=[data["content"]],
                metadatas=[
                    {
                        "user_id": str(user.id),
                        "knowledge_id": str(knowledge.id),
                        "name": data["name"],
                        "identifier": data["identifier"],
                        "citation": data["name"]
                    }
                ],
            )
            return knowledge
        except Exception as e:
            self.logger.error(f"Error creating knowledge: {str(e)}")
            raise

    def get_knowledge(self, knowledge_id, user_id=None):
        """
        Get knowledge by ID.
        
        Args:
            knowledge_id: The UUID of the knowledge to get
            user_id: Optional user ID to filter by
            
        Returns:
            Knowledge object if found, None otherwise
        """
        try:
            print(f"DEBUG: KnowledgeService.get_knowledge: Getting knowledge with ID {knowledge_id}, user_id: {user_id}")
            # Pass the knowledge_id directly to the repository
            knowledge = self.repository.get_by_id(knowledge_id, user_id)
            if knowledge:
                print(f"DEBUG: KnowledgeService.get_knowledge: Found knowledge: {knowledge.name}")
            else:
                print(f"DEBUG: KnowledgeService.get_knowledge: Knowledge not found for ID: {knowledge_id}")
            return knowledge
        except Exception as e:
            print(f"DEBUG: KnowledgeService.get_knowledge: Error getting knowledge: {str(e)}")
            self.logger.error(f"Error getting knowledge: {str(e)}")
            return None

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
                
                # First delete existing entries for this knowledge document
                self.collection.delete(
                    where={"knowledge_id": str(knowledge_id)}
                )
                
                # Then add the updated content
                self.collection.add(
                    ids=[str(knowledge_id)],
                    embeddings=[embedding],
                    documents=[data["content"]],
                    metadatas=[
                        {
                            "user_id": str(user_id),
                            "knowledge_id": str(knowledge_id),
                            "name": data.get("name", knowledge.name),
                            "identifier": data.get("identifier", knowledge.identifier),
                            "citation": data.get("name", knowledge.name)
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
            
            # Delete all chunks associated with this knowledge document
            self.collection.delete(
                where={"knowledge_id": str(knowledge_id)}
            )
            
            return True
        except Exception as e:
            self.logger.error(f"Error deleting knowledge: {str(e)}")
            raise

    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Ollama"""
        max_retries = 3
        retry_delay = 1  # seconds
        
        for attempt in range(max_retries):
            try:
                if not text or len(text.strip()) == 0:
                    self.logger.warning("Attempted to generate embedding for empty text")
                    # Return a zero vector of appropriate dimension as fallback
                    return [0.0] * 768  # Common embedding dimension
                
                # Truncate very long texts to avoid issues with the embedding model
                # Most embedding models have a token limit (e.g., 8192 tokens)
                max_chars = 32000  # Approximate character limit (~8000 tokens)
                if len(text) > max_chars:
                    self.logger.warning(f"Text too long for embedding ({len(text)} chars), truncating to {max_chars} chars")
                    text = text[:max_chars]
                
                response = self.ollama_client.embeddings(model=settings.EMBEDDING_MODEL, prompt=text)
                
                if not response or "embedding" not in response:
                    self.logger.error(f"Invalid embedding response: {response}")
                    if attempt < max_retries - 1:
                        self.logger.info(f"Retrying embedding generation (attempt {attempt+1}/{max_retries})")
                        time.sleep(retry_delay)
                        continue
                    return [0.0] * 768  # Return zero vector as fallback
                    
                return response["embedding"]
            except Exception as e:
                self.logger.error(f"Error generating embedding (attempt {attempt+1}/{max_retries}): {str(e)}")
                traceback.print_exc()
                
                if attempt < max_retries - 1:
                    self.logger.info(f"Retrying embedding generation in {retry_delay} seconds")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    self.logger.error(f"Failed to generate embedding after {max_retries} attempts")
                    # Return a zero vector as fallback
                    return [0.0] * 768
        
        # This should not be reached, but just in case
        return [0.0] * 768

    def find_relevant_context(self, query: str, user_id: int, max_results: int = 3) -> List[dict]:
        """Find relevant knowledge documents using ChromaDB"""
        try:
            if not query or len(query.strip()) == 0:
                self.logger.warning("Empty query provided to find_relevant_context")
                return []
            
            # Check if the user has any knowledge documents
            user_knowledge = self.repository.get_user_knowledge(user_id)
            if not user_knowledge or len(user_knowledge) == 0:
                self.logger.info(f"User {user_id} has no knowledge documents")
                return []
            
            self.logger.info(f"Generating embedding for query: {query[:50]}...")
            query_embedding = self._generate_embedding(query)
            
            # Check if we have a valid embedding
            if not query_embedding or all(v == 0 for v in query_embedding):
                self.logger.warning("Failed to generate valid embedding for query")
                return []
            
            # Query ChromaDB for relevant chunks
            self.logger.info(f"Querying ChromaDB for user {user_id} with query: {query[:50]}...")
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=max_results * 3,  # Get more results than needed to filter
                where={"user_id": str(user_id)},
                include=["documents", "metadatas", "distances"],
            )
            
            if not results or not results["documents"] or len(results["documents"][0]) == 0:
                self.logger.info(f"No relevant context found for query: {query[:50]}...")
                return []

            # Process and format results
            formatted_results = []
            for i, (doc, meta, dist) in enumerate(zip(
                results["documents"][0], results["metadatas"][0], results["distances"][0]
            )):
                # Generate a unique ID for the chunk
                chunk_id = f"chunk_{meta.get('knowledge_id', '')}_{i}"
                
                # Calculate similarity score (1 - distance)
                similarity = 1 - dist
                
                # Only include results with reasonable similarity
                if similarity > 0.5:  # Adjust threshold as needed
                    formatted_results.append({
                        "id": chunk_id,  # Include the chunk ID
                        "content": doc,
                        "metadata": {
                            **meta,
                            "citation": meta.get("citation", meta.get("source", "Unknown Source"))
                        },
                        "similarity": similarity,
                    })
            
            # Sort by similarity and limit to max_results
            formatted_results.sort(key=lambda x: x["similarity"], reverse=True)
            result_count = len(formatted_results[:max_results])
            self.logger.info(f"Found {result_count} relevant documents with similarity > 0.5")
            
            return formatted_results[:max_results]
        except Exception as e:
            self.logger.error(f"Error finding relevant context: {str(e)}")
            traceback.print_exc()
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
            for i, (knowledge, data) in enumerate(zip(knowledge_docs, data_list)):
                try:
                    embedding = self._generate_embedding(data["content"])
                    
                    self.collection.add(
                        ids=[str(knowledge.id)],
                        embeddings=[embedding],
                        documents=[data["content"]],
                        metadatas=[
                            {
                                "user_id": str(user.id),
                                "knowledge_id": str(knowledge.id),
                                "name": data["name"],
                                "identifier": data["identifier"],
                                "citation": data["name"]
                            }
                        ],
                    )
                except Exception as e:
                    self.logger.error(f"Error processing document {i} in bulk create: {str(e)}")
                    # Continue with other documents

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
            batch_size = 50
            for i in range(0, len(all_knowledge), batch_size):
                batch = all_knowledge[i : i + batch_size]
                
                for knowledge in batch:
                    try:
                        embedding = self._generate_embedding(knowledge.content)
                        
                        self.collection.add(
                            ids=[str(knowledge.id)],
                            embeddings=[embedding],
                            documents=[knowledge.content],
                            metadatas=[
                                {
                                    "user_id": str(knowledge.user_id),
                                    "knowledge_id": str(knowledge.id),
                                    "name": knowledge.name,
                                    "identifier": knowledge.identifier,
                                    "citation": knowledge.name
                                }
                            ],
                        )
                    except Exception as e:
                        self.logger.error(f"Error reindexing knowledge {knowledge.id}: {str(e)}")
                        continue

            return True
        except Exception as e:
            self.logger.error(f"Error reindexing knowledge: {str(e)}")
            raise

    def get_embeddings(self, knowledge_id: int, user_id: int) -> List[float]:
        """Get embeddings for a specific knowledge document"""
        try:
            # First verify ownership
            knowledge = self.get_knowledge(knowledge_id, user_id)
            if not knowledge:
                self.logger.warning(f"Knowledge {knowledge_id} not found or not accessible by user {user_id}")
                return []

            # Get embeddings from ChromaDB
            result = self.collection.get(
                where={"knowledge_id": str(knowledge_id)},
                include=["embeddings"]
            )

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
                        "knowledge_id": str(knowledge_id),
                        "name": knowledge.name,
                        "identifier": knowledge.identifier,
                        "citation": knowledge.name
                    }
                ],
            )

            return embedding

        except Exception as e:
            self.logger.error(f"Error getting embeddings for knowledge {knowledge_id}: {str(e)}")
            return []

    def get_chunks_for_knowledge(self, knowledge_id):
        """
        Get all chunks for a specific knowledge document from ChromaDB.
        
        Args:
            knowledge_id: ID of the knowledge document
            
        Returns:
            List of chunks with content and metadata
        """
        try:
            # Query ChromaDB for all chunks with this knowledge_id
            results = self.collection.get(
                where={"knowledge_id": str(knowledge_id)},
                include=["documents", "metadatas"]
            )
            
            if not results or not results["documents"] or len(results["documents"]) == 0:
                self.logger.info(f"No chunks found for knowledge {knowledge_id}")
                
                # Try to get the knowledge document and create a chunk if it exists
                knowledge = self.repository.get_by_id(knowledge_id)
                if knowledge and knowledge.content:
                    self.logger.info(f"Creating fallback chunk for knowledge {knowledge_id}")
                    return [{
                        "content": knowledge.content,
                        "metadata": {
                            "knowledge_id": str(knowledge_id),
                            "user_id": str(knowledge.user_id),
                            "name": knowledge.name,
                            "citation": knowledge.name
                        }
                    }]
                return []
                
            # Format results
            chunks = []
            for i, (doc, meta) in enumerate(zip(results["documents"], results["metadatas"])):
                chunks.append({
                    "content": doc,
                    "metadata": meta
                })
                
            self.logger.info(f"Retrieved {len(chunks)} chunks for knowledge {knowledge_id}")
            return chunks
        except Exception as e:
            self.logger.error(f"Error getting chunks for knowledge {knowledge_id}: {str(e)}")
            traceback.print_exc()
            return []

    def get_citations_for_chunks(self, chunk_ids):
        """
        Get citation information for specific chunks.
        
        Args:
            chunk_ids: List of chunk IDs to retrieve citations for
            
        Returns:
            Dictionary mapping chunk IDs to citation information
        """
        try:
            if not chunk_ids:
                self.logger.warning("No chunk IDs provided for citation retrieval")
                return {}
                
            self.logger.info(f"Retrieving citations for {len(chunk_ids)} chunks")
            print(f"DEBUG: Retrieving citations for chunks: {chunk_ids}")
            
            # Extract knowledge IDs from chunk IDs (format: chunk_knowledge_id_index)
            knowledge_ids = set()
            chunk_to_knowledge_map = {}
            
            for chunk_id in chunk_ids:
                # Try to extract knowledge_id from chunk_id
                try:
                    if chunk_id.startswith("chunk_"):
                        parts = chunk_id.split("_")
                        if len(parts) >= 2:
                            knowledge_id = parts[1]
                            knowledge_ids.add(knowledge_id)
                            chunk_to_knowledge_map[chunk_id] = knowledge_id
                    else:
                        # For other formats, just use the chunk_id as is
                        chunk_to_knowledge_map[chunk_id] = chunk_id
                except Exception as e:
                    self.logger.warning(f"Could not parse knowledge_id from chunk_id {chunk_id}: {str(e)}")
                    continue
            
            print(f"DEBUG: Extracted knowledge IDs: {knowledge_ids}")
            
            # If we couldn't extract any knowledge IDs, return empty
            if not knowledge_ids:
                return {}
            
            # Query ChromaDB for chunks with these knowledge IDs
            citations = {}
            
            for knowledge_id in knowledge_ids:
                try:
                    # Query by knowledge_id
                    results = self.collection.get(
                        where={"knowledge_id": knowledge_id},
                        include=["metadatas"]
                    )
                    
                    if results and "metadatas" in results and results["metadatas"]:
                        # Use the first metadata entry for this knowledge_id
                        meta = results["metadatas"][0]
                        
                        # Extract citation information from metadata
                        citation_info = {
                            "source": meta.get("source", "Unknown Source"),
                            "citation": meta.get("citation", "Unknown Source"),
                            "knowledge_id": knowledge_id,
                        }
                        
                        # Add page/row information if available
                        if "page" in meta:
                            citation_info["page"] = meta["page"]
                        if "row" in meta:
                            citation_info["row"] = meta["row"]
                        
                        print(f"DEBUG: Found citation info for knowledge_id {knowledge_id}: {citation_info}")
                        
                        # Add this citation info to all chunks with this knowledge_id
                        for chunk_id, mapped_knowledge_id in chunk_to_knowledge_map.items():
                            if mapped_knowledge_id == knowledge_id:
                                citations[chunk_id] = citation_info
                                print(f"DEBUG: Added citation info for chunk {chunk_id}")
                except Exception as e:
                    self.logger.error(f"Error retrieving citation for knowledge_id {knowledge_id}: {str(e)}")
                    continue
            
            self.logger.info(f"Retrieved citation information for {len(citations)} chunks")
            print(f"DEBUG: Retrieved citation information for {len(citations)} chunks")
            return citations
        except Exception as e:
            self.logger.error(f"Error retrieving citations: {str(e)}")
            print(f"DEBUG: Error retrieving citations: {str(e)}")
            traceback.print_exc()
            return {}
            
    def format_citation(self, citation_info):
        """
        Format citation information into a human-readable string.
        
        Args:
            citation_info: Dictionary containing citation metadata
            
        Returns:
            Formatted citation string
        """
        try:
            if not citation_info:
                return "Unknown Source"
                
            # Start with the basic citation (usually the document name)
            citation = citation_info.get("citation", citation_info.get("source", "Unknown Source"))
            
            # Add page information if available
            if "page" in citation_info:
                citation = f"{citation}, Page {citation_info['page']}"
                
            # Add row information if available (for CSV files)
            if "row" in citation_info:
                citation = f"{citation}, Row {citation_info['row']}"
                
            return citation
        except Exception as e:
            self.logger.error(f"Error formatting citation: {str(e)}")
            return "Unknown Source"
            
    def get_citations_for_response(self, response_text, relevant_chunks):
        """
        Extract and format citations for a generated response based on relevant chunks.
        
        Args:
            response_text: The generated response text
            relevant_chunks: List of chunks used to generate the response
            
        Returns:
            Dictionary with citation information
        """
        try:
            self.logger.info(f"get_citations_for_response called with {len(relevant_chunks) if relevant_chunks else 0} chunks")
            print(f"DEBUG: get_citations_for_response called with {len(relevant_chunks) if relevant_chunks else 0} chunks")
            
            if not relevant_chunks:
                self.logger.warning("No relevant chunks provided for citation generation")
                return {"citations": [], "has_citations": False}
            
            # Log the structure of the first chunk to understand its format
            if relevant_chunks and len(relevant_chunks) > 0:
                first_chunk = relevant_chunks[0]
                self.logger.info(f"First chunk type: {type(first_chunk)}, content: {str(first_chunk)[:100]}...")
                print(f"DEBUG: First chunk type: {type(first_chunk)}, content: {str(first_chunk)[:100]}...")
                
                # If it's a dict, log its keys
                if isinstance(first_chunk, dict):
                    self.logger.info(f"First chunk keys: {list(first_chunk.keys())}")
                    print(f"DEBUG: First chunk keys: {list(first_chunk.keys())}")
                
            # Extract chunk IDs from relevant chunks
            chunk_ids = []
            chunk_metadata = {}  # Store metadata directly from chunks
            
            for chunk in relevant_chunks:
                if isinstance(chunk, dict):
                    # Try to get the ID from the chunk
                    chunk_id = None
                    
                    if "id" in chunk:
                        chunk_id = chunk["id"]
                    elif "chunk_id" in chunk:
                        chunk_id = chunk["chunk_id"]
                    elif "metadata" in chunk and "chunk_id" in chunk["metadata"]:
                        chunk_id = chunk["metadata"]["chunk_id"]
                    else:
                        # Generate a temporary ID
                        chunk_id = f"temp_chunk_{len(chunk_ids)}"
                        
                    chunk_ids.append(chunk_id)
                    print(f"DEBUG: Added chunk ID: {chunk_id}")
                    
                    # Store metadata directly if available
                    if "metadata" in chunk and isinstance(chunk["metadata"], dict):
                        chunk_metadata[chunk_id] = chunk["metadata"]
                        print(f"DEBUG: Stored metadata directly for chunk {chunk_id}")
                        
                elif isinstance(chunk, str):
                    # If chunk is a string ID
                    chunk_ids.append(chunk)
                    print(f"DEBUG: Added string chunk ID: {chunk}")
                else:
                    # Log unexpected chunk format
                    self.logger.warning(f"Unexpected chunk format: {type(chunk)}, {str(chunk)[:50]}...")
                    print(f"DEBUG: Unexpected chunk format: {type(chunk)}, {str(chunk)[:50]}...")
                    
            self.logger.info(f"Extracted {len(chunk_ids)} chunk IDs for citation retrieval")
            print(f"DEBUG: Extracted {len(chunk_ids)} chunk IDs for citation retrieval: {chunk_ids}")
            
            # If we have no chunk IDs, return empty citations
            if not chunk_ids:
                return {"citations": [], "has_citations": False}
                    
            # Get citation information for these chunks from ChromaDB
            citation_info = self.get_citations_for_chunks(chunk_ids)
            self.logger.info(f"Retrieved citation info for {len(citation_info)} chunks from ChromaDB")
            print(f"DEBUG: Retrieved citation info for {len(citation_info)} chunks from ChromaDB")
            
            # Merge with directly available metadata
            for chunk_id, metadata in chunk_metadata.items():
                if chunk_id not in citation_info:
                    # Use the metadata we already have
                    citation_info[chunk_id] = {
                        "source": metadata.get("source", "Unknown Source"),
                        "citation": metadata.get("citation", metadata.get("source", "Unknown Source")),
                        "knowledge_id": metadata.get("knowledge_id", ""),
                    }
                    
                    # Add page/row information if available
                    if "page" in metadata:
                        citation_info[chunk_id]["page"] = metadata["page"]
                    if "row" in metadata:
                        citation_info[chunk_id]["row"] = metadata["row"]
                        
                    print(f"DEBUG: Added citation info from chunk metadata for {chunk_id}")
            
            # Format citations and remove duplicates
            formatted_citations = []
            seen_citations = set()
            
            for chunk_id, info in citation_info.items():
                citation = self.format_citation(info)
                print(f"DEBUG: Formatted citation for chunk {chunk_id}: {citation}")
                if citation not in seen_citations:
                    seen_citations.add(citation)
                    formatted_citations.append({
                        "text": citation,
                        "chunk_id": chunk_id,
                        "knowledge_id": info.get("knowledge_id", ""),
                        "metadata": info
                    })
                    
            self.logger.info(f"Generated {len(formatted_citations)} unique citations")
            print(f"DEBUG: Generated {len(formatted_citations)} unique citations")
            
            return {
                "citations": formatted_citations,
                "has_citations": len(formatted_citations) > 0,
                "response_text": response_text
            }
        except Exception as e:
            self.logger.error(f"Error generating citations for response: {str(e)}")
            print(f"DEBUG: Error generating citations for response: {str(e)}")
            traceback.print_exc()
            return {"citations": [], "has_citations": False, "response_text": response_text}

    def _process_file(self, knowledge, file):
        """
        Process a file and update the knowledge document with its content.
        Handles different file types and creates embeddings.
        
        Args:
            knowledge: The knowledge document to update
            file: The file to process
        """
        try:
            self.logger.info(f"Processing file {file.name} for knowledge {knowledge.id}")
            
            # Create a file-like object with the file content to avoid closed file issues
            file_info = {
                'name': file.name,
                'content_type': file.content_type,
                'size': file.size
            }
            
            # Read the file content into memory first
            try:
                if hasattr(file, 'read'):
                    file_content = file.read()
                    file_info['content'] = file_content
                else:
                    # If file is already closed, try to open it from the path
                    try:
                        with open(file.temporary_file_path(), 'rb') as f:
                            file_content = f.read()
                            file_info['content'] = file_content
                    except (AttributeError, FileNotFoundError):
                        # If we can't get the file content, raise an error
                        raise ValueError(f"Could not read file content for {file.name}")
            except Exception as e:
                self.logger.error(f"Error reading file content: {str(e)}")
                raise
            
            # Delegate to the content-based processing method
            return self._process_file_with_content(knowledge, file_info)
                
        except Exception as e:
            self.logger.error(f"Error processing file: {str(e)}")
            traceback.print_exc()
            # Update knowledge document with error status
            self.repository.update(knowledge.id, {
                "status": "error",
                "error_message": str(e),
            })

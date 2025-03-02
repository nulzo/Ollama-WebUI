import os
import sys
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.settings")
django.setup()

from features.knowledge.services.knowledge_service import KnowledgeService
from features.authentication.models import CustomUser

def test_knowledge_service():
    """Test the knowledge service functionality"""
    print("Testing Knowledge Service...")
    
    # Initialize the service
    service = KnowledgeService()
    
    # Get a test user (you'll need to replace this with an actual user ID from your database)
    try:
        user = CustomUser.objects.first()
        if not user:
            print("No users found in the database. Please create a user first.")
            return
        print(f"Using test user: {user.username} (ID: {user.id})")
    except Exception as e:
        print(f"Error getting test user: {str(e)}")
        return
    
    # Test creating a knowledge document
    try:
        test_knowledge = service.create_knowledge({
            "name": "Test Knowledge",
            "identifier": f"test_knowledge_{int(django.utils.timezone.now().timestamp())}",
            "content": "This is a test knowledge document. It contains information about testing the knowledge service."
        }, user)
        print(f"Created test knowledge: {test_knowledge.name} (ID: {test_knowledge.id})")
    except Exception as e:
        print(f"Error creating test knowledge: {str(e)}")
        return
    
    # Test retrieving the knowledge document
    try:
        retrieved = service.get_knowledge(test_knowledge.id, user.id)
        if retrieved:
            print(f"Successfully retrieved knowledge: {retrieved.name}")
        else:
            print(f"Failed to retrieve knowledge with ID: {test_knowledge.id}")
            return
    except Exception as e:
        print(f"Error retrieving knowledge: {str(e)}")
        return
    
    # Test finding relevant context
    try:
        query = "Tell me about testing"
        results = service.find_relevant_context(query, user.id, max_results=3)
        print(f"Found {len(results)} relevant documents for query: '{query}'")
        for i, result in enumerate(results):
            print(f"Result {i+1}:")
            print(f"  Content: {result['content'][:100]}...")
            print(f"  Citation: {result['metadata'].get('citation', 'Unknown')}")
            print(f"  Similarity: {result['similarity']:.4f}")
    except Exception as e:
        print(f"Error finding relevant context: {str(e)}")
    
    # Test getting chunks
    try:
        chunks = service.get_chunks_for_knowledge(test_knowledge.id)
        print(f"Found {len(chunks)} chunks for knowledge document")
        for i, chunk in enumerate(chunks[:2]):  # Show first 2 chunks
            print(f"Chunk {i+1}:")
            print(f"  Content: {chunk['content'][:100]}...")
            print(f"  Metadata: {chunk['metadata']}")
    except Exception as e:
        print(f"Error getting chunks: {str(e)}")
    
    # Clean up - delete the test knowledge
    try:
        service.delete_knowledge(test_knowledge.id, user.id)
        print(f"Successfully deleted test knowledge: {test_knowledge.id}")
    except Exception as e:
        print(f"Error deleting test knowledge: {str(e)}")

if __name__ == "__main__":
    test_knowledge_service() 
import logging
from typing import List, Optional

from features.knowledge.models import Knowledge
from api.utils.interfaces.base_repository import BaseRepository

logger = logging.getLogger(__name__)


class KnowledgeRepository(BaseRepository[Knowledge]):
    def __init__(self):
        super().__init__(Knowledge)
        self.logger = logger

    def create(self, data: dict) -> Knowledge:
        """Create a new knowledge document"""
        try:
            knowledge = Knowledge.objects.create(
                user=data["user"],
                name=data["name"],
                content=data["content"],
                identifier=data["identifier"],
            )
            return knowledge
        except Exception as e:
            self.logger.error(f"Error creating knowledge: {str(e)}")
            raise

    def get_by_id(self, knowledge_id, user_id=None):
        """
        Get knowledge by ID.
        
        Args:
            knowledge_id: The UUID of the knowledge to get
            user_id: Optional user ID to filter by
            
        Returns:
            Knowledge object if found, None otherwise
        """
        try:
            print(f"DEBUG: Fetching knowledge with ID: {knowledge_id}, type: {type(knowledge_id)}")
            
            # Build the query
            query = {"id": knowledge_id}
            if user_id:
                query["user_id"] = user_id
                
            print(f"DEBUG: Query: {query}")
            
            # Get the knowledge
            knowledge = Knowledge.objects.get(**query)
            print(f"DEBUG: Found knowledge: {knowledge.name}")
            return knowledge
        except Knowledge.DoesNotExist:
            print(f"DEBUG: Knowledge with ID {knowledge_id} not found")
            self.logger.warning(f"Knowledge with ID {knowledge_id} not found")
            return None
        except Exception as e:
            print(f"DEBUG: Error fetching knowledge: {str(e)}")
            self.logger.error(f"Error fetching knowledge: {str(e)}")
            return None

    def list(self, filters: dict = None) -> List[Knowledge]:
        queryset = Knowledge.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return queryset.order_by("-created_at")

    def update(self, id: int, data: dict) -> Optional[Knowledge]:
        try:
            knowledge = self.get_by_id(id)
            if not knowledge:
                return None

            for key, value in data.items():
                setattr(knowledge, key, value)
            knowledge.save()
            return knowledge
        except Exception as e:
            self.logger.error(f"Error updating knowledge {id}: {str(e)}")
            raise

    def delete(self, id: int) -> bool:
        try:
            knowledge = self.get_by_id(id)
            if not knowledge:
                return False
            knowledge.delete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting knowledge {id}: {str(e)}")
            raise

    def get_user_knowledge(self, user_id: int) -> List[Knowledge]:
        """Get all knowledge documents for a specific user"""
        return self.list({"user_id": user_id})

    def get_by_identifier(self, identifier: str, user_id: int) -> Optional[Knowledge]:
        """Get a knowledge document by identifier and user"""
        try:
            return Knowledge.objects.get(identifier=identifier, user_id=user_id)
        except Knowledge.DoesNotExist:
            return None

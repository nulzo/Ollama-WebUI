import logging
from typing import Dict, List, Optional

from django.db import transaction

from features.tools.models import Tool
from api.utils.exceptions import ValidationError
from api.utils.interfaces.base_repository import BaseRepository

logger = logging.getLogger(__name__)


class ToolRepository(BaseRepository[Tool]):
    def __init__(self):
        super().__init__(Tool)
        self.logger = logger

    @transaction.atomic
    def create(self, data: dict) -> Tool:
        """Create a new tool"""
        try:
            tool = Tool.objects.create(
                name=data["name"],
                description=data.get("description", ""),
                function_content=data["function_content"],
                language=data.get("language", "python"),
                parameters=data["parameters"],
                returns=data["returns"],
                docstring=data["docstring"],
                is_enabled=data.get("is_enabled", True),
                created_by=data["created_by"],
            )
            return tool
        except Exception as e:
            self.logger.error(f"Error creating tool: {str(e)}")
            raise ValidationError(f"Failed to create tool: {str(e)}")

    def get_by_user(self, user_id: int) -> List[Tool]:
        """Get all tools created by a specific user"""
        return Tool.objects.filter(created_by_id=user_id)

    def get_enabled_tools(self) -> List[Tool]:
        """Get all enabled tools"""
        return Tool.objects.filter(is_enabled=True)

    def get_by_name_and_user(self, name: str, user_id: int) -> Optional[Tool]:
        """Get a tool by name and user"""
        try:
            return Tool.objects.get(name=name, created_by_id=user_id)
        except Tool.DoesNotExist:
            return None

import logging

from api.utils.exceptions import NotFoundException, ValidationError
from features.authentication.repositories.user_repository import UserRepository


class UserService:
    def __init__(self):
        self.repository = UserRepository()
        self.logger = logging.getLogger(__name__)

    async def create_user(self, data: dict):
        """Create a new user"""
        if await self.repository.get_by_email(data["email"]):
            raise ValidationError("Email already exists")
        if await self.repository.get_by_username(data["username"]):
            raise ValidationError("Username already exists")

        return await self.repository.create(data)

    async def get_user(self, user_id: int):
        """Get user by ID"""
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return user

    async def update_user(self, user_id: int, data: dict):
        """Update user"""
        user = await self.get_user(user_id)
        return await self.repository.update(user.id, data)

    async def delete_user(self, user_id: int):
        """Delete user"""
        user = await self.get_user(user_id)
        return await self.repository.delete(user.id)

    async def get_by_email(self, email: str):
        """Get user by email"""
        return await self.repository.get_by_email(email)

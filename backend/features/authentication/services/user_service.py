import logging

from api.utils.exceptions import NotFoundException, ValidationError
from features.authentication.repositories.user_repository import UserRepository

class UserService:
    def __init__(self):
        self.repository = UserRepository()
        self.logger = logging.getLogger(__name__)

    def create_user(self, data: dict):
        """Create a new user"""
        if self.repository.get_by_email(data["email"]):
            raise ValidationError("Email already exists")
        if self.repository.get_by_username(data["username"]):
            raise ValidationError("Username already exists")
        return self.repository.create(data)

    def get_user(self, user_id: int):
        """Get user by ID"""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return user

    def update_user(self, user_id: int, data: dict):
        """Update user"""
        # This will raise NotFoundException if user not found.
        self.get_user(user_id)
        updated_user = self.repository.update(user_id, data)
        if not updated_user:
            raise Exception("Failed to update user")
        return updated_user

    def delete_user(self, user_id: int):
        """Delete user"""
        self.get_user(user_id)
        if not self.repository.delete(user_id):
            raise Exception("Failed to delete user")
        return True

    def get_by_email(self, email: str):
        """Get user by email"""
        return self.repository.get_by_email(email)
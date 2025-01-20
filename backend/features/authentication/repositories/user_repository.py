import logging
from typing import List, Optional

from django.contrib.auth.hashers import make_password
from django.db import transaction

from features.authentication.models import CustomUser
from api.utils.interfaces.base_repository import BaseRepository


class UserRepository(BaseRepository[CustomUser]):
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @transaction.atomic
    async def create(self, data: dict) -> CustomUser:
        """Create a new user"""
        try:
            # Hash password if provided
            if password := data.get("password"):
                data["password"] = make_password(password)

            user = await CustomUser.objects.acreate(
                username=data["username"],
                email=data["email"],
                password=data["password"],
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                is_active=data.get("is_active", True),
            )
            self.logger.info(f"Created user {user.id}")
            return user
        except Exception as e:
            self.logger.error(f"Error creating user: {str(e)}")
            raise

    async def get_by_id(self, id: int) -> Optional[CustomUser]:
        try:
            return await CustomUser.objects.aget(id=id)
        except CustomUser.DoesNotExist:
            self.logger.warning(f"User {id} not found")
            return None

    async def get_by_uuid(self, uuid: str) -> Optional[CustomUser]:
        try:
            return await CustomUser.objects.aget(uuid=uuid)
        except CustomUser.DoesNotExist:
            self.logger.warning(f"User with UUID {uuid} not found")
            return None

    async def list(self, filters: dict = None) -> List[CustomUser]:
        queryset = CustomUser.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return await queryset.order_by("username").all()

    async def update(self, id: int, data: dict) -> Optional[CustomUser]:
        try:
            user = await self.get_by_id(id)
            if not user:
                return None

            # Hash password if it's being updated
            if password := data.get("password"):
                data["password"] = make_password(password)

            for key, value in data.items():
                setattr(user, key, value)
            await user.asave()
            return user
        except Exception as e:
            self.logger.error(f"Error updating user {id}: {str(e)}")
            return None

    async def delete(self, id: int) -> bool:
        try:
            user = await self.get_by_id(id)
            if not user:
                return False
            await user.adelete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting user {id}: {str(e)}")
            return False

    @transaction.atomic
    async def bulk_create(self, data_list: List[dict]) -> List[CustomUser]:
        try:
            users = []
            for data in data_list:
                if password := data.get("password"):
                    data["password"] = make_password(password)
                users.append(
                    CustomUser(
                        username=data["username"],
                        email=data["email"],
                        password=data["password"],
                        first_name=data.get("first_name", ""),
                        last_name=data.get("last_name", ""),
                        is_active=data.get("is_active", True),
                    )
                )
            return await CustomUser.objects.abulk_create(users)
        except Exception as e:
            self.logger.error(f"Error bulk creating users: {str(e)}")
            raise

    @transaction.atomic
    async def bulk_update(self, data_list: List[dict]) -> List[CustomUser]:
        try:
            updated_users = []
            for data in data_list:
                if user_id := data.get("id"):
                    if updated_user := await self.update(user_id, data):
                        updated_users.append(updated_user)
            return updated_users
        except Exception as e:
            self.logger.error(f"Error bulk updating users: {str(e)}")
            raise

    # Additional helper methods
    async def get_by_email(self, email: str) -> Optional[CustomUser]:
        """Get user by email"""
        try:
            return await CustomUser.objects.aget(email=email)
        except CustomUser.DoesNotExist:
            return None

    async def get_by_username(self, username: str) -> Optional[CustomUser]:
        """Get user by username"""
        try:
            return await CustomUser.objects.aget(username=username)
        except CustomUser.DoesNotExist:
            return None

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
    def create(self, data: dict) -> CustomUser:
        """Create a new user"""
        try:
            # Hash password if provided.
            if password := data.get("password"):
                data["password"] = make_password(password)

            user = CustomUser.objects.create(
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

    def get_by_id(self, id: int) -> Optional[CustomUser]:
        try:
            return CustomUser.objects.get(id=id)
        except CustomUser.DoesNotExist:
            self.logger.warning(f"User {id} not found")
            return None

    def get_by_uuid(self, uuid: str) -> Optional[CustomUser]:
        try:
            return CustomUser.objects.get(uuid=uuid)
        except CustomUser.DoesNotExist:
            self.logger.warning(f"User with UUID {uuid} not found")
            return None

    def list(self, filters: dict = None) -> List[CustomUser]:
        queryset = CustomUser.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return list(queryset.order_by("username").all())

    def update(self, id: int, data: dict) -> Optional[CustomUser]:
        try:
            user = self.get_by_id(id)
            if not user:
                return None

            if password := data.get("password"):
                data["password"] = make_password(password)

            for key, value in data.items():
                setattr(user, key, value)
            user.save()
            return user
        except Exception as e:
            self.logger.error(f"Error updating user {id}: {str(e)}")
            return None

    def delete(self, id: int) -> bool:
        try:
            user = self.get_by_id(id)
            if not user:
                return False
            user.delete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting user {id}: {str(e)}")
            return False

    @transaction.atomic
    def bulk_create(self, data_list: List[dict]) -> List[CustomUser]:
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
            created_users = CustomUser.objects.bulk_create(users)
            return created_users
        except Exception as e:
            self.logger.error(f"Error bulk creating users: {str(e)}")
            raise

    @transaction.atomic
    def bulk_update(self, data_list: List[dict]) -> List[CustomUser]:
        try:
            updated_users = []
            for data in data_list:
                if user_id := data.get("id"):
                    updated_user = self.update(user_id, data)
                    if updated_user:
                        updated_users.append(updated_user)
            return updated_users
        except Exception as e:
            self.logger.error(f"Error bulk updating users: {str(e)}")
            raise

    def get_by_email(self, email: str) -> Optional[CustomUser]:
        try:
            return CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return None

    def get_by_username(self, username: str) -> Optional[CustomUser]:
        try:
            return CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return None
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional

T = TypeVar('T')


class BaseRepository(ABC, Generic[T]):
    @abstractmethod
    async def create(self, data: dict) -> T:
        """Create a new record"""
        pass

    @abstractmethod
    async def get_by_id(self, id: int) -> Optional[T]:
        """Get a record by ID"""
        pass

    @abstractmethod
    async def list(self, filters: dict = None) -> List[T]:
        """List records with optional filters"""
        pass

    @abstractmethod
    async def update(self, id: int, data: dict) -> Optional[T]:
        """Update a record"""
        pass

    @abstractmethod
    async def delete(self, id: int) -> bool:
        """Delete a record"""
        pass

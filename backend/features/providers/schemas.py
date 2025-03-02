from typing import Dict, List, Optional, Union, Any, Literal
from pydantic import BaseModel, Field, validator

class Message(BaseModel):
    """Represents a chat message in the conversation."""
    role: Literal["system", "user", "assistant", "tool"] = Field(...)
    content: str = Field(...)
    name: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        extra = "forbid"  # Prevent additional fields

class TokenUsage(BaseModel):
    """Represents token usage statistics."""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

class ProviderConfig(BaseModel):
    """Base configuration for all providers."""
    endpoint: Optional[str] = None
    api_key: Optional[str] = None
    organization_id: Optional[str] = None
    is_enabled: bool = False
    
    class Config:
        extra = "allow"  # Allow additional provider-specific fields

class AnalyticsEvent(BaseModel):
    """Structure for analytics events."""
    event_type: str
    user_id: Any
    model: Optional[str] = None
    token_usage: Optional[TokenUsage] = None
    duration_ms: Optional[float] = None
    error: Optional[str] = None
    
    class Config:
        extra = "allow"  # Allow additional event-specific fields
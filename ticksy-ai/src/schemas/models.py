from typing import List, Literal, Dict, Any

from pydantic import BaseModel, Field
from src.schemas.suggestion import Suggestion


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1)


class CharResponse(BaseModel):
    message: str
    suggestion: List[Suggestion] = Field(default_factory=list)
    stage: Literal["query", "auth", "booking", "support", "cancel"] = "query"


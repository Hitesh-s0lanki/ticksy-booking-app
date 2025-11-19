from typing import List
from pydantic import BaseModel, Field

class PromptSuggestionState(BaseModel):
    suggestions: List[str] = Field(default_factory=list)
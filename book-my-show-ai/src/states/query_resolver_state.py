from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class QueryResolverState(BaseModel):
    source: Optional[Literal["movie", "event", "sports", "random"]] = Field(
        default=None, description="Domain of query; 'random' if unclear"
    )
    step: Optional[Literal["information", "suggestion"]] = Field(
        default=None, description="High-level intent for discovery vs lookup"
    )
    date: str = Field(
        description="Resolved date as DD-MM-YYYY; always present (defaults to today's IST date)"
    )
    location: Optional[str] = Field(
        default=None, description="City/region/venue string as provided by user"
    )
    genre: List[str] = Field(
        default_factory=list, description="Lowercased genres; deduped"
    )
    day: Optional[str] = Field(
        default=None, description="today | tomorrow | DD-MM-YYYY | null (semantic echo of user input)"
    )
    title: Optional[str] = Field(
        default=None, description="Specific movie/event/match title (verbatim casing)"
    )
    time_period: Optional[Literal["day", "afternoon", "night"]] = Field(
        default=None, description="Coarse time bucket inferred deterministically"
    )
    category: Optional[str] = Field(
        default=None, description="Event/sport category, e.g., 'technology', 'cricket'"
    )
    follow_up_question: Optional[str] = Field(
        default=None, description="At most one concise question if critical info is missing"
    )

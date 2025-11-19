from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class Suggestion(BaseModel):
    """Suggestion model for movies, events, venues, and showtimes."""
    id: Optional[str] = Field(None, description="Unique identifier (movieId, eventId, venueId)")
    title: str = Field(..., description="Title of the movie, event, or venue")
    type: str = Field(..., description="Type: 'movie', 'event', or 'venue'")
    description: Optional[str] = Field(None, description="Description or summary")
    date: Optional[str] = Field(None, description="Date in YYYY-MM-DD format")
    time: Optional[str] = Field(None, description="Time or time range")
    venue: Optional[str] = Field(None, description="Venue name")
    venue_id: Optional[str] = Field(None, description="Venue ID")
    image_url: Optional[str] = Field(None, description="Image URL or key")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


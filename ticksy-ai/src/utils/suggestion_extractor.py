"""
Utility functions to extract suggestions from query_agent tool outputs.
"""
from typing import List, Dict, Any, Optional
from src.schemas.suggestion import Suggestion
import logging

logger = logging.getLogger(__name__)


def extract_suggestions_from_tool_output(tool_output: Any) -> List[Suggestion]:
    """
    Extract suggestions from query_agent tool output.
    
    Tool outputs can be:
    - List of dicts (from get_movies_data, get_events_data, etc.)
    - Dict with page_content (from vector search)
    - Dict with showtimes
    - Single dict (from get_movie_details, get_event_details, etc.)
    """
    suggestions: List[Suggestion] = []
    
    try:
        if isinstance(tool_output, list):
            # Handle list of results
            for item in tool_output:
                suggestion = _parse_item_to_suggestion(item)
                if suggestion:
                    suggestions.append(suggestion)
        
        elif isinstance(tool_output, dict):
            # Handle single dict or dict with page_content
            if "page_content" in tool_output:
                # Vector search result format
                page_content = tool_output.get("page_content", {})
                suggestion = _parse_item_to_suggestion(page_content)
                if suggestion:
                    suggestions.append(suggestion)
            else:
                # Direct dict format
                suggestion = _parse_item_to_suggestion(tool_output)
                if suggestion:
                    suggestions.append(suggestion)
        
        elif isinstance(tool_output, str):
            # If it's a string, try to parse as JSON
            try:
                import json
                parsed = json.loads(tool_output)
                return extract_suggestions_from_tool_output(parsed)
            except (json.JSONDecodeError, ValueError):
                # Not JSON, skip
                pass
    
    except Exception as e:
        logger.error(f"Error extracting suggestions from tool output: {e}", exc_info=True)
    
    return suggestions


def _parse_item_to_suggestion(item: Dict[str, Any]) -> Optional[Suggestion]:
    """Parse a single item dict to Suggestion model."""
    try:
        if not isinstance(item, dict):
            return None
        
        # Determine type
        item_type = item.get("type") or item.get("data_source")
        if not item_type:
            # Try to infer from keys
            if "movieId" in item or "movie_id" in item:
                item_type = "movie"
            elif "eventId" in item or "event_id" in item:
                item_type = "event"
            elif "venueId" in item or "venue_id" in item:
                item_type = "venue"
            else:
                return None
        
        # Get ID
        item_id = (
            item.get("id") or 
            item.get("movieId") or 
            item.get("eventId") or 
            item.get("venueId") or
            item.get("movie_id") or
            item.get("event_id") or
            item.get("venue_id")
        )
        
        # Get title
        title = item.get("title") or item.get("name") or ""
        if not title:
            return None
        
        # Get description
        description = item.get("description") or item.get("summary")
        
        # Get date and time from showtimes if available
        date = None
        time = None
        venue = None
        venue_id = None
        
        if "showtimes" in item and isinstance(item["showtimes"], dict):
            showtimes = item["showtimes"]
            if "showtime" in showtimes and isinstance(showtimes["showtime"], list):
                # Get first showtime for date/time
                first_showtime = showtimes["showtime"][0] if showtimes["showtime"] else {}
                date = first_showtime.get("date")
                time = first_showtime.get("time") or first_showtime.get("timeRange")
                venue = first_showtime.get("venueName")
                venue_id = first_showtime.get("venueId")
        elif "date" in item:
            date = item.get("date")
        elif "showtime" in item and isinstance(item["showtime"], list):
            first_showtime = item["showtime"][0] if item["showtime"] else {}
            date = first_showtime.get("date")
            time = first_showtime.get("time") or first_showtime.get("timeRange")
            venue = first_showtime.get("venueName")
            venue_id = first_showtime.get("venueId")
        
        # Get venue info if available directly
        if not venue and "venueName" in item:
            venue = item.get("venueName")
        if not venue_id and "venueId" in item:
            venue_id = item.get("venueId")
        
        # Get image URL
        image_url = (
            item.get("imageUrl") or 
            item.get("imageKey") or 
            item.get("posterKey") or 
            item.get("bannerUrl")
        )
        
        # Build metadata (exclude fields already used)
        metadata = {k: v for k, v in item.items() 
                   if k not in ["id", "movieId", "eventId", "venueId", "title", "name", 
                               "description", "summary", "date", "time", "venueName", "venueId",
                               "imageUrl", "imageKey", "posterKey", "bannerUrl", "type", 
                               "data_source", "showtimes", "showtime", "page_content", "metadata"]}
        
        return Suggestion(
            id=str(item_id) if item_id else None,
            title=title,
            type=item_type,
            description=description,
            date=date,
            time=time,
            venue=venue,
            venue_id=str(venue_id) if venue_id else None,
            image_url=image_url,
            metadata=metadata
        )
    
    except Exception as e:
        logger.error(f"Error parsing item to suggestion: {e}", exc_info=True)
        return None


"""
Global state for managing suggestions from query_agent tools.
Thread-safe state management for suggestions.
"""
from typing import Dict, List, Optional
from threading import Lock
from src.schemas.suggestion import Suggestion


class SuggestionState:
    """Thread-safe global state for suggestions."""
    
    _instance = None
    _lock = Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(SuggestionState, cls).__new__(cls)
                    cls._instance._state: Dict[str, List[Suggestion]] = {}
                    cls._instance._state_lock = Lock()
        return cls._instance
    
    def set_suggestions(self, session_id: str, suggestions: List[Suggestion]) -> None:
        """Set suggestions for a session."""
        with self._state_lock:
            self._state[session_id] = suggestions
    
    def get_suggestions(self, session_id: str) -> List[Suggestion]:
        """Get suggestions for a session."""
        with self._state_lock:
            return self._state.get(session_id, [])
    
    def clear_suggestions(self, session_id: str) -> None:
        """Clear suggestions for a session."""
        with self._state_lock:
            if session_id in self._state:
                del self._state[session_id]
    
    def add_suggestion(self, session_id: str, suggestion: Suggestion) -> None:
        """Add a single suggestion to a session."""
        with self._state_lock:
            if session_id not in self._state:
                self._state[session_id] = []
            self._state[session_id].append(suggestion)
    
    def clear_all(self) -> None:
        """Clear all suggestions (useful for cleanup)."""
        with self._state_lock:
            self._state.clear()


# Global instance
suggestion_state = SuggestionState()


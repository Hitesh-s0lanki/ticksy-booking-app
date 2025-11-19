import json
import ast
import logging
from typing import Optional, List, Dict, Any

from langchain.tools import tool
from langchain_core.documents import Document

from src.agents.grade_documents_agent import GradeDocumentsAgent
from src.vector_store.pinecone_vector_database import PineconeVectorDB
from src.data.data_actions import DataActions

logger = logging.getLogger(__name__)

class QueryResolverTools:
    def __init__(self):
        self.grade_documents_agent = GradeDocumentsAgent()
        self.vector_db = PineconeVectorDB()
        self.data_actions = DataActions()
        self._all_tools = self._create_all_tools()
        
    # ----------------------------------------------------------------------
    # VENUE TOOLS
    # ----------------------------------------------------------------------

    def _create_get_all_venues_tool(self):
        @tool("get_all_venues")
        def _tool():
            """Return a list of all venues available in the system."""
            return self.data_actions.get_all_venues()
        return _tool

    def _create_get_venue_details_tool(self):
        @tool("get_venue_details")
        def _tool(venue_id: Optional[str] = None, name: Optional[str] = None):
            """
            Get detailed information about a venue by ID or name.
            """
            return self.data_actions.get_venue_details(venue_id=venue_id, name=name)
        return _tool

    def _create_get_movies_or_events_by_venue_tool(self):
        @tool("get_movies_or_events_by_venue")
        def _tool(venue_id: Optional[str] = None, name: Optional[str] = None, date: str = ""):
            """
            Get all movies or events scheduled at a particular venue on a given date.
            """
            return self.data_actions.get_movies_or_showtimes_by_venue(
                venue_id=venue_id,
                venue_name=name,
                date=date
            )
        return _tool

    # ----------------------------------------------------------------------
    # MOVIE TOOLS
    # ----------------------------------------------------------------------

    def _create_get_all_movies_tool(self):
        @tool("get_all_movies")
        def _tool():
            """Get a list of all movies available in the system."""
            return self.data_actions.get_all_movies()
        return _tool

    def _create_get_movie_details_tool(self):
        @tool("get_movie_details")
        def _tool(movie_id: Optional[str] = None, name: Optional[str] = None):
            """
            Get detailed information about a movie.
            """
            return self.data_actions.get_movie_details(id=movie_id, name=name)
        return _tool

    def _create_get_movie_showtimes_tool(self):
        @tool("get_movie_showtimes")
        def _tool(movie_id: Optional[str] = None, name: Optional[str] = None, date: str = ""):
            """
            Get all showtimes for a specific movie on a specific date.
            """
            return self.data_actions.get_movie_showtimes(
                id=movie_id,
                name=name,
                date=date
            )
        return _tool

    # ----------------------------------------------------------------------
    # EVENT TOOLS
    # ----------------------------------------------------------------------

    def _create_get_all_events_tool(self):
        @tool("get_all_events")
        def _tool():
            """Get a list of all events."""
            return self.data_actions.get_all_events()
        return _tool

    def _create_get_event_details_tool(self):
        @tool("get_event_details")
        def _tool(event_id: Optional[str] = None, name: Optional[str] = None):
            """
            Get details of a specific event.
            """
            return self.data_actions.get_event_details(id=event_id, name=name)
        return _tool

    def _create_get_event_showtimes_tool(self):
        @tool("get_event_showtimes")
        def _tool(event_id: Optional[str] = None, name: Optional[str] = None, date: str = ""):
            """
            Get all showtimes for a specific event on a specific date.
            """
            return self.data_actions.get_event_showtimes(
                id=event_id,
                name=name,
                date=date
            )
        return _tool

    # ----------------------------------------------------------------------
    # INTERNAL HELPERS FOR VECTOR SEARCH + SHOWTIME ENRICHMENT
    # ----------------------------------------------------------------------

    def _parse_doc_content(self, doc: Document) -> Dict[str, Any]:
        """
        Robustly parse Document.page_content into a dict, merging metadata when useful.
        Handles:
        - dict
        - JSON string
        - Python dict literal string
        - plain text fallback
        """
        try:
            if isinstance(doc.page_content, dict):
                doc_json = doc.page_content.copy()
            elif isinstance(doc.page_content, str):
                # Try JSON
                try:
                    doc_json = json.loads(doc.page_content)
                except json.JSONDecodeError:
                    # Try Python literal
                    try:
                        parsed = ast.literal_eval(doc.page_content)
                        if isinstance(parsed, dict):
                            doc_json = parsed
                        else:
                            raise ValueError("Parsed literal is not a dict")
                    except (ValueError, SyntaxError):
                        # Fallback: store as text
                        doc_json = {"content": doc.page_content}
                        if doc.metadata:
                            doc_json.update(doc.metadata)
            else:
                # Any other type
                doc_json = (
                    doc.page_content
                    if isinstance(doc.page_content, dict)
                    else {"content": str(doc.page_content)}
                )
        except Exception:
            doc_json = {"content": str(doc.page_content)}
            if doc.metadata:
                doc_json.update(doc.metadata)

        return doc_json

    def _enrich_documents_with_showtimes(
        self,
        documents: List[Document],
        date: Optional[str],
        forced_source: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Enrich documents with showtime data when a date is provided.

        - forced_source:
            * None        -> look at doc.metadata["data_source"]
            * "movie"     -> treat all docs as movies
            * "event"     -> treat all docs as events
        """
        # If no date -> just parse and return docs as JSON-serializable dicts
        if not date:
            results: List[Dict[str, Any]] = []
            for doc in documents:
                doc_json = self._parse_doc_content(doc)
                results.append(
                    {
                        "page_content": doc_json,
                        "metadata": doc.metadata or {},
                    }
                )
            return results

        documents_with_showtimes: List[Dict[str, Any]] = []

        for doc in documents:
            source = forced_source or (doc.metadata or {}).get("data_source")

            # Decide which showtime function to call
            showtimes_obj = None
            if source == "movie":
                showtimes_obj = self.data_actions.get_movie_showtimes(
                    id=(doc.metadata or {}).get("id"),
                    date=date,
                )
            elif source == "event":
                showtimes_obj = self.data_actions.get_event_showtimes(
                    id=(doc.metadata or {}).get("id"),
                    date=date,
                )
            else:
                # Unknown data_source -> skip showtime enrichment
                continue

            # Skip documents that don't have any showtimes for that date
            if not showtimes_obj or not showtimes_obj.get("showtime"):
                continue

            # Parse base doc content
            doc_json = self._parse_doc_content(doc)

            # Attach showtimes under "showtimes"
            doc_json["showtimes"] = showtimes_obj

            documents_with_showtimes.append(
                {
                    "page_content": doc_json,
                    "metadata": doc.metadata or {},
                }
            )

        return documents_with_showtimes

    # ----------------------------------------------------------------------
    # NEW TOOLS USING VECTOR DB
    # ----------------------------------------------------------------------

    def _create_get_data_by_query_tool(self):
        @tool("get_data_by_query")
        def _tool(query: str, date: str = "") -> List[Dict[str, Any]]:
            """
            Semantic search across BOTH movies and events using the vector database.
            """
            documents: List[Document] = self.vector_db.query(query=query, filter={})
            
            enriched_documents = self._enrich_documents_with_showtimes(
                documents=documents,
                date=date or None,
                forced_source=None,
            )

            filtered_documents = self.grade_documents_agent.grade_documents(
                documents=enriched_documents,
                question=query
            )

            return filtered_documents
        return _tool

    def _create_get_movies_data_tool(self):
        @tool("get_movies_data")
        def _tool(query: str, date: str = "") -> List[Dict[str, Any]]:
            """
            Semantic search ONLY over movies using the vector database.
            """
            filter: Dict[str, Any] = {"data_source": "movie"}
            documents: List[Document] = self.vector_db.query(query=query, filter=filter)
            
            enriched_documents = self._enrich_documents_with_showtimes(
                documents=documents,
                date=date or None,
                forced_source="movie",
            )
            
            filtered_documents = self.grade_documents_agent.grade_documents(
                documents=enriched_documents,
                question=query
            )

            return filtered_documents
        return _tool

    def _create_get_events_data_tool(self):
        @tool("get_events_data")
        def _tool(query: str, date: str = "") -> List[Dict[str, Any]]:
            """
            Semantic search ONLY over events using the vector database.
            """
            filter: Dict[str, Any] = {"data_source": "event"}
            documents: List[Document] = self.vector_db.query(query=query, filter=filter)
            
            enriched_documents = self._enrich_documents_with_showtimes(
                documents=documents,
                date=date or None,
                forced_source="event",
            )
            
            filtered_documents = self.grade_documents_agent.grade_documents(
                documents=enriched_documents,
                question=query
            )

            return filtered_documents
        return _tool

    def _create_all_tools(self) -> List[Any]:
        return [
            self._create_get_all_venues_tool(),
            self._create_get_venue_details_tool(),
            self._create_get_movies_or_events_by_venue_tool(),
            self._create_get_all_movies_tool(),
            self._create_get_movie_details_tool(),
            self._create_get_movie_showtimes_tool(),
            self._create_get_all_events_tool(),
            self._create_get_event_details_tool(),
            self._create_get_event_showtimes_tool(),
            self._create_get_data_by_query_tool(),
            self._create_get_movies_data_tool(),
            self._create_get_events_data_tool(),
        ]

    def get_all_tools(self) -> List[Any]:
        """Return all tools from this instance."""
        
        logger.debug(f"All Tools: {[tool.name for tool in self._all_tools]}")
        
        return self._all_tools
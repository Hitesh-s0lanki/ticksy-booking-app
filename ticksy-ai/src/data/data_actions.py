import json
from typing import Any, Dict, List, Optional

class DataActions:
    def __init__(self):
        self._venues: List[Dict[str, Any]] = self._load_json("src/data/venues.json")
        self._events: List[Dict[str, Any]] = self._load_json("src/data/events.json")
        self._movies: List[Dict[str, Any]] = self._load_json("src/data/movies.json")
        self._showtimes: List[Dict[str, Any]] = self._load_json("src/data/showtimes.json")

    @staticmethod
    def _load_json(path: str) -> List[Dict[str, Any]]:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    # ----------------- INTERNAL HELPERS -----------------

    def _build_movie_base(self, movie: Dict[str, Any]) -> Dict[str, Any]:
        base = dict(movie)  # keep all original fields
        base.update(
            {
                "id": movie["movieId"],
                "type": "movie",
                "title": movie["title"],
                "description": movie.get("description"),
                "imageUrl": movie.get("imageKey"),
                "bannerUrl": movie.get("posterKey"),
            }
        )
        return base

    def _build_event_base(self, event: Dict[str, Any]) -> Dict[str, Any]:
        base = dict(event)  # keep all original fields
        base.update(
            {
                "id": event["eventId"],
                "type": "event",
                "title": event["title"],
                "description": event.get("description"),
                "imageUrl": None,
                "bannerUrl": event.get("bannerUrl"),
            }
        )
        return base

    # -----------------------------------
    # VENUE FUNCTIONS
    # -----------------------------------

    def get_all_venues(self) -> List[Dict[str, Any]]:
        """
        Return the raw list of venues as loaded from venues.json.
        """
        return self._venues

    def get_venue_details(
        self,
        venue_id: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Return a single venue dict.

        - If venue_id is provided, match by venueId (exact).
        - Else if name is provided, do a case-insensitive ILIKE-style match:
          * first try exact (case-insensitive)
          * then fallback to substring match.

        Returns:
            dict of venue if found, otherwise None.
        """
        if not venue_id and not name:
            raise ValueError("Either 'venue_id' or 'name' must be provided.")

        # 1) Match by venue_id (strongest)
        if venue_id:
            for v in self._venues:
                if v.get("venueId") == venue_id:
                    return v
            # If venue_id is given but not found, short-circuit
            return None

        # 2) Case-insensitive name match (ILIKE-style)
        name_normalized = name.strip().lower()

        # 2a) Try full equality (case-insensitive)
        exact_matches = [
            v for v in self._venues
            if v.get("name", "").strip().lower() == name_normalized
        ]
        if exact_matches:
            return exact_matches[0]

        # 2b) Try substring match (ILIKE '%name%')
        partial_matches = [
            v for v in self._venues
            if name_normalized in v.get("name", "").strip().lower()
        ]
        if partial_matches:
            return partial_matches[0]

        # Nothing found
        return None

    # -----------------------------------
    # MOVIES / EVENTS BY VENUE
    # -----------------------------------

    def get_movies_or_showtimes_by_venue(
        self,
        venue_id: Optional[str] = None,
        venue_name: Optional[str] = None,
        date: str | None = None,
    ) -> List[Dict[str, Any]]:
        """
        Return a list of movies/events playing at a specific venue on a given date.

        Each item follows the unified schema:
        {
            title,
            type: "movie" | "event",
            id,
            description,
            imageUrl,
            bannerUrl,
            showtime: [
                {
                    venueName,
                    venueAddress,
                    venueMapUrl,
                    shows: [{ id, date, startAt, endAt }]
                }
            ],
            ...extra fields from the movie/event object...
        }
        """
        if not date:
            raise ValueError("'date' is required. Example: date='2025-11-22'")

        # Resolve venue
        venue = self.get_venue_details(venue_id=venue_id, name=venue_name)
        if not venue:
            return []

        resolved_venue_id = venue.get("venueId")

        # Filter showtimes by venue + date
        showtimes = [
            s
            for s in self._showtimes
            if s.get("venueId") == resolved_venue_id and s.get("date") == date
        ]
        if not showtimes:
            return []

        events_by_id = {e["eventId"]: e for e in self._events}
        movies_by_id = {m["movieId"]: m for m in self._movies}

        grouped: Dict[tuple, Dict[str, Any]] = {}

        for st in showtimes:
            movie_id = st.get("movieId")
            event_id = st.get("eventId")

            if movie_id:
                item_type = "movie"
                item_id = movie_id
                movie = movies_by_id.get(movie_id)
                if not movie:
                    continue
                if (item_type, item_id) not in grouped:
                    base = self._build_movie_base(movie)
                    base["showtime"] = [
                        {
                            "venueName": venue.get("name", "Unknown venue"),
                            "venueAddress": venue.get("address"),
                            "venueMapUrl": venue.get("mapUrl"),
                            "shows": [],
                        }
                    ]
                    grouped[(item_type, item_id)] = base

                venue_block = grouped[(item_type, item_id)]["showtime"][0]

            elif event_id:
                item_type = "event"
                item_id = event_id
                event = events_by_id.get(event_id)
                if not event:
                    continue
                if (item_type, item_id) not in grouped:
                    base = self._build_event_base(event)
                    base["showtime"] = [
                        {
                            "venueName": venue.get("name", "Unknown venue"),
                            "venueAddress": venue.get("address"),
                            "venueMapUrl": venue.get("mapUrl"),
                            "shows": [],
                        }
                    ]
                    grouped[(item_type, item_id)] = base

                venue_block = grouped[(item_type, item_id)]["showtime"][0]

            else:
                # If neither movieId nor eventId -> skip
                continue

            # Add show entry
            show_id = f"{item_id}:{st['startAt']}"
            venue_block["shows"].append(
                {
                    "id": show_id,
                    "date": st["date"],
                    "startAt": st["startAt"],
                    "endAt": st["endAt"],
                }
            )

        return list(grouped.values())

    # -----------------------------------
    # MOVIE FUNCTIONS
    # -----------------------------------

    def get_all_movies(self) -> List[Dict[str, Any]]:
        """
        Return the raw list of movies as loaded from movies.json.
        """
        return self._movies

    def get_movie_details(
        self,
        id: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Return a single movie dict.

        - If id is provided, match by movieId (exact).
        - Else if name is provided, do a case-insensitive ILIKE-style match on title:
          * first try exact (case-insensitive)
          * then fallback to substring match.

        Returns:
            dict of movie if found, otherwise None.
        """
        if not id and not name:
            raise ValueError("Either 'id' or 'name' must be provided.")

        # 1) Match by id (movieId)
        if id:
            for m in self._movies:
                if m.get("movieId") == id:
                    return m
            return None  # id provided but not found

        # 2) Case-insensitive name match on title
        name_normalized = name.strip().lower()

        # 2a) Exact title match (case-insensitive)
        exact_matches = [
            m for m in self._movies
            if m.get("title", "").strip().lower() == name_normalized
        ]
        if exact_matches:
            return exact_matches[0]

        # 2b) Substring match (ILIKE '%name%')
        partial_matches = [
            m for m in self._movies
            if name_normalized in m.get("title", "").strip().lower()
        ]
        if partial_matches:
            return partial_matches[0]

        return None

    def get_movie_showtimes(
        self,
        id: Optional[str] = None,
        name: Optional[str] = None,
        date: str | None = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Return showtimes for a given movie on a specific date.

        Returns a single object in the unified schema:
        {
            title,
            type: "movie",
            id,
            description,
            imageUrl,
            bannerUrl,
            showtime: [
                {
                    venueName,
                    venueAddress,
                    venueMapUrl,
                    shows: [{ id, date, startAt, endAt }]
                }
            ],
            ...extra fields from the movie object...
        }
        """
        if not date:
            raise ValueError("'date' is required. Example: date='2025-07-25'")

        movie = self.get_movie_details(id=id, name=name)
        if not movie:
            return None

        movie_id = movie["movieId"]

        showtimes = [
            s
            for s in self._showtimes
            if s.get("movieId") == movie_id and s.get("date") == date
        ]
        base = self._build_movie_base(movie)
        base["showtime"] = []

        if not showtimes:
            # No shows but still return movie metadata with empty showtime list
            return base

        venues_by_id = {v["venueId"]: v for v in self._venues}
        venues_grouped: Dict[str, Dict[str, Any]] = {}

        for st in showtimes:
            venue_id = st.get("venueId")
            venue = venues_by_id.get(venue_id, {})
            key = venue_id or "unknown"

            if key not in venues_grouped:
                venues_grouped[key] = {
                    "venueName": venue.get("name", "Unknown venue"),
                    "venueAddress": venue.get("address"),
                    "venueMapUrl": venue.get("mapUrl"),
                    "shows": [],
                }

            show_id = f"{movie_id}:{st['startAt']}"
            venues_grouped[key]["shows"].append(
                {
                    "id": show_id,
                    "date": st["date"],
                    "startAt": st["startAt"],
                    "endAt": st["endAt"],
                }
            )

        base["showtime"] = list(venues_grouped.values())
        return base
    
    # -----------------------------------
    # EVENT FUNCTIONS
    # -----------------------------------

    def get_all_events(self) -> List[Dict[str, Any]]:
        """
        Return the raw list of events as loaded from events.json.
        """
        return self._events

    def get_event_details(
        self,
        id: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Return a single event dict.

        - If id is provided, match by eventId (exact).
        - Else if name is provided, do a case-insensitive ILIKE-style match on title:
          * first try exact (case-insensitive)
          * then fallback to substring match.

        Returns:
            dict of event if found, otherwise None.
        """
        if not id and not name:
            raise ValueError("Either 'id' or 'name' must be provided.")

        # 1) Match by id (eventId)
        if id:
            for e in self._events:
                if e.get("eventId") == id:
                    return e
            return None  # id provided but not found

        # 2) Case-insensitive name match on title
        name_normalized = name.strip().lower()

        # 2a) Exact title match
        exact_matches = [
            e for e in self._events
            if e.get("title", "").strip().lower() == name_normalized
        ]
        if exact_matches:
            return exact_matches[0]

        # 2b) Substring match (ILIKE '%name%')
        partial_matches = [
            e for e in self._events
            if name_normalized in e.get("title", "").strip().lower()
        ]
        if partial_matches:
            return partial_matches[0]

        return None

    def get_event_showtimes(
        self,
        id: Optional[str] = None,
        name: Optional[str] = None,
        date: str | None = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Return showtimes for a given event on a specific date.

        Returns a single object in the unified schema:
        {
            title,
            type: "event",
            id,
            description,
            imageUrl,
            bannerUrl,
            showtime: [
                {
                    venueName,
                    venueAddress,
                    venueMapUrl,
                    shows: [{ id, date, startAt, endAt }]
                }
            ],
            ...extra fields from the event object...
        }
        """
        if not date:
            raise ValueError("'date' is required. Example: date='2025-11-22'")

        event = self.get_event_details(id=id, name=name)
        if not event:
            return None

        event_id = event["eventId"]

        showtimes = [
            s
            for s in self._showtimes
            if s.get("eventId") == event_id and s.get("date") == date
        ]
        base = self._build_event_base(event)
        base["showtime"] = []

        if not showtimes:
            return base

        venues_by_id = {v["venueId"]: v for v in self._venues}
        venues_grouped: Dict[str, Dict[str, Any]] = {}

        for st in showtimes:
            venue_id = st.get("venueId")
            venue = venues_by_id.get(venue_id, {})
            key = venue_id or "unknown"

            if key not in venues_grouped:
                venues_grouped[key] = {
                    "venueName": venue.get("name", "Unknown venue"),
                    "venueAddress": venue.get("address"),
                    "venueMapUrl": venue.get("mapUrl"),
                    "shows": [],
                }

            show_id = f"{event_id}:{st['startAt']}"
            venues_grouped[key]["shows"].append(
                {
                    "id": show_id,
                    "date": st["date"],
                    "startAt": st["startAt"],
                    "endAt": st["endAt"],
                }
            )

        base["showtime"] = list(venues_grouped.values())
        return base

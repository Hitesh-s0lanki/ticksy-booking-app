import os
from dotenv import load_dotenv

import http.client
import json
from pathlib import Path
import requests
import random
from datetime import datetime, timedelta, date

from src.ticksy_proto_schema.showtime_pb2 import ShowtimeInput
from src.venue import VenueIngestion

load_dotenv()

class ShowtimeIngestion:
    def __init__(self):
        self.java_server_url =os.getenv("JAVA_SERVER_URL")
        self.events_showtime = Path("src/data/events_showtime.json")
        self.movies_showtime = Path("src/data/movies_showtime.json")

    def fetch_movie_showtimes(self):
        try:
            content = self.movies_showtime.read_text(encoding="utf-8")
            movies_data = json.loads(content)
            return movies_data
        except Exception as error:
            print("Error fetching movies data:", error)
            return []

    def fetch_event_showtimes(self):
        try:
            content = self.events_showtime.read_text(encoding="utf-8")
            events_data = json.loads(content)
            return events_data
        except Exception as error:
            print("Error fetching events data:", error)
            return []
        
    def showtimes_data_proto(self, showtime: dict) -> ShowtimeInput:    
        showtimeInput = ShowtimeInput()
        showtimeInput.venueId = showtime.get("venueId", "")
        showtimeInput.movieId = showtime.get("movieId", "")
        showtimeInput.eventId = showtime.get("eventId", "")
        showtimeInput.date = showtime.get("date", "")
        showtimeInput.startAt = showtime.get("startAt", "")

        return showtimeInput

    def upload_event_showtimes(self):
        venues_ids = VenueIngestion().fetch_database_venues()
        
        if not self.java_server_url:
            raise ValueError("JAVA_SERVER_URL is not set")
        
        showtimes_data = self.fetch_event_showtimes()
     
        # create a showtime adding random venue from the list of venues
        showtimes_list = []
        
        for showtime in showtimes_data:
            # randomly assign a venue from the list of venues using random module
            showtime['venueId'] = random.choice(venues_ids)
            showtime_proto = self.showtimes_data_proto(showtime)
            
            try:
                resp = requests.post(
                    f"{self.java_server_url}/api/showtimes",
                    data=showtime_proto.SerializeToString(),
                    headers={"Content-Type": "application/x-protobuf"},
                )

                
                if resp.status_code == 200:
                    showtimes_list.append(showtime)
                    print(f"✅ Uploaded showtime: {showtime['eventId']}")
                else:
                    print(f"❌ Failed to upload showtime: {showtime['eventId']}. Status code: {resp.status_code}")

            except Exception as e:
                print(f"❌ Exception occurred while uploading showtime: {showtime['eventId']}. Error: {e}")
        
        # upload all showtimes to file
        with open("src/data/events_showtime.json", "w", encoding="utf-8") as f:
            json.dump(showtimes_list, f, ensure_ascii=False, indent=4)
            
    def upload_movie_showtimes(self):        
        if not self.java_server_url:
            raise ValueError("JAVA_SERVER_URL is not set")
        
        showtimes_data = self.fetch_movie_showtimes()
     
        # create a showtime adding random venue from the list of venues
        showtimes_list = []
        
        for showtime in showtimes_data:
            showtime_proto = self.showtimes_data_proto(showtime)
            try:
                resp = requests.post(
                    f"{self.java_server_url}/api/showtimes",
                    data=showtime_proto.SerializeToString(),
                    headers={"Content-Type": "application/x-protobuf"},
                )

                if resp.status_code == 200:
                    showtimes_list.append(showtime)
                    print(f"✅ Uploaded showtime: {showtime['movieId']}")
                else:
                    print(f"❌ Failed to upload showtime: {showtime['movieId']}. Status code: {resp.status_code}")

            except Exception as e:
                print(f"❌ Exception occurred while uploading showtime: {showtime['movieId']}. Error: {e}")
        
    def generate_movies_showtimes(movies_ids, venues_ids, days=50):
        # --- helpers ---
        def midn(d: date) -> datetime:
            return datetime(d.year, d.month, d.day)
        def fmt_date(d: date) -> str:
            return d.strftime("%Y-%m-%d")
        def fmt_dt(dt: datetime) -> str:
            return dt.strftime("%Y-%m-%dT%H:%M:%S")
        def pick_id(obj, *keys):
            for k in keys:
                if k in obj and obj[k]:
                    return obj[k]
            return None

        if not movies_ids or not venues_ids:
            return []

        # constants
        EARLIEST = 10 * 60            # 10:00
        LATEST_END = 23 * 60 + 30     # 23:30
        STEP = 15                     # minutes
        BUFFER = 15                   # minutes
        ATTEMPTS = 200                # per show placement

        today = datetime.now().date()
        out = []
        rng = random.Random()

        # schedule map: (venueId, yyyy-mm-dd) -> list of (startMin,endMin)
        sched = {}

        for d_offset in range(days):
            day = today + timedelta(days=d_offset)
            day_key_fmt = fmt_date(day)

            for m in movies_ids:
                # pick 5 random venues (with replacement avoided)
                if len(venues_ids) < 5:
                    chosen = [v for v in rng.sample(venues_ids, len(venues_ids))]
                    # allow repeats if fewer than 5 venues exist
                    while len(chosen) < 5:
                        chosen.append(rng.choice(venues_ids)["id"])
                else:
                    chosen = [v for v in rng.sample(venues_ids, 5)]

                # 3–5 shows per (movie, venue, day)
                total_mins = m["durationMins"] + BUFFER
                latest_start = max(EARLIEST, LATEST_END - total_mins)
                if latest_start < EARLIEST:
                    continue  # movie too long to fit

                for venue_id in chosen:
                    n_shows = rng.randint(3, 5)
                    key = (venue_id, day_key_fmt)
                    slots = sched.setdefault(key, [])

                    for _ in range(n_shows):
                        placed = False
                        for _ in range(ATTEMPTS):
                            start = (rng.randrange(EARLIEST, latest_start + 1) // STEP) * STEP
                            end = start + total_mins
                            # check overlap in this venue/day
                            if all(not (start < e and s < end) for (s, e) in slots):
                                # place
                                slots.append((start, end))
                                slots.sort()
                                start_dt = midn(day) + timedelta(minutes=start)
                                end_dt = midn(day) + timedelta(minutes=end)
                                out.append({
                                    "venueId": venue_id,
                                    "movieId": m["movieId"],
                                    "date": day_key_fmt,
                                    "startAt": fmt_dt(start_dt),
                                    "endAt": fmt_dt(end_dt),
                                })
                                placed = True
                                break
        
        # put this data to a file
        with open("src/data/movies_showtime.json", "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=4)                
        
        return out
    
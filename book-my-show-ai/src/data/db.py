import os
from dotenv import load_dotenv

import http.client
import json
from pathlib import Path
# import requests

from src.ticksy_proto_schema.movie_pb2 import MoviesList
from src.ticksy_proto_schema.event_pb2 import EventsList
from google.protobuf.json_format import MessageToDict

from datetime import datetime, timedelta

class ConnectionDB:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Get environment variables
        self.java_server_url = os.getenv("JAVA_SERVER_URL")
        self.movie_url = '/api/movies'
        self.event_url = '/api/events'
        self.movies_data = []
        self.events_data = []

    def get_showtimes_data(self) -> list[dict]:
        try:
            # check if showtimes data is already fetched
            if len(self.showtimes_data) > 0:
                return self.showtimes_data
            
            # check if json file exists
            if Path("src/data/showtimes.json").exists():
                with open("src/data/showtimes.json", "r", encoding="utf-8") as f:
                    json_dump = json.load(f)
                    self.showtimes_data = json_dump["showtimes"]
                    return self.showtimes_data
                    
            return []
        
        except Exception as error:
            print("Error getting showtimes data:", error)
            return []
         
    def get_movies_data(self) -> list[dict]:
        try:
            # check if movies data is already fetched
            if len(self.movies_data) > 0:
                return self.movies_data
           
            # check if json file exists
            if Path("src/data/movies.json").exists():
                with open("src/data/movies.json", "r", encoding="utf-8") as f:
                    json_dump = json.load(f)
                                        
                    # check if the time exists
                    if "time" in json_dump:
                        # check if the time is less than 3 days
                        if datetime.now() - datetime.strptime(json_dump["time"], "%Y-%m-%d %H:%M:%S") < timedelta(days=3):
                            self.movies_data = json_dump["movies"]
                            return json_dump["movies"]
                        
            conn = http.client.HTTPConnection(self.java_server_url
                                              .replace("http://", "")
                                              .replace("https://", ""))
            conn.request("GET", self.movie_url)
            response = conn.getresponse()


            if response.status == 200:
                proto_movies = MoviesList()
                data = response.read()
                proto_movies.ParseFromString(data)

                for movie in proto_movies.movies:

                    # parse from binary to Movie object
                    mv_dict = MessageToDict(movie, preserving_proto_field_name=True)
                    self.movies_data.append(mv_dict)

                # get the current time 
                time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                json_dump = {
                    "time": time,
                    "movies": self.movies_data
                }

                # write to json file
                with open("src/data/movies.json", "w", encoding="utf-8") as f:
                    json.dump(json_dump, f, ensure_ascii=False, indent=4)

                return self.movies_data
            else:
                print(f"Failed to fetch movies from database. Status code: {response.status}")
                return []
        except Exception as error:
            print("Error fetching movies from database:", error)
            return []
    
    def get_event_data(self) -> list[dict]:
        try:
            # check if events data is already fetched
            if len(self.events_data) > 0:
                return self.events_data
            
            # check if json file exists
            if Path("src/data/events.json").exists():
                with open("src/data/events.json", "r", encoding="utf-8") as f:
                    try: 
                        json_dump = json.load(f)
                        
                        # check if the time exists
                        if "time" in json_dump:
                            # check if the time is less than 3 days
                            if datetime.now() - datetime.strptime(json_dump["time"], "%Y-%m-%d %H:%M:%S") < timedelta(days=3):
                                self.events_data = json_dump["events"]
                                return self.events_data
                    
                    except Exception as error:
                        print("Error parsing events from json file:", error)
                        
            conn = http.client.HTTPConnection(self.java_server_url
                                              .replace("http://", "")
                                              .replace("https://", ""))
            conn.request("GET", self.event_url)
            response = conn.getresponse()
            
            if response.status == 200:
                proto_events = EventsList()
                data = response.read()
                proto_events.ParseFromString(data)

                for event in proto_events.events:
                    ev_dict = MessageToDict(event, preserving_proto_field_name=True)
                    self.events_data.append(ev_dict)
                    
                return self.events_data
            else:
                print(f"Failed to fetch events from database. Status code: {response.status}")
                return []
        except Exception as error:
            print("Error fetching events from database:", error)
            return []
    
    def get_movie_name(self, movie_name: str) -> str:
        movie_name = movie_name.lower()
        try:
            movies = self.movies_data
            for movie in movies:
                # check like ILIKE in postgres
                if movie_name in movie["title"].lower():
                    return movie

        except Exception as error:
            print("Error getting movie name:", error)
            return None
    
    def get_event_name(self, event_name: str) -> str:
        event_name = event_name.lower()
        try:
            events = self.events_data
            for event in events:
                if event_name in event["name"].lower():
                    return event
        except Exception as error:
            print("Error getting event name:", error)
            return None
    
    def get_movie_showtimes_data(self, movie_id: str, date: str) -> list[dict]:
        try:
            showtimes = []
            # check if showtimes data is already fetched
            if len(self.showtimes_data) == 0:
                # check if json file exists
                self.showtimes_data = self.get_showtimes_data()
                        
            for showtime in self.showtimes_data:
                    if showtime["movieId"] == movie_id and showtime["date"] == date:
                        showtimes.append(showtime)
            return showtimes
                
        except Exception as error:
            print("Error getting showtimes data:", error)
            return None
        
    def get_movies_with_showtime(self, movies_name: list[str]) -> list[dict]:
        try:
            movies_with_showtime = []
            for movie_name in movies_name:
                movie = self.get_movie_name(movie_name)
                if movie is not None:
                    movies_with_showtime.append(movie)
            return movies_with_showtime
        except Exception as error:
            print("Error getting movies showtime:", error)

    
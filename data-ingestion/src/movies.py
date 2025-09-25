import os
from dotenv import load_dotenv

import http.client
import json
from pathlib import Path
import requests

## Pinecone Vector Store
from langchain_core.documents import Document
from src.pinecone_vector_database import PineconeVectorDB

from src.ticksy_proto_schema.movie_pb2 import MovieInput, MoviesList
from google.protobuf.json_format import MessageToDict

load_dotenv()

class MovieIngestion:
    def __init__(
        self,
        java_server_url: str | None = None,
        movies_file: Path | str | None = None,
        rapidapi_key: str | None = None,
        rapidapi_host: str | None = None,
    ):
        self.java_server_url = java_server_url or os.getenv("JAVA_SERVER_URL")
        self.movies_file = Path(movies_file) if movies_file else Path("src/data/movies.json")
        self.rapidapi_key = rapidapi_key or os.getenv("RAPIDAPI_KEY") or "db68717ecemsh7537959e53f1ff2p115a3ajsn122cf34378f5"
        self.rapidapi_host = rapidapi_host or os.getenv("RAPIDAPI_HOST") or "imdb236.p.rapidapi.com"
        
        self.pinecone_db = PineconeVectorDB()

    def fetch_movies_rapidapi(self) -> list[dict]:
        conn = http.client.HTTPSConnection(self.rapidapi_host)

        headers = {
            "x-rapidapi-key": self.rapidapi_key,
            "x-rapidapi-host": self.rapidapi_host,
        }

        conn.request("GET", "/api/imdb/most-popular-movies", headers=headers)
        res = conn.getresponse()
        data = res.read()
        movies = json.loads(data.decode("utf-8"))

        formatted_movies = []
        for m in movies:
            formatted_movies.append({
                "title": m.get("originalTitle"),
                "description": m.get("description"),
                "genre": m.get("genres", []),
                "durationMins": m.get("runtimeMinutes"),
                "releaseDate": m.get("releaseDate"),
                "rating": m.get("contentRating"),
                "imageKey": m.get("primaryImage"),
                "posterKey": m.get("trailer"),
                "languages": m.get("spokenLanguages", [])
            })

        # Ensure directory exists and write file
        self.movies_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.movies_file, "w", encoding="utf-8") as f:
            json.dump(formatted_movies, f, indent=2, ensure_ascii=False)

        print(f"✅ Movies saved to {self.movies_file}")
        return formatted_movies

    def fetch_movies_upload(self) -> list[dict]:
        try:
            content = self.movies_file.read_text(encoding="utf-8")
            movies_data = json.loads(content)
            return movies_data
        except Exception as error:
            print("Error fetching movies data:", error)
            return []

    def get_database_movies(self) -> list[dict]:
        try:
            conn = http.client.HTTPConnection(self.java_server_url.replace("http://", "").replace("https://", ""))
            conn.request("GET", "/api/movies")
            response = conn.getresponse()

            movies = []

            if response.status == 200:
                proto_movies = MoviesList()
                data = response.read()
                proto_movies.ParseFromString(data)

                for movie in proto_movies.movies:

                    # parse from binary to Movie object
                    mv_dict = MessageToDict(movie, preserving_proto_field_name=True)
                    movies.append(mv_dict)

                # write to json file
                with open("src/data/database_movies.json", "w", encoding="utf-8") as f:
                    json.dump(movies, f, ensure_ascii=False, indent=4)

                return movies
            else:
                print(f"Failed to fetch movies from database. Status code: {response.status}")
                return []
        except Exception as error:
            print("Error fetching movies from database:", error)
            return []

    def upload_movies_proto(self, movies_data: list[dict]) -> str:
        
        movies_docs = []
         
        for movie in movies_data:
            
            movie_doc = Document(
                page_content=str(movie),
                metadata={
                    "data_source": "movie",
                    "genre": movie.get("genre", []),
                    "rating": float(movie.get("rating", 0)),
                }
            )
            
            movie_proto = MovieInput()
            movie_proto.title = movie.get("title", "")
            movie_proto.description = movie.get("description", "")
            movie_proto.genre.extend(movie.get("genre", []))
            movie_proto.durationMins = movie.get("durationMins", 0)
            movie_proto.releaseDate = movie.get("releaseDate", "")
            movie_proto.rating = float(movie.get("rating", 0))
            movie_proto.imageKey = movie.get("imageKey", "")
            movie_proto.posterKey = movie.get("posterKey", "")
            movie_proto.languages.extend(movie.get("languages", []))


            try:
                resp = requests.post(
                    f"{self.java_server_url}/api/movies",
                    data=movie_proto.SerializeToString(),
                    headers={"Content-Type": "application/x-protobuf"},
                )

                title = movie.get("title", "<unknown>")
                
                if resp.status_code == 200:
                    movies_docs.append(movie_doc)
                    print(f"✅ Uploaded movie: {title}")
                else:
                    print(f"❌ Failed to upload movie: {title}. Status code: {resp.status_code}")

            except Exception as e:
                title = movie.get("title", "<unknown>")
                print(f"❌ Exception occurred while uploading movie: {title}. Error: {e}")
        
        try:
            self.pinecone_db.add_documents(movies_docs)
            print(f"✅ Uploaded {len(movies_docs)} movie documents to Pinecone.")
        except Exception as e:
            print(f"❌ Exception occurred while uploading to Pinecone: {e}")
        
        return "Upload complete"

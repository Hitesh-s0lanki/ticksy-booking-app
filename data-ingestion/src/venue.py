import os
from dotenv import load_dotenv

import http.client
import json
from pathlib import Path
import requests

load_dotenv()

class VenueIngestion:
    def __init__(
        self,
        java_server_url: str | None = None,
        venues_file: Path | str | None = None,
    ):
        self.java_server_url = java_server_url or os.getenv("JAVA_SERVER_URL")
        self.venues_file = Path(venues_file) if venues_file else Path("src/data/venues.json")
        
    def fetch_database_venues(self) -> list[str]:
        try:
            conn = http.client.HTTPConnection(self.java_server_url.replace("http://", "").replace("https://", ""))
            conn.request("GET", "/api/venues")
            response = conn.getresponse()

            venues = []

            if response.status == 200:
                data = response.read()
                venues = json.loads(data)

                # write to json file
                with open("src/data/database_venues.json", "w", encoding="utf-8") as f:
                    json.dump(venues, f, ensure_ascii=False, indent=4)
                    
                venues_ids = [venue.get("venueId") for venue in venues if "venueId" in venue]

            else:
                print(f"Failed to fetch venues. Status code: {response.status}")

            return venues_ids

        except Exception as error:
            print("Error fetching venues from database:", error)
            return []

    def fetch_venues_upload(self) -> list[dict]:
        try:
            content = self.venues_file.read_text(encoding="utf-8")
            venues_data = json.loads(content)
            return venues_data
        except Exception as error:
            print("Error fetching venues data:", error)
            return []

    def upload_venues(self, venues_data: list[dict]) -> str:
        if not self.java_server_url:
            raise ValueError("JAVA_SERVER_URL is not set")

        for venue in venues_data:
            try:
                resp = requests.post(
                    f"{self.java_server_url}/api/venues",
                    json=venue,
                    headers={"Content-Type": "application/json"},
                    timeout=10,
                )

                title = venue.get("name", "<unknown>")

                if resp.ok:
                    print(f"✅ Uploaded venue: {title}")
                else:
                    print(f"❌ Failed to upload venue: {title}. Status code: {resp.status_code}. Response: {resp.text}")

            except Exception as e:
                title = venue.get("name", "<unknown>")
                print(f"❌ Exception occurred while uploading venue: {title}. Error: {e}")
        
        return "Upload complete"

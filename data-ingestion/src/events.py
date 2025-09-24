import os
from dotenv import load_dotenv

import http.client
import json
from pathlib import Path
import requests

## Pinecone Vector Store
from langchain_core.documents import Document
from src.pinecone_vector_database import PineconeVectorDB

from src.ticksy_proto_schema.event_pb2 import EventInput, EventsList, Event
from google.protobuf.json_format import MessageToDict

load_dotenv()

class EventIngestion:
    def __init__(
        self,
        java_server_url: str | None = None,
        events_file: Path | str | None = None,
    ):
        self.java_server_url = java_server_url or os.getenv("JAVA_SERVER_URL")
        self.events_file = Path(events_file) if events_file else Path("src/data/events.json")
        
        self.pinecone_db = PineconeVectorDB()

    def fetch_events_upload(self) -> list[dict]:
        try:
            content = self.events_file.read_text(encoding="utf-8")
            events_data = json.loads(content)
            return events_data
        except Exception as error:
            print("Error fetching events data:", error)
            return []
        
    def get_database_events(self) -> list[dict]:
        try:
            conn = http.client.HTTPConnection(self.java_server_url.replace("http://", "").replace("https://", ""))
            conn.request("GET", "/api/events")
            response = conn.getresponse()

            events = []

            if response.status == 200:
                proto_events = EventsList()
                data = response.read()
                proto_events.ParseFromString(data)
                
                for event in proto_events.events:

                    # parse from binary to Event object
                    ev_dict = MessageToDict(event, preserving_proto_field_name=True)
                    events.append(ev_dict)

                # write to json file
                with open("src/data/database_events.json", "w", encoding="utf-8") as f:
                    json.dump(events, f, ensure_ascii=False, indent=4)

                return events
            else:
                print(f"Failed to fetch events from database. Status code: {response.status}")
                return []
        except Exception as error:
            print("Error fetching events from database:", error)
            return []

    def upload_events_proto(self, events_data: list[dict]) -> str:

        events_docs = []

        for event in events_data:

            event_doc = Document(
                page_content=str(event),
                metadata={
                    "data_source": "event",
                    "category": event.get("categoryType", ""),
                    "organizer": event.get("organizerName", ""),
                }
            )
            
            event_proto = EventInput()
            event_proto.title = event.get("title", "")
            event_proto.description = event.get("description", "")
            event_proto.eventType = event.get("eventType", "")
            event_proto.categoryType = event.get("categoryType", "")
            event_proto.organizerName = event.get("organizerName", "")
            event_proto.startDate = event.get("startDate", "")
            event_proto.endDate = event.get("endDate", "")
            event_proto.bannerUrl = event.get("bannerUrl", "")

            try:
                resp = requests.post(
                    f"{self.java_server_url}/api/events",
                    data=event_proto.SerializeToString(),
                    headers={"Content-Type": "application/x-protobuf"},
                )

                title = event.get("title", "<unknown>")
                
                if resp.status_code == 200:
                    events_docs.append(event_doc)
                    print(f"✅ Uploaded event: {title}")
                else:
                    print(f"❌ Failed to upload event: {title}. Status code: {resp.status_code}")

            except Exception as e:
                title = event.get("title", "<unknown>")
                print(f"❌ Exception occurred while uploading event: {title}. Error: {e}")

        try:
            self.pinecone_db.add_documents(events_docs)
            print(f"✅ Uploaded {len(events_docs)} event documents to Pinecone.")
        except Exception as e:
            print(f"❌ Exception occurred while uploading to Pinecone: {e}")
        
        return "Upload complete"

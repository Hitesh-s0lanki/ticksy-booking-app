from src.movies import MovieIngestion
from src.events import EventIngestion
from src.venue import VenueIngestion
from src.showtimes import ShowtimeIngestion

def movies_data_upload():
    movie_ingestion = MovieIngestion()
    movies_data = movie_ingestion.fetch_movies_upload()
    movie_ingestion.upload_movies_proto(movies_data)
    
def events_data_upload():
    event_ingestion = EventIngestion()
    events_data = event_ingestion.fetch_events_upload()
    event_ingestion.upload_events_proto(events_data)

def venues_data_upload():
    venue_ingestion = VenueIngestion()
    venues_data = venue_ingestion.fetch_venues_upload()
    venue_ingestion.upload_venues(venues_data)

def event_showtimes_data_upload():
    showtime_ingestion = ShowtimeIngestion()
    showtime_ingestion.upload_event_showtimes()

if __name__ == "__main__":
    # movies_data_upload()
    # print("Movies data upload process completed.")
    
    # events_data_upload()
    # print("Events data upload process completed.")
    
    # load existing events from database
    # EventIngestion().get_database_events()
    
    # upload venues data
    # venues_data_upload()
    
    # upload event showtimes data
    event_showtimes_data_upload()
    
    # generate movie showtimes data
    # movies_ids = MovieIngestion().get_database_movies()
    # venues_ids = VenueIngestion().fetch_database_venues()
    # ShowtimeIngestion.generate_movies_showtimes(movies_ids, venues_ids)

    # upload movie showtimes data
    # ShowtimeIngestion().upload_movie_showtimes()
    
    print("Data ingestion process completed.")
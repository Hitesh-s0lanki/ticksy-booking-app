const axios = require("axios");
const fs = require("fs");

async function fetchMoviesUpload() {
  try {
    const movies = fs.readFileSync("./movies.json");
    const moviesData = JSON.parse(movies);

    await Promise.all(
      moviesData.map(async (movie) => {
        const response = await axios.post(
          "http://localhost:8080/api/movies",
          movie
        );
        console.log(
          `Uploaded movie: ${movie.title}, Response: ${response.status}`
        );
      })
    );

    console.log("Movies data fetched and saved to movies.json");
  } catch (error) {
    console.error("Error fetching movies data:", error);
  }
}

async function fetchEventsUpload() {
  try {
    const events = fs.readFileSync("./events.json");
    const eventsData = JSON.parse(events);

    await Promise.all(
      eventsData.map(async (event) => {
        const response = await axios.post(
          "http://localhost:8080/api/events/json",
          event
        );
        console.log(
          `Uploaded event: ${event.name}, Response: ${response.status}`
        );
      })
    );

    console.log("Events data fetched and saved to events.json");
  } catch (error) {
    console.error("Error fetching events data:", error);
  }
}

async function fetchVenuesUpload() {
  try {
    const venues = fs.readFileSync("./venues.json");
    const venuesData = JSON.parse(venues);

    await Promise.all(
      venuesData.map(async (venue) => {
        const response = await axios.post(
          "http://localhost:8080/api/venues",
          venue
        );
        console.log(
          `Uploaded venue: ${venue.name}, Response: ${response.status}`
        );
      })
    );

    console.log("Venues data fetched and saved to venues.json");
  } catch (error) {
    console.error("Error fetching venues data:", error);
  }
}

async function fetchShowtimesUpload(showtimes) {
  try {
    const showtimes = fs.readFileSync("./showtimes.json");
    const showtimesData = JSON.parse(showtimes);

    await Promise.all(
      showtimesData.map(async (showtime) => {
        const response = await axios.post(
          "http://localhost:8080/api/showtimes",
          showtime
        );
        console.log(
          `Uploaded showtime for movie ID: ${showtime.movieId}, Response: ${response.status}`
        );
      })
    );

    console.log("Showtimes data uploaded successfully");
  } catch (error) {
    console.error("Error uploading showtimes data:", error);
  }
}

// Uncomment the function you want to run
fetchEventsUpload();

// fetchMoviesUpload();

// fetchVenuesUpload();

// fetchShowtimesUpload();

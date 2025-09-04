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
          "http://localhost:8080/api/events",
          `Uploaded event: ${event.title}, Response: ${response.status}`
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

// Uncomment the function you want to run
fetchEventsUpload();

// fetchMoviesUpload();

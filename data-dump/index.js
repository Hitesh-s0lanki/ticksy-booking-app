const axios = require("axios");
const fs = require("fs");

async function fetchMoviesUpload() {
  try {
    const movies = fs.readFileSync("./movies.json");
    const moviesData = JSON.parse(movies);

    moviesData.forEach(async (movie) => {
      const response = await axios.post(
        "http://localhost:8080/api/movies",
        movie
      );
      console.log(
        `Uploaded movie: ${movie.title}, Response: ${response.status}`
      );
    });

    console.log("Movies data fetched and saved to movies.json");
  } catch (error) {
    console.error("Error fetching movies data:", error);
  }
}

fetchMoviesUpload();

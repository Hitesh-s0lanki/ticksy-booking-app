package com.bookmyshow.service;

import com.bookmyshow.interfaces.MovieServiceInter;
import com.bookmyshow.models.Movie;
import com.bookmyshow.proto.MovieProto;
import com.bookmyshow.repository.MovieRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MovieService implements MovieServiceInter {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public ResponseEntity<?> getAllMovies() {
        try {
            List<Movie> movies = movieRepository.findAll();

            List<MovieProto.Movie> movieProtos = movies.stream()
                    .map(this::toProto)
                    .collect(Collectors.toList());

            MovieProto.AllMoviesResponse response = MovieProto.AllMoviesResponse.newBuilder()
                    .addAllMovies(movieProtos)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch all movies. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getMovieById(String movieId) {
        try {
            Optional<Movie> movieOpt = movieRepository.findById(UUID.fromString(movieId));
            if (movieOpt.isEmpty()) {
                throw new Exception("Movie not found with ID: " + movieId);
            }
            return ResponseEntity.ok(toProto(movieOpt.get()));
        } catch (Exception e) {
            log.error("Failed to fetch movie by ID: {}. Error: {}", movieId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createMovie(MovieProto.MovieInput movie) {
        try {
            Movie entity = toEntity(movie);
            Movie saved = movieRepository.save(entity);
            return ResponseEntity.ok(toProto(saved));
        } catch (Exception e) {
            log.error("Failed to create movie: {}. Error: {}", movie, e.getMessage());
            return ResponseEntity.status(500).body("Failed to create movie: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateMovie(String movieId, MovieProto.Movie movie) {
        try {
            if (movie == null || movie.getTitle().isBlank() || movie.getDescription().isBlank()) {
                throw new Exception("Movie Payload is invalid");
            }

            return movieRepository.findById(UUID.fromString(movieId))
                    .map(existingMovie -> {
                        existingMovie.setTitle(movie.getTitle());
                        existingMovie.setDescription(movie.getDescription());
                        existingMovie.setGenre(movie.getGenreList());
                        existingMovie.setDurationMins(movie.getDurationMins());
                        if (!movie.getReleaseDate().isEmpty()) {
                            existingMovie.setReleaseDate(LocalDate.parse(movie.getReleaseDate()));
                        }
                        existingMovie.setRating(movie.getRating());
                        existingMovie.setLanguages(movie.getLanguagesList());
                        existingMovie.setImageKey(movie.getImageKey());
                        existingMovie.setPosterKey(movie.getPosterKey());

                        Movie saved = movieRepository.save(existingMovie);
                        return ResponseEntity.ok(toProto(saved));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to update movie with ID: {}. Error: {}", movieId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteMovie(String movieId) {
        try {
            if (movieId == null || movieId.trim().isEmpty()) {
                throw new Exception("Invalid movie ID");
            }

            UUID uuid = UUID.fromString(movieId);

            if (!movieRepository.existsById(uuid)) {
                throw new Exception("Movie not found");
            }

            movieRepository.deleteById(uuid);

            MovieProto.MovieSuccessResponse response = MovieProto.MovieSuccessResponse.newBuilder()
                    .setMessage("Movie deleted successfully")
                    .setStatus(200)
                    .setMovieId(movieId)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete movie with ID: {}. Error: {}", movieId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    private MovieProto.Movie toProto(Movie movie) {
        MovieProto.Movie.Builder builder = MovieProto.Movie.newBuilder()
                .setMovieId(movie.getMovieId().toString())
                .setTitle(movie.getTitle())
                .setDescription(movie.getDescription())
                .addAllGenre(movie.getGenre() != null ? movie.getGenre() : Collections.emptyList())
                .setDurationMins(movie.getDurationMins() != null ? movie.getDurationMins() : 0)
                .setRating(movie.getRating() != null ? movie.getRating() : 0.0)
                .addAllLanguages(movie.getLanguages() != null ? movie.getLanguages() : Collections.emptyList());

        if (movie.getReleaseDate() != null) {
            builder.setReleaseDate(movie.getReleaseDate().toString());
        }
        if (movie.getImageKey() != null) {
            builder.setImageKey(movie.getImageKey());
        }
        if (movie.getPosterKey() != null) {
            builder.setPosterKey(movie.getPosterKey());
        }

        return builder.build();
    }

    private Movie toEntity(MovieProto.MovieInput movie) {
        Movie entity = new Movie();
        entity.setTitle(movie.getTitle());
        entity.setDescription(movie.getDescription());
        entity.setGenre(movie.getGenreList());
        entity.setDurationMins(movie.getDurationMins());
        if (!movie.getReleaseDate().isEmpty()) {
            entity.setReleaseDate(LocalDate.parse(movie.getReleaseDate()));
        }
        entity.setRating(movie.getRating());
        entity.setLanguages(movie.getLanguagesList());
        entity.setImageKey(movie.getImageKey());
        entity.setPosterKey(movie.getPosterKey());
        return entity;
    }
}

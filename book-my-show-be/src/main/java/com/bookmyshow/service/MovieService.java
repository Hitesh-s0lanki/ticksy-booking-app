package com.bookmyshow.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.bookmyshow.interfaces.MovieServiceInter;
import com.bookmyshow.models.Movie;
import com.bookmyshow.repository.MovieRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MovieService implements MovieServiceInter {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public ResponseEntity<?> getAllMovies() {
        return ResponseEntity.ok(movieRepository.findAll());
    }

    @Override
    public ResponseEntity<?> getMovieById(String movieId) {
        try {
            return movieRepository.findById(UUID.fromString(movieId))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to fetch movie by ID: {}. Error: {}", movieId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createMovie(Movie movie) {
        try {
            return ResponseEntity.ok(movieRepository.save(movie));
        } catch (Exception e) {
            log.error("Failed to create movie: {}. Error: {}", movie, e.getMessage());
            return ResponseEntity.status(500).body("Failed to create movie: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateMovie(String movieId, Movie movie) {
        try {
            if (movie == null
                    || movie.getTitle() == null || movie.getTitle().isEmpty()
                    || movie.getDescription() == null || movie.getDescription().isEmpty()) {
                throw new Exception("Movie Payload is invalid");
            }

            return movieRepository.findById(UUID.fromString(movieId))
                    .map(existingMovie -> {
                        existingMovie.setTitle(movie.getTitle());
                        existingMovie.setDescription(movie.getDescription());
                        existingMovie.setDurationMins(movie.getDurationMins());
                        existingMovie.setReleaseDate(movie.getReleaseDate());
                        return ResponseEntity.ok(movieRepository.save(existingMovie));
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
            return movieRepository.findById(UUID.fromString(movieId))
                    .map(movie -> {
                        movieRepository.delete(movie);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to delete movie with ID: {}. Error: {}", movieId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

}
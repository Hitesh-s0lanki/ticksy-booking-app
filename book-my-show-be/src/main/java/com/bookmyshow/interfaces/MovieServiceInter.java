package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.models.Movie;

public interface MovieServiceInter {

    public ResponseEntity<?> getAllMovies();

    public ResponseEntity<?> getMovieById(String movieId);

    public ResponseEntity<?> createMovie(Movie movie);

    public ResponseEntity<?> updateMovie(String movieId, Movie movie);

    public ResponseEntity<?> deleteMovie(String movieId);
}

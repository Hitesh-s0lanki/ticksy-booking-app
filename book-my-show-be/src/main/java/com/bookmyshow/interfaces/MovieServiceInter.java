package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.proto.MovieProto;

public interface MovieServiceInter {

    public ResponseEntity<?> getAllMovies(
            String title,
            String genre);

    public ResponseEntity<?> getMovieById(String movieId);

    public ResponseEntity<?> createMovie(MovieProto.MovieInput movie);

    public ResponseEntity<?> updateMovie(String movieId, MovieProto.Movie movie);

    public ResponseEntity<?> deleteMovie(String movieId);
}

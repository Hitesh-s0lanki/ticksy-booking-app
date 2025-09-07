package com.bookmyshow.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.proto.MovieProto;
import com.bookmyshow.service.MovieService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController()
@RequestMapping("movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping(produces = "application/x-protobuf")
    public ResponseEntity<?> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping(value = "{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> getMovieById(@PathVariable String id) {
        return movieService.getMovieById(id);
    }

    @PostMapping(produces = "application/x-protobuf")
    public ResponseEntity<?> createMovie(@RequestBody MovieProto.MovieInput movie) {
        return movieService.createMovie(movie);
    }

    @PatchMapping(value = "update/{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> updateMovie(@PathVariable String id, @RequestBody MovieProto.Movie movie) {
        return movieService.updateMovie(id, movie);
    }

    @DeleteMapping(value = "delete/{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> deleteMovie(@PathVariable String id) {
        return movieService.deleteMovie(id);
    }

}

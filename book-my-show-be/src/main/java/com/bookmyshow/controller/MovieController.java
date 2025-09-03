package com.bookmyshow.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.models.Movie;
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

    @GetMapping()
    public ResponseEntity<?> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("{id}")
    public ResponseEntity<?> getMovieById(@PathVariable String id) {
        return movieService.getMovieById(id);
    }

    @PostMapping()
    public ResponseEntity<?> createMovie(@RequestBody Movie movie) {
        return movieService.createMovie(movie);
    }

    @PatchMapping("update/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable String id, @RequestBody Movie movie) {
        return movieService.updateMovie(id, movie);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable String id) {
        return movieService.deleteMovie(id);
    }

}

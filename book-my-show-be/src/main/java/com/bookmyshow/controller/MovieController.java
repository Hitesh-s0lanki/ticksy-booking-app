package com.bookmyshow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.proto.MovieProto;
import com.bookmyshow.service.MovieService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController()
@RequestMapping("movies")
@Tag(name = "Movies", description = "Operations related to managing movie catalogue data.")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping(produces = "application/x-protobuf")
    @Operation(summary = "List movies", description = "Retrieve movies with optional filters for title and genre.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movies retrieved successfully."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching movies.")
    })
    public ResponseEntity<?> getAllMovies(
            @Parameter(description = "Optional case-insensitive filter on movie title.", example = "Inception")
            @RequestParam(required = false, defaultValue = "") String title,
            @Parameter(description = "Optional filter on movie genre.", example = "ACTION")
            @RequestParam(required = false, defaultValue = "") String genre) {
        return movieService.getAllMovies(title, genre);
    }

    @GetMapping(value = "{id}", produces = "application/x-protobuf")
    @Operation(summary = "Get movie", description = "Retrieve details for a single movie by its identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movie found."),
            @ApiResponse(responseCode = "404", description = "Movie not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching movie details.")
    })
    public ResponseEntity<?> getMovieById(@PathVariable String id) {
        return movieService.getMovieById(id);
    }

    @PostMapping(produces = "application/x-protobuf")
    @Operation(summary = "Create movie", description = "Create a new movie entry in the catalogue.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movie created successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid movie data supplied."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while creating movie.")
    })
    public ResponseEntity<?> createMovie(@RequestBody MovieProto.MovieInput movie) {
        return movieService.createMovie(movie);
    }

    @PatchMapping(value = "update/{id}", produces = "application/x-protobuf")
    @Operation(summary = "Update movie", description = "Apply partial updates to an existing movie.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movie updated successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid movie update supplied."),
            @ApiResponse(responseCode = "404", description = "Movie not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while updating movie.")
    })
    public ResponseEntity<?> updateMovie(@PathVariable String id, @RequestBody MovieProto.Movie movie) {
        return movieService.updateMovie(id, movie);
    }

    @DeleteMapping(value = "delete/{id}", produces = "application/x-protobuf")
    @Operation(summary = "Delete movie", description = "Remove a movie entry from the catalogue.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movie deleted successfully."),
            @ApiResponse(responseCode = "404", description = "Movie not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while deleting movie.")
    })
    public ResponseEntity<?> deleteMovie(@PathVariable String id) {
        return movieService.deleteMovie(id);
    }

}

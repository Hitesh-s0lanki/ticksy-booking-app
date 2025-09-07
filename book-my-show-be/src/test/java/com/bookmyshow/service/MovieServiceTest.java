package com.bookmyshow.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyshow.models.Movie;
import com.bookmyshow.proto.MovieProto;
import com.bookmyshow.repository.MovieRepository;

@ExtendWith(MockitoExtension.class)
class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @InjectMocks
    private MovieService movieService;

    @Test
    void testGetAllMovies() {
        Movie movie = new Movie();
        movie.setMovieId(UUID.randomUUID());
        movie.setTitle("Movie 1");
        movie.setDescription("Desc 1");
        movie.setDurationMins(120);
        List<Movie> movies = Arrays.asList(movie);

        when(movieRepository.findAll()).thenReturn(movies);

        ResponseEntity<?> response = movieService.getAllMovies();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MovieProto.AllMoviesResponse body = (MovieProto.AllMoviesResponse) response.getBody();
        assertEquals(1, body.getMoviesCount());
        assertEquals("Movie 1", body.getMovies(0).getTitle());
        verify(movieRepository).findAll();
    }

    @Test
    void testGetMovieById() {
        UUID id = UUID.randomUUID();
        Movie movie = new Movie();
        movie.setMovieId(id);
        movie.setTitle("Movie");
        movie.setDescription("Desc");
        movie.setDurationMins(90);

        when(movieRepository.findById(id)).thenReturn(Optional.of(movie));

        ResponseEntity<?> response = movieService.getMovieById(id.toString());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MovieProto.Movie body = (MovieProto.Movie) response.getBody();
        assertEquals("Movie", body.getTitle());
    }

    @Test
    void testCreateMovie() {
        MovieProto.MovieInput input = MovieProto.MovieInput.newBuilder()
                .setTitle("New Movie")
                .setDescription("Desc")
                .setDurationMins(100)
                .build();

        Movie saved = new Movie();
        saved.setMovieId(UUID.randomUUID());
        saved.setTitle("New Movie");
        saved.setDescription("Desc");
        saved.setDurationMins(100);

        when(movieRepository.save(any(Movie.class))).thenReturn(saved);

        ResponseEntity<?> response = movieService.createMovie(input);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MovieProto.Movie body = (MovieProto.Movie) response.getBody();
        assertEquals("New Movie", body.getTitle());
        verify(movieRepository).save(any(Movie.class));
    }

    @Test
    void testUpdateMovie() {
        UUID id = UUID.randomUUID();
        Movie existing = new Movie();
        existing.setMovieId(id);
        existing.setTitle("Old");
        existing.setDescription("Old Desc");
        existing.setDurationMins(100);
        existing.setReleaseDate(LocalDate.now());

        MovieProto.Movie update = MovieProto.Movie.newBuilder()
                .setMovieId(id.toString())
                .setTitle("New")
                .setDescription("New Desc")
                .setDurationMins(150)
                .setReleaseDate(LocalDate.now().plusDays(1).toString())
                .build();

        when(movieRepository.findById(id)).thenReturn(Optional.of(existing));
        when(movieRepository.save(any(Movie.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = movieService.updateMovie(id.toString(), update);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MovieProto.Movie body = (MovieProto.Movie) response.getBody();
        assertEquals("New", body.getTitle());
        assertEquals(150, body.getDurationMins());
        verify(movieRepository).save(existing);
    }

    @Test
    void testDeleteMovie() {
        UUID id = UUID.randomUUID();
        when(movieRepository.existsById(id)).thenReturn(true);

        ResponseEntity<?> response = movieService.deleteMovie(id.toString());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(movieRepository).deleteById(id);
    }
}


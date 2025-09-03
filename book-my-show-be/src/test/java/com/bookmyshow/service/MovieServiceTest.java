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
        assertEquals(movies, response.getBody());
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
        assertEquals(movie, response.getBody());
    }

    @Test
    void testCreateMovie() {
        Movie movie = new Movie();
        movie.setTitle("New Movie");
        movie.setDescription("Desc");
        movie.setDurationMins(100);

        when(movieRepository.save(movie)).thenReturn(movie);

        ResponseEntity<?> response = movieService.createMovie(movie);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(movie, response.getBody());
        verify(movieRepository).save(movie);
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

        Movie update = new Movie();
        update.setTitle("New");
        update.setDescription("New Desc");
        update.setDurationMins(150);
        update.setReleaseDate(LocalDate.now().plusDays(1));

        when(movieRepository.findById(id)).thenReturn(Optional.of(existing));
        when(movieRepository.save(any(Movie.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = movieService.updateMovie(id.toString(), update);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Movie saved = (Movie) response.getBody();
        assertEquals("New", saved.getTitle());
        assertEquals("New Desc", saved.getDescription());
        assertEquals(150, saved.getDurationMins());
        verify(movieRepository).save(existing);
    }

    @Test
    void testDeleteMovie() {
        UUID id = UUID.randomUUID();
        Movie movie = new Movie();
        movie.setMovieId(id);
        movie.setTitle("Movie");

        when(movieRepository.findById(id)).thenReturn(Optional.of(movie));

        ResponseEntity<?> response = movieService.deleteMovie(id.toString());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(movieRepository).delete(movie);
    }
}


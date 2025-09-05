package com.bookmyshow.service;

import com.bookmyshow.dto.ShowtimeDetails;
import com.bookmyshow.dto.ShowtimeInput;
import com.bookmyshow.dto.ShowtimeMovieResponse;
import com.bookmyshow.interfaces.ShowtimeServiceInter;
import com.bookmyshow.models.Movie;
import com.bookmyshow.models.Showtime;
import com.bookmyshow.repository.EventRepository;
import com.bookmyshow.repository.MovieRepository;
import com.bookmyshow.repository.ShowtimeRepository;
import com.bookmyshow.repository.VenueRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ShowtimeService implements ShowtimeServiceInter {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    public ResponseEntity<?> getAllShowtimes() {
        try {
            List<Showtime> showtimes = showtimeRepository.findAll();
            return ResponseEntity.ok(showtimes);
        } catch (Exception e) {
            log.error("Failed to fetch all showtimes. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getShowtimeById(String showtimeId) {
        try {
            Optional<Showtime> showtimeOpt = showtimeRepository.findById(UUID.fromString(showtimeId));
            if (showtimeOpt.isEmpty()) {
                throw new Exception("Showtime not found with ID: " + showtimeId);
            }
            return ResponseEntity.ok(showtimeOpt.get());
        } catch (Exception e) {
            log.error("Failed to fetch showtime by ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getShowtimesByMovieId(String movieId, String date) {
        try {

            if (date == null || date.isBlank()) {
                throw new Exception("Date parameter is required");
            }

            // get the movie reference
            Optional<Movie> movieOpt = movieRepository.findById(UUID.fromString(movieId));

            if (movieOpt.isEmpty()) {
                throw new Exception("Movie not found with ID: " + movieId);
            }
            Movie movie = movieOpt.get();

            List<Showtime> showtimes = showtimeRepository.findByMovieIdAndDate(movie.getMovieId(),
                    LocalDate.parse(date));

            // Group the showtimes by venue Id and get the venue details + movies

            List<ShowtimeMovieResponse> response = new ArrayList<>();

            // step 1: group by venue id
            var groupedByVenue = showtimes.stream()
                    .collect(Collectors.groupingBy(Showtime::getVenueId));
            log.info("Grouped showtimes by venue Id");

            // step 2: fetch venue details for each group
            groupedByVenue.forEach((venueId, showtimeList) -> {
                venueRepository.findById(venueId).ifPresent(venue -> {
                    // step 3: construct the response object
                    ShowtimeMovieResponse smr = new ShowtimeMovieResponse();
                    smr.setVenueId(venue.getVenueId().toString());
                    smr.setVenueName(venue.getName());
                    smr.setVenueLocation(venue.getAddress());
                    smr.setVenueMapUrl(venue.getMapUrl());

                    var showtimeDetails = showtimeList.stream().map(st -> {
                        var std = new ShowtimeDetails();
                        std.setShowtimeId(st.getShowtimeId().toString());
                        std.setStartAt(st.getStartAt().toString());
                        std.setEndAt(st.getEndAt().toString());
                        return std;
                    }).collect(Collectors.toList());

                    smr.setShowtimes(showtimeDetails);
                    response.add(smr);
                });
            });

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch showtimes by movie ID: {}. Error: {}", movieId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createShowtime(ShowtimeInput showtime) {
        try {

            if (showtime == null || showtime.getStartAt() == null || showtime.getDate() == null) {
                throw new Exception("Showtime payload is invalid " + showtime);
            }

            if (showtime.getVenueId() == null) {
                throw new Exception("Venue ID is required");
            }

            // Validate venue exists
            venueRepository.findById(UUID.fromString(showtime.getVenueId()))
                    .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

            // Parse IDs
            UUID venueUuid = UUID.fromString(showtime.getVenueId());
            UUID movieUuid = (showtime.getMovieId() != null &&
                    !showtime.getMovieId().isBlank())
                            ? UUID.fromString(showtime.getMovieId())
                            : null;
            UUID eventUuid = (showtime.getEventId() != null &&
                    !showtime.getEventId().isBlank())
                            ? UUID.fromString(showtime.getEventId())
                            : null;

            // Business rule: allow either movie OR event (not both, not neither)
            if (movieUuid != null && eventUuid != null) {
                throw new IllegalArgumentException("Provide either movie OR event, not both.");
            }
            if (movieUuid == null && eventUuid == null) {
                throw new IllegalArgumentException("Provide at least movie OR event.");
            }

            Showtime newShowtime = new Showtime();

            newShowtime.setVenueId(venueUuid);
            newShowtime.setMovieId(movieUuid);
            newShowtime.setEventId(eventUuid);
            newShowtime.setDate(showtime.getDate());
            newShowtime.setStartAt(showtime.getStartAt());

            if (movieUuid != null) {
                Movie movie = movieRepository.findById(movieUuid)
                        .orElseThrow(() -> new EntityNotFoundException("Movie not found"));
                newShowtime.setEndAt(showtime.getStartAt().plusMinutes(movie.getDurationMins()));
            } else if (eventUuid != null) {
                eventRepository.findById(eventUuid)
                        .orElseThrow(() -> new EntityNotFoundException("Event not found"));
                newShowtime.setEndAt(showtime.getStartAt().plusHours(2)); // Default 2 hours for events
            }

            Showtime saved = showtimeRepository.save(newShowtime);
            return ResponseEntity.ok(saved);
        } catch (EntityNotFoundException e) {
            log.error("Referenced entity not found: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid venue/movie/event id: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Failed to create showtime: {}. Error: {}", showtime, e.getMessage());
            return ResponseEntity.status(500).body("Failed to create showtime: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateShowtime(String showtimeId, Showtime showtime) {
        try {
            if (showtime == null || showtime.getStartAt() == null || showtime.getDate() == null) {
                throw new Exception("Showtime Payload is invalid");
            }

            return showtimeRepository.findById(UUID.fromString(showtimeId))
                    .map(existingShowtime -> {
                        existingShowtime.setStartAt(showtime.getStartAt());
                        existingShowtime.setEndAt(showtime.getEndAt());
                        existingShowtime.setDate(showtime.getDate());
                        return ResponseEntity.ok(showtimeRepository.save(existingShowtime));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to update showtime with ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteShowtime(String showtimeId) {
        try {
            return showtimeRepository.findById(UUID.fromString(showtimeId))
                    .map(showtime -> {
                        showtimeRepository.delete(showtime);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to delete showtime with ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }
}

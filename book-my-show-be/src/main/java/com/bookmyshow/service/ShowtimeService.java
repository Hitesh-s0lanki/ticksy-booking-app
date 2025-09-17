package com.bookmyshow.service;

import com.bookmyshow.interfaces.ShowtimeServiceInter;
import com.bookmyshow.models.Movie;
import com.bookmyshow.models.Showtime;
import com.bookmyshow.models.Venue;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.bookmyshow.proto.ShowtimeProto;
import com.bookmyshow.proto.UtilsProto;

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

            List<ShowtimeProto.Showtime> showtimeProtos = showtimes.stream()
                    .map(showtime -> ShowtimeProto.Showtime.newBuilder()
                            .setShowtimeId(showtime.getShowtimeId().toString())
                            .setMovieId(showtime.getMovieId().toString())
                            .setEventId(showtime.getEventId().toString())
                            .setVenueId(showtime.getVenueId().toString())
                            .setStartAt(showtime.getStartAt().toString())
                            .setEndAt(showtime.getEndAt().toString())
                            .setDate(showtime.getDate().toString())
                            .build())
                    .collect(Collectors.toList());

            ShowtimeProto.ShowtimeList response = ShowtimeProto.ShowtimeList.newBuilder()
                    .addAllShowtimes(showtimeProtos)
                    .build();

            return ResponseEntity.ok(response);
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

            // Fetch related entities
            Venue venue = venueRepository.findById(showtimeOpt.get().getVenueId())
                    .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

            Movie movie = null;
            if (showtimeOpt.get().getMovieId() != null) {
                movie = movieRepository.findById(showtimeOpt.get().getMovieId())
                        .orElseThrow(() -> new EntityNotFoundException("Movie not found"));
            }

            // Construct the protobuf response
            ShowtimeProto.ShowtimeDetailResponse showtimeProto = ShowtimeProto.ShowtimeDetailResponse.newBuilder()
                    .setShowtime(ShowtimeProto.Showtime.newBuilder()
                            .setShowtimeId(showtimeOpt.get().getShowtimeId().toString())
                            .setMovieId(
                                    showtimeOpt.get().getMovieId() != null ? showtimeOpt.get().getMovieId().toString()
                                            : "")
                            .setEventId(
                                    showtimeOpt.get().getEventId() != null ? showtimeOpt.get().getEventId().toString()
                                            : "")
                            .setVenueId(showtimeOpt.get().getVenueId().toString())
                            .setStartAt(showtimeOpt.get().getStartAt().toString())
                            .setEndAt(showtimeOpt.get().getEndAt().toString())
                            .setDate(showtimeOpt.get().getDate().toString())
                            .build())
                    .setVenueName(venue.getName())
                    .setVenueLocation(venue.getAddress())
                    .setVenueMapUrl(venue.getMapUrl())
                    .setMovieName(movie != null ? movie.getTitle() : "")
                    .setMovieDescription(movie != null ? movie.getDescription() : "")
                    .setMovieDuration(movie != null ? movie.getDurationMins().toString() : "0")
                    .setMovieImageUrl(movie != null ? movie.getImageKey() : "")
                    .setMoviePosterUrl(movie != null ? movie.getPosterKey() : "")
                    .setMovieRating(movie != null ? movie.getRating().toString() : "")
                    .build();

            return ResponseEntity.ok(showtimeProto);
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
            ShowtimeProto.ShowtimeMovieResponseList.Builder showtimeProtoResponses = ShowtimeProto.ShowtimeMovieResponseList
                    .newBuilder();

            // step 1: group by venue id
            var groupedByVenue = showtimes.stream()
                    .collect(Collectors.groupingBy(Showtime::getVenueId));
            log.info("Grouped showtimes by venue Id");

            // step 2: fetch venue details for each group
            groupedByVenue.forEach((venueId, showtimeList) -> {
                venueRepository.findById(venueId).ifPresent(venue -> {
                    // step 3: construct the response object
                    ShowtimeProto.ShowtimeMovieResponse.Builder smrBuilder = ShowtimeProto.ShowtimeMovieResponse
                            .newBuilder()
                            .setVenueId(venue.getVenueId().toString())
                            .setVenueName(venue.getName())
                            .setVenueLocation(venue.getAddress())
                            .setVenueMapUrl(venue.getMapUrl());

                    showtimeList.forEach(showtime -> {
                        ShowtimeProto.ShowtimeDetails stProto = ShowtimeProto.ShowtimeDetails.newBuilder()
                                .setShowtimeId(showtime.getShowtimeId().toString())
                                .setStartAt(showtime.getStartAt().toString())
                                .setEndAt(showtime.getEndAt().toString())
                                .build();

                        smrBuilder.addShowtimes(stProto);
                    });

                    showtimeProtoResponses.addResponses(smrBuilder.build());
                });
            });

            return ResponseEntity.ok(showtimeProtoResponses.build());
        } catch (Exception e) {
            log.error("Failed to fetch showtimes by movie ID: {}. Error: {}", movieId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createShowtime(ShowtimeProto.ShowtimeInput showtime) {
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
            // convert string to LocalDate
            newShowtime.setDate(LocalDate.parse(showtime.getDate()));
            newShowtime.setStartAt(LocalDateTime.parse(showtime.getStartAt()));

            if (movieUuid != null) {
                Movie movie = movieRepository.findById(movieUuid)
                        .orElseThrow(() -> new EntityNotFoundException("Movie not found"));
                newShowtime.setEndAt(LocalDateTime.parse(showtime.getStartAt()).plusMinutes(movie.getDurationMins()));
            } else if (eventUuid != null) {
                eventRepository.findById(eventUuid)
                        .orElseThrow(() -> new EntityNotFoundException("Event not found"));
                newShowtime.setEndAt(LocalDateTime.parse(showtime.getStartAt()).plusHours(2)); // Default 2 hours for
                                                                                               // events
            }

            Showtime saved = showtimeRepository.save(newShowtime);

            log.info("Created new showtime: {}", saved);

            // Return the created showtime as protobuf
            ShowtimeProto.Showtime showtimeProto = ShowtimeProto.Showtime.newBuilder()
                    .setShowtimeId(saved.getShowtimeId().toString())
                    .setMovieId(saved.getMovieId().toString())
                    .setEventId(saved.getEventId().toString())
                    .setVenueId(saved.getVenueId().toString())
                    .setStartAt(saved.getStartAt().toString())
                    .setEndAt(saved.getEndAt().toString())
                    .setDate(saved.getDate().toString())
                    .build();

            return ResponseEntity.ok(showtimeProto);

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
    public ResponseEntity<?> updateShowtime(String showtimeId, ShowtimeProto.Showtime showtime) {
        try {
            if (showtime == null || showtime.getStartAt() == null || showtime.getDate() == null) {
                throw new Exception("Showtime Payload is invalid");
            }

            if (showtimeId == null || showtimeId.trim().isEmpty()) {
                throw new Exception("Invalid showtime ID");
            }

            // check UUID format validity
            UUID uuid = UUID.fromString(showtimeId);
            if (!showtimeRepository.existsById(uuid)) {
                throw new Exception("Showtime not found");
            }

            // proceed to update
            Showtime uShowtime = new Showtime();
            uShowtime.setShowtimeId(UUID.fromString(showtimeId));
            uShowtime.setStartAt(LocalDateTime.parse(showtime.getStartAt()));
            uShowtime.setEndAt(LocalDateTime.parse(showtime.getEndAt()));
            uShowtime.setDate(LocalDate.parse(showtime.getDate()));

            showtimeRepository.save(uShowtime);

            UtilsProto.SuccessResponse response = UtilsProto.SuccessResponse.newBuilder()
                    .setMessage("Showtime updated successfully")
                    .setStatus(200)
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to update showtime with ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteShowtime(String showtimeId) {
        try {

            if (showtimeId == null || showtimeId.trim().isEmpty()) {
                throw new Exception("Invalid showtime ID");
            }

            // check UUID format validity
            UUID uuid = UUID.fromString(showtimeId);

            if (!showtimeRepository.existsById(uuid)) {
                throw new Exception("Showtime not found");
            }

            // proceed to delete
            showtimeRepository.deleteById(uuid);

            log.info("Deleted showtime with ID: {}", showtimeId);

            UtilsProto.SuccessResponse response = UtilsProto.SuccessResponse.newBuilder()
                    .setMessage("Showtime deleted successfully")
                    .setStatus(200)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete showtime with ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }
}

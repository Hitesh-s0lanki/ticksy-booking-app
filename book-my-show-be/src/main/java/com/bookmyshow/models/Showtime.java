package com.bookmyshow.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "showtimes")
public class Showtime {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "showtime_id", updatable = false, nullable = false)
    private UUID showtimeId;

    @Column(name = "venue_id", nullable = false)
    private UUID venueId;

    @Column(name = "event_id", nullable = true)
    private UUID eventId;

    @Column(name = "movie_id", nullable = true)
    private UUID movieId;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "show_date", nullable = false)
    private LocalDate date;
}

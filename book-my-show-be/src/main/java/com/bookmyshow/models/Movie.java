package com.bookmyshow.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "movie_id", updatable = false, nullable = false)
    private UUID movieId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @Column(length = 50)
    private List<String> genre;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "image_key", length = 255)
    private String imageKey;

    @Column(name = "poster_key", length = 255)
    private String posterKey;

    @ElementCollection
    @Column(name = "language")
    private List<String> languages;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

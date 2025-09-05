package com.bookmyshow.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.bookmyshow.enums.VenueType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "venue_id", updatable = false, nullable = false)
    private UUID venueId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "description", length = 500, columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String address;

    @Column(name = "map_url", nullable = true, length = 500)
    private String mapUrl;

    @Column(name = "venue_type", nullable = false)
    private VenueType venueType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

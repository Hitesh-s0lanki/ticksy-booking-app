package com.bookmyshow.service;

import com.bookmyshow.interfaces.VenueServiceInter;
import com.bookmyshow.models.Venue;
import com.bookmyshow.repository.VenueRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class VenueService implements VenueServiceInter {

    @Autowired
    private VenueRepository venueRepository;

    @Override
    public ResponseEntity<?> getAllVenues() {
        try {
            List<Venue> venues = venueRepository.findAll();
            return ResponseEntity.ok(venues);
        } catch (Exception e) {
            log.error("Failed to fetch all venues. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getVenueById(String venueId) {
        try {
            Optional<Venue> venueOpt = venueRepository.findById(UUID.fromString(venueId));
            if (venueOpt.isEmpty()) {
                throw new Exception("Venue not found with ID: " + venueId);
            }
            return ResponseEntity.ok(venueOpt.get());
        } catch (Exception e) {
            log.error("Failed to fetch venue by ID: {}. Error: {}", venueId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createVenue(Venue venue) {
        try {
            return ResponseEntity.ok(venueRepository.save(venue));
        } catch (Exception e) {
            log.error("Failed to create venue: {}. Error: {}", venue, e.getMessage());
            return ResponseEntity.status(500).body("Failed to create venue: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateVenue(String venueId, Venue venue) {
        try {
            if (venue == null || venue.getName() == null || venue.getName().isEmpty()) {
                throw new Exception("Venue Payload is invalid");
            }

            return venueRepository.findById(UUID.fromString(venueId))
                    .map(existingVenue -> {
                        existingVenue.setName(venue.getName());
                        existingVenue.setAddress(venue.getAddress());
                        return ResponseEntity.ok(venueRepository.save(existingVenue));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to update venue with ID: {}. Error: {}", venueId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteVenue(String venueId) {
        try {
            return venueRepository.findById(UUID.fromString(venueId))
                    .map(venue -> {
                        venueRepository.delete(venue);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to delete venue with ID: {}. Error: {}", venueId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }
}

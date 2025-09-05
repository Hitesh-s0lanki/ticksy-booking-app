package com.bookmyshow.interfaces;

import java.util.Optional;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.models.Venue;

public interface VenueServiceInter {

    ResponseEntity<?> getAllVenues(Optional<String> venueType);

    ResponseEntity<?> getVenueById(String venueId);

    ResponseEntity<?> createVenue(Venue venue);

    ResponseEntity<?> updateVenue(String venueId, Venue venue);

    ResponseEntity<?> deleteVenue(String venueId);
}

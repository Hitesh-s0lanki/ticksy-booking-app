package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.models.Venue;

public interface VenueServiceInter {

    ResponseEntity<?> getAllVenues();

    ResponseEntity<?> getVenueById(String venueId);

    ResponseEntity<?> createVenue(Venue venue);

    ResponseEntity<?> updateVenue(String venueId, Venue venue);

    ResponseEntity<?> deleteVenue(String venueId);
}

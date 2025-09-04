package com.bookmyshow.controller;

import com.bookmyshow.models.Venue;
import com.bookmyshow.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping()
    public ResponseEntity<?> getAllVenues() {
        return venueService.getAllVenues();
    }

    @GetMapping("{id}")
    public ResponseEntity<?> getVenueById(@PathVariable String id) {
        return venueService.getVenueById(id);
    }

    @PostMapping()
    public ResponseEntity<?> createVenue(@RequestBody Venue venue) {
        return venueService.createVenue(venue);
    }

    @PatchMapping("update/{id}")
    public ResponseEntity<?> updateVenue(@PathVariable String id, @RequestBody Venue venue) {
        return venueService.updateVenue(id, venue);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteVenue(@PathVariable String id) {
        return venueService.deleteVenue(id);
    }
}

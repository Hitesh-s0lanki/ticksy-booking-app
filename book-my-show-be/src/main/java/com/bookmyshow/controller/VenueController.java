package com.bookmyshow.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.models.Venue;
import com.bookmyshow.service.VenueService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("venues")
@Tag(name = "Venues", description = "Manage venue inventory and metadata.")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping()
    @Operation(summary = "List venues", description = "Retrieve all venues with an optional filter on venue type.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venues retrieved successfully."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching venues.")
    })
    public ResponseEntity<?> getAllVenues(
            @Parameter(description = "Optional filter restricting venues by type.", example = "THEATRE")
            @Param("venueType") String venueType) {
        return venueService.getAllVenues(Optional.ofNullable(venueType));
    }

    @GetMapping("{id}")
    @Operation(summary = "Get venue", description = "Retrieve venue details by identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue found."),
            @ApiResponse(responseCode = "404", description = "Venue not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching venue details.")
    })
    public ResponseEntity<?> getVenueById(@PathVariable String id) {
        return venueService.getVenueById(id);
    }

    @PostMapping()
    @Operation(summary = "Create venue", description = "Create a new venue record.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue created successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid venue data provided."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while creating venue.")
    })
    public ResponseEntity<?> createVenue(@RequestBody Venue venue) {
        return venueService.createVenue(venue);
    }

    @PatchMapping("update/{id}")
    @Operation(summary = "Update venue", description = "Update an existing venue record.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue updated successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid venue update provided."),
            @ApiResponse(responseCode = "404", description = "Venue not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while updating venue.")
    })
    public ResponseEntity<?> updateVenue(@PathVariable String id, @RequestBody Venue venue) {
        return venueService.updateVenue(id, venue);
    }

    @DeleteMapping("delete/{id}")
    @Operation(summary = "Delete venue", description = "Remove a venue from the catalogue.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue deleted successfully."),
            @ApiResponse(responseCode = "404", description = "Venue not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while deleting venue.")
    })
    public ResponseEntity<?> deleteVenue(@PathVariable String id) {
        return venueService.deleteVenue(id);
    }
}

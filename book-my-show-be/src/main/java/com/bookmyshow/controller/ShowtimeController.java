package com.bookmyshow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.proto.ShowtimeProto;
import com.bookmyshow.service.ShowtimeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("showtimes")
@Tag(name = "Showtimes", description = "Endpoints for scheduling and querying movie showtimes.")
public class ShowtimeController {

    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping(produces = "application/x-protobuf")
    @Operation(summary = "List showtimes", description = "Retrieve every scheduled showtime.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Showtimes retrieved successfully."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching showtimes.")
    })
    public ResponseEntity<?> getAllShowtimes() {
        return showtimeService.getAllShowtimes();
    }

    @GetMapping(value = "by-movie/{movieId}", produces = "application/x-protobuf")
    @Operation(summary = "List showtimes by movie", description = "Retrieve showtimes for a particular movie on a given date.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Showtimes retrieved successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters supplied."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching showtimes.")
    })
    public ResponseEntity<?> getShowtimesByMovieId(@PathVariable String movieId,
            @Parameter(description = "ISO-8601 date (yyyy-MM-dd) to filter showtimes.", example = "2024-08-21")
            @RequestParam String date) {
        return showtimeService.getShowtimesByMovieId(movieId, date);
    }

    @GetMapping(value = "by-event/{eventId}", produces = "application/x-protobuf")
    public ResponseEntity<?> getShowtimeByEventId(@PathVariable String eventId) {
        return showtimeService.getShowtimeByEventId(eventId);
    }

    @GetMapping(value = "{showtimeId}", produces = "application/x-protobuf")
    @Operation(summary = "Get showtime", description = "Retrieve showtime details by identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Showtime found."),
            @ApiResponse(responseCode = "404", description = "Showtime not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching showtime details.")
    })
    public ResponseEntity<?> getShowtimeById(@PathVariable String showtimeId) {
        return showtimeService.getShowtimeById(showtimeId);
    }

    @GetMapping(value = "booked-seats/{showtimeId}", produces = "application/x-protobuf")
    @Operation(summary = "Get booked seats", description = "Retrieve the seats that have already been booked for a showtime.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booked seats retrieved successfully."),
            @ApiResponse(responseCode = "404", description = "Showtime not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching booked seats.")
    })
    public ResponseEntity<?> getBookedSeats(@PathVariable String showtimeId) {
        return showtimeService.getBookedSeats(showtimeId);
    }

    @PostMapping(produces = "application/x-protobuf")
    @Operation(summary = "Create showtime", description = "Create a new showtime schedule.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Showtime created successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid showtime data provided."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while creating showtime.")
    })
    public ResponseEntity<?> createShowtime(@RequestBody ShowtimeProto.ShowtimeInput showtime) {
        return showtimeService.createShowtime(showtime);
    }

    @PatchMapping(value = "update/{id}", produces = "application/x-protobuf")
    @Operation(summary = "Update showtime", description = "Update an existing showtime schedule.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Showtime updated successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid showtime update provided."),
            @ApiResponse(responseCode = "404", description = "Showtime not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while updating showtime.")
    })
    public ResponseEntity<?> updateShowtime(@PathVariable String id, @RequestBody ShowtimeProto.Showtime showtime) {
        return showtimeService.updateShowtime(id, showtime);
    }

    @DeleteMapping(value = "delete/{id}", produces = "application/x-protobuf")
    @Operation(summary = "Delete showtime", description = "Remove a showtime from the schedule.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Showtime deleted successfully."),
            @ApiResponse(responseCode = "404", description = "Showtime not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while deleting showtime.")
    })
    public ResponseEntity<?> deleteShowtime(@PathVariable String id) {
        return showtimeService.deleteShowtime(id);
    }
}
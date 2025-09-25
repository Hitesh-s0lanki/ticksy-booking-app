package com.bookmyshow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.proto.BookingProto;
import com.bookmyshow.service.BookingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("bookings")
@Slf4j
@Tag(name = "Bookings", description = "Endpoints for managing ticket bookings and reservations.")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping(consumes = "application/x-protobuf", produces = "application/x-protobuf")
    @Operation(summary = "Create booking", description = "Create a new ticket booking for a showtime.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking created successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid booking data provided."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while creating booking.")
    })
    public ResponseEntity<?> createBooking(@RequestBody BookingProto.CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping(value = "{bookingId}", produces = "application/x-protobuf")
    @Operation(summary = "Get booking", description = "Retrieve booking details by identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking found."),
            @ApiResponse(responseCode = "404", description = "Booking not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching booking details.")
    })
    public ResponseEntity<?> getBookingById(@PathVariable String bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @GetMapping(produces = "application/x-protobuf")
    @Operation(summary = "List user bookings", description = "Retrieve bookings for a user with optional pagination.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters supplied."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching bookings.")
    })
    public ResponseEntity<?> listBookings(
            @Parameter(description = "User identifier to fetch bookings for.", required = true)
            @RequestParam String userId,
            @Parameter(description = "Optional page number for pagination.", example = "0")
            @RequestParam(required = false) Integer pageNumber,
            @Parameter(description = "Optional page size for pagination.", example = "10")
            @RequestParam(required = false) Integer pageSize) {
        return bookingService.listBookings(userId, pageNumber, pageSize);
    }

    @GetMapping(value = "showtime/{showtimeId}", produces = "application/x-protobuf")
    @Operation(summary = "List bookings for showtime", description = "Retrieve bookings for a specific showtime.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully."),
            @ApiResponse(responseCode = "404", description = "Showtime not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching bookings.")
    })
    public ResponseEntity<?> getBookingsForShowtime(@PathVariable String showtimeId) {
        return bookingService.getBookingsForShowtime(showtimeId);
    }

    @PatchMapping(value = "{bookingId}/status", consumes = "application/x-protobuf", produces = "application/x-protobuf")
    @Operation(summary = "Update booking status", description = "Update the status of an existing booking.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking status updated successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid status update provided."),
            @ApiResponse(responseCode = "404", description = "Booking not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while updating booking.")
    })
    public ResponseEntity<?> updateBookingStatus(@PathVariable String bookingId,
            @RequestBody BookingProto.UpdateBookingStatusRequest request) {
        return bookingService.updateBookingStatus(bookingId, request);
    }
}

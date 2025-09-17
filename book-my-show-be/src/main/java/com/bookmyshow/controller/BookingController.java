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

import com.bookmyshow.model.booking.BookingProto;
import com.bookmyshow.service.BookingService;

@RestController
@RequestMapping("bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping(consumes = "application/x-protobuf", produces = "application/x-protobuf")
    public ResponseEntity<?> createBooking(@RequestBody BookingProto.CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping(value = "{bookingId}", produces = "application/x-protobuf")
    public ResponseEntity<?> getBookingById(@PathVariable String bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @GetMapping(produces = "application/x-protobuf")
    public ResponseEntity<?> listBookings(
            @RequestParam String userId,
            @RequestParam(required = false) Integer pageNumber,
            @RequestParam(required = false) Integer pageSize) {
        return bookingService.listBookings(userId, pageNumber, pageSize);
    }

    @GetMapping(value = "showtime/{showtimeId}", produces = "application/x-protobuf")
    public ResponseEntity<?> getBookingsForShowtime(@PathVariable String showtimeId) {
        return bookingService.getBookingsForShowtime(showtimeId);
    }

    @PatchMapping(value = "{bookingId}/status", consumes = "application/x-protobuf", produces = "application/x-protobuf")
    public ResponseEntity<?> updateBookingStatus(@PathVariable String bookingId,
            @RequestBody BookingProto.UpdateBookingStatusRequest request) {
        return bookingService.updateBookingStatus(bookingId, request);
    }
}


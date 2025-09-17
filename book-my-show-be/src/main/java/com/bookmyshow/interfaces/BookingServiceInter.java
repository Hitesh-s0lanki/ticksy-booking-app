package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.model.booking.BookingProto;

public interface BookingServiceInter {

    ResponseEntity<?> createBooking(BookingProto.CreateBookingRequest request);

    ResponseEntity<?> getBookingById(String bookingId);

    ResponseEntity<?> listBookings(String userId, Integer pageNumber, Integer pageSize);

    ResponseEntity<?> getBookingsForShowtime(String showtimeId);

    ResponseEntity<?> updateBookingStatus(String bookingId, BookingProto.UpdateBookingStatusRequest request);
}


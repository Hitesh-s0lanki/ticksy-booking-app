package com.bookmyshow.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.bookmyshow.enums.BookingStatusEnum;
import com.bookmyshow.interfaces.BookingServiceInter;
import com.bookmyshow.model.booking.BookingProto;
import com.bookmyshow.models.Booking;
import com.bookmyshow.models.Showtime;
import com.bookmyshow.repository.BookingRepository;
import com.bookmyshow.repository.EventRepository;
import com.bookmyshow.repository.MovieRepository;
import com.bookmyshow.repository.ShowtimeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BookingService implements BookingServiceInter {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    public ResponseEntity<?> createBooking(BookingProto.CreateBookingRequest request) {
        try {
            validateCreateRequest(request);

            UUID showtimeUuid = parseUuid(request.getShowtimeId(), "showtime_id");
            Showtime showtime = showtimeRepository.findById(showtimeUuid)
                    .orElseThrow(() -> new EntityNotFoundException("Showtime not found"));

            UUID movieUuid = parseOptionalUuid(request.getMovieId());
            UUID eventUuid = parseOptionalUuid(request.getEventId());

            if (movieUuid != null && eventUuid != null) {
                throw new IllegalArgumentException("Provide either movie_id or event_id, not both");
            }

            if (movieUuid == null && eventUuid == null) {
                movieUuid = showtime.getMovieId();
                eventUuid = showtime.getEventId();
            }

            if (movieUuid == null && eventUuid == null) {
                throw new IllegalArgumentException("Either movie_id or event_id must be provided");
            }

            if (movieUuid != null) {
                movieRepository.findById(movieUuid)
                        .orElseThrow(() -> new EntityNotFoundException("Movie not found"));
            }

            if (eventUuid != null) {
                eventRepository.findById(eventUuid)
                        .orElseThrow(() -> new EntityNotFoundException("Event not found"));
            }

            List<String> normalizedSeats = normalizeSeats(request.getSeatsList());
            ensureSeatsAvailable(showtimeUuid.toString(), normalizedSeats);

            Booking booking = new Booking();
            booking.setUserId(request.getUserId());
            booking.setShowtimeId(showtimeUuid.toString());
            booking.setMovieId(movieUuid);
            booking.setEventId(eventUuid);
            booking.setSeats(normalizedSeats);
            booking.setSeatsCount(normalizedSeats.size());
            booking.setAmountWithoutGST(parseAmount(request.getAmountWithoutGst(), "amount_without_gst"));
            booking.setGst(parseAmount(request.getGst(), "gst"));
            booking.setTotalAmount(parseAmount(request.getTotalAmount(), "total_amount"));
            booking.setPdfUrl(trimToNull(request.getPdfUrl()));
            booking.setQrUrl(trimToNull(request.getQrUrl()));
            booking.setStatus(BookingStatusEnum.ACTIVE);
            booking.setShowDatetime(showtime.getStartAt());

            if (request.hasRazorpay()) {
                BookingProto.RazorpaySuccessResponse razorpay = request.getRazorpay();
                booking.setRazorpayOrderId(trimToNull(razorpay.getRazorpayOrderId()));
                booking.setRazorpayPaymentId(trimToNull(razorpay.getRazorpayPaymentId()));
                booking.setRazorpaySignature(trimToNull(razorpay.getRazorpaySignature()));
            }

            Booking saved = bookingRepository.save(booking);

            BookingProto.CreateBookingResponse response = BookingProto.CreateBookingResponse.newBuilder()
                    .setBooking(toProto(saved))
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error while creating booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body("[ERROR]: " + e.getMessage());
        } catch (EntityNotFoundException e) {
            log.error("Entity not found while creating booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body("[ERROR]: " + e.getMessage());
        } catch (DataIntegrityViolationException e) {
            log.error("Database constraint violation while creating booking: {}", e.getMessage());
            return ResponseEntity.status(409).body("[ERROR]: Duplicate booking detected");
        } catch (Exception e) {
            log.error("Unexpected error while creating booking: {}", e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getBookingById(String bookingId) {
        try {
            UUID uuid = parseUuid(bookingId, "booking_id");
            Optional<Booking> bookingOpt = bookingRepository.findById(uuid);

            if (bookingOpt.isEmpty()) {
                throw new EntityNotFoundException("Booking not found");
            }

            BookingProto.GetBookingResponse response = BookingProto.GetBookingResponse.newBuilder()
                    .setBooking(toProto(bookingOpt.get()))
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("[ERROR]: " + e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("[ERROR]: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to fetch booking {}: {}", bookingId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> listBookings(String userId, Integer pageNumber, Integer pageSize) {
        try {
            if (userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("user_id is required");
            }

            int page = pageNumber != null && pageNumber >= 0 ? pageNumber : 0;
            int size = pageSize != null && pageSize > 0 ? Math.min(pageSize, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "bookedAt"));
            Page<Booking> bookingPage = bookingRepository.findByUserId(userId, pageable);

            List<BookingProto.Booking> bookingProtos = bookingPage.getContent().stream()
                    .map(this::toProto)
                    .toList();

            int total = bookingPage.getTotalElements() > Integer.MAX_VALUE
                    ? Integer.MAX_VALUE
                    : (int) bookingPage.getTotalElements();

            BookingProto.ListBookingsResponse response = BookingProto.ListBookingsResponse.newBuilder()
                    .addAllBookings(bookingProtos)
                    .setTotal(total)
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("[ERROR]: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to list bookings for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getBookingsForShowtime(String showtimeId) {
        try {
            parseUuid(showtimeId, "showtime_id");

            List<Booking> bookings = bookingRepository.findByShowtimeId(showtimeId);

            List<BookingProto.Booking> bookingProtos = bookings.stream()
                    .map(this::toProto)
                    .collect(Collectors.toList());

            BookingProto.ListBookingsResponse response = BookingProto.ListBookingsResponse.newBuilder()
                    .addAllBookings(bookingProtos)
                    .setTotal(bookingProtos.size())
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("[ERROR]: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to fetch bookings for showtime {}: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateBookingStatus(String bookingId, BookingProto.UpdateBookingStatusRequest request) {
        try {
            String requestBookingId = request.getBookingId();
            String effectiveId = bookingId != null && !bookingId.isBlank() ? bookingId : requestBookingId;

            if (effectiveId == null || effectiveId.isBlank()) {
                throw new IllegalArgumentException("booking_id is required");
            }

            if (requestBookingId != null && !requestBookingId.isBlank()
                    && bookingId != null && !bookingId.isBlank()
                    && !bookingId.equals(requestBookingId)) {
                throw new IllegalArgumentException("booking_id mismatch between path and payload");
            }

            if (request.getStatus() == BookingProto.BookingStatus.BOOKING_STATUS_UNSPECIFIED) {
                throw new IllegalArgumentException("status is required");
            }

            UUID uuid = parseUuid(effectiveId, "booking_id");

            Booking booking = bookingRepository.findById(uuid)
                    .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

            BookingStatusEnum newStatus = mapProtoStatus(request.getStatus());
            booking.setStatus(newStatus);

            Booking updated = bookingRepository.save(booking);

            BookingProto.UpdateBookingStatusResponse response = BookingProto.UpdateBookingStatusResponse.newBuilder()
                    .setBooking(toProto(updated))
                    .build();

            if (request.getReason() != null && !request.getReason().isBlank()) {
                log.info("Booking {} status updated to {}. Reason: {}", effectiveId, newStatus, request.getReason());
            } else {
                log.info("Booking {} status updated to {}", effectiveId, newStatus);
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("[ERROR]: " + e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("[ERROR]: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to update booking status for {}: {}", bookingId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    private void validateCreateRequest(BookingProto.CreateBookingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("user_id is required");
        }

        if (request.getShowtimeId() == null || request.getShowtimeId().isBlank()) {
            throw new IllegalArgumentException("showtime_id is required");
        }

        if (request.getSeatsList().isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected");
        }

        if (request.getAmountWithoutGst() == null || request.getAmountWithoutGst().isBlank()) {
            throw new IllegalArgumentException("amount_without_gst is required");
        }

        if (request.getGst() == null || request.getGst().isBlank()) {
            throw new IllegalArgumentException("gst is required");
        }

        if (request.getTotalAmount() == null || request.getTotalAmount().isBlank()) {
            throw new IllegalArgumentException("total_amount is required");
        }
    }

    private UUID parseUuid(String value, String fieldName) {
        try {
            return UUID.fromString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException(fieldName + " must be a valid UUID");
        }
    }

    private UUID parseOptionalUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return parseUuid(value, "id");
    }

    private BigDecimal parseAmount(String value, String fieldName) {
        try {
            return new BigDecimal(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid " + fieldName + " value");
        }
    }

    private List<String> normalizeSeats(List<String> seats) {
        if (seats == null || seats.isEmpty()) {
            throw new IllegalArgumentException("At least one valid seat must be provided");
        }

        List<String> normalized = new ArrayList<>();
        for (String seat : seats) {
            if (seat == null) {
                continue;
            }
            String transformed = seat.trim().toUpperCase();
            if (!transformed.isBlank()) {
                normalized.add(transformed);
            }
        }

        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("At least one valid seat must be provided");
        }

        Set<String> unique = new LinkedHashSet<>(normalized);
        if (unique.size() != normalized.size()) {
            throw new IllegalArgumentException("Duplicate seats detected in request");
        }

        return new ArrayList<>(unique);
    }

    private void ensureSeatsAvailable(String showtimeId, List<String> requestedSeats) {
        if (requestedSeats.isEmpty()) {
            return;
        }

        List<Booking> conflictingBookings = bookingRepository.findByShowtimeIdAndStatusIn(showtimeId,
                List.of(BookingStatusEnum.ACTIVE, BookingStatusEnum.NONACTIVE));

        if (conflictingBookings.isEmpty()) {
            return;
        }

        Set<String> alreadyBooked = conflictingBookings.stream()
                .map(Booking::getSeats)
                .filter(seatList -> seatList != null && !seatList.isEmpty())
                .flatMap(List::stream)
                .map(seat -> seat == null ? null : seat.trim().toUpperCase())
                .filter(seat -> seat != null && !seat.isBlank())
                .collect(Collectors.toSet());

        List<String> conflicts = requestedSeats.stream()
                .filter(alreadyBooked::contains)
                .toList();

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException(
                    "Seats already booked for this showtime: " + String.join(", ", conflicts));
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BookingProto.Booking toProto(Booking booking) {
        BookingProto.Booking.Builder builder = BookingProto.Booking.newBuilder()
                .setBookingId(booking.getBookingId().toString())
                .setUserId(booking.getUserId())
                .setShowtimeId(booking.getShowtimeId())
                .setAmountWithoutGst(booking.getAmountWithoutGST() != null
                        ? booking.getAmountWithoutGST().toPlainString()
                        : "")
                .setGst(booking.getGst() != null ? booking.getGst().toPlainString() : "")
                .setTotalAmount(booking.getTotalAmount() != null ? booking.getTotalAmount().toPlainString() : "")
                .setSeatsCount(booking.getSeatsCount() != null ? booking.getSeatsCount() : 0)
                .setStatus(mapEntityStatus(booking.getStatus()))
                .setBookedAt(booking.getBookedAt() != null ? booking.getBookedAt().toString() : "");

        if (booking.getMovieId() != null) {
            builder.setMovieId(booking.getMovieId().toString());
        }

        if (booking.getEventId() != null) {
            builder.setEventId(booking.getEventId().toString());
        }

        if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            builder.addAllSeats(booking.getSeats());
        }

        if (booking.getPdfUrl() != null) {
            builder.setPdfUrl(booking.getPdfUrl());
        }

        if (booking.getQrUrl() != null) {
            builder.setQrUrl(booking.getQrUrl());
        }

        if (booking.getShowDatetime() != null) {
            builder.setShowDatetime(booking.getShowDatetime().toString());
        }

        if (booking.getRazorpayOrderId() != null || booking.getRazorpayPaymentId() != null
                || booking.getRazorpaySignature() != null) {
            BookingProto.RazorpaySuccessResponse.Builder razorpayBuilder = BookingProto.RazorpaySuccessResponse
                    .newBuilder();
            if (booking.getRazorpayPaymentId() != null) {
                razorpayBuilder.setRazorpayPaymentId(booking.getRazorpayPaymentId());
            }
            if (booking.getRazorpayOrderId() != null) {
                razorpayBuilder.setRazorpayOrderId(booking.getRazorpayOrderId());
            }
            if (booking.getRazorpaySignature() != null) {
                razorpayBuilder.setRazorpaySignature(booking.getRazorpaySignature());
            }
            builder.setRazorpay(razorpayBuilder.build());
        }

        return builder.build();
    }

    private BookingProto.BookingStatus mapEntityStatus(BookingStatusEnum status) {
        if (status == null) {
            return BookingProto.BookingStatus.BOOKING_STATUS_UNSPECIFIED;
        }

        return switch (status) {
            case ACTIVE -> BookingProto.BookingStatus.ACTIVE;
            case CANCEL -> BookingProto.BookingStatus.CANCEL;
            case NONACTIVE -> BookingProto.BookingStatus.NONACTIVE;
        };
    }

    private BookingStatusEnum mapProtoStatus(BookingProto.BookingStatus status) {
        return switch (status) {
            case ACTIVE -> BookingStatusEnum.ACTIVE;
            case CANCEL -> BookingStatusEnum.CANCEL;
            case NONACTIVE -> BookingStatusEnum.NONACTIVE;
            default -> throw new IllegalArgumentException("Unsupported booking status");
        };
    }
}


package com.bookmyshow.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Check;

import com.bookmyshow.enums.BookingStatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_bookings_user", columnList = "user_id"),
        @Index(name = "idx_bookings_showtime", columnList = "showtime_id"),
        @Index(name = "idx_bookings_movie", columnList = "movie_id"),
        @Index(name = "idx_bookings_event", columnList = "event_id"),
        @Index(name = "idx_bookings_status", columnList = "status")
})
@Check(constraints = "(movie_id IS NOT NULL OR event_id IS NOT NULL)")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "booking_id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID bookingId;

    // Keep a lightweight relation to User (optional: change to userId UUID if you
    @Column(name = "user_id", nullable = false, length = 64)
    private String user_id;

    // Either movieId or eventId (IDs only, no heavy joins)
    @Column(name = "movie_id", columnDefinition = "uuid")
    private UUID movieId;

    @Column(name = "event_id", columnDefinition = "uuid")
    private UUID eventId;

    // Razorpay/business identifiers
    @Column(name = "showtime_id", nullable = false, length = 64)
    private String showtimeId;

    // Optional show start (kept if you want snapshot info at booking time)
    @Column(name = "show_datetime")
    private LocalDateTime showDatetime;

    // Seats selected (A1, B3, etc.) stored in a separate table
    @ElementCollection
    @CollectionTable(name = "booking_seats", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "seat_label", length = 16, nullable = false)
    private List<String> seats;

    @Column(name = "seats_count", nullable = false)
    private Integer seatsCount;

    // Pricing snapshot at time of booking
    // Use a wider precision than 8,2 to avoid overflow for multi-seat orders
    @Column(name = "amount_without_gst", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountWithoutGST;

    @Column(name = "gst_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal gst;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // Razorpay success response fields (for reconciliation)
    @Column(name = "rzp_payment_id", length = 64)
    private String razorpayPaymentId;

    @Column(name = "rzp_order_id", length = 64)
    private String razorpayOrderId;

    @Column(name = "rzp_signature", length = 256)
    private String razorpaySignature;

    // Artifacts
    @Column(name = "pdf_url", length = 512)
    private String pdfUrl;

    @Column(name = "qr_url", length = 512)
    private String qrUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private BookingStatusEnum status;

    @Column(name = "booked_at", nullable = false)
    private LocalDateTime bookedAt;

    @PrePersist
    void onCreate() {
        if (bookedAt == null)
            bookedAt = LocalDateTime.now();
        if (status == null)
            status = BookingStatusEnum.ACTIVE;
        if (seats != null && (seatsCount == null || seatsCount == 0)) {
            seatsCount = seats.size();
        }
    }

}
package com.bookmyshow.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BookingTicketData(
                UUID bookingId,
                String userName,
                String title, // movie or event title
                String category, // "MOVIE" or "EVENT"
                String venueName,
                String venueLocation,
                LocalDateTime showDateTime,
                List<String> seats,
                BigDecimal totalAmount,
                String orderId, // razorpay_order_id
                String paymentId // razorpay_payment_id
) {
}

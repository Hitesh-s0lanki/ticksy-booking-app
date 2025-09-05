package com.bookmyshow.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowtimeInput {
    private String venueId;
    private String movieId;
    private String eventId;
    private LocalDate date;
    private LocalDateTime startAt;
}

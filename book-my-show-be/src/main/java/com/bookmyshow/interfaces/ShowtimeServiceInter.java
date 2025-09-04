package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.models.Showtime;

public interface ShowtimeServiceInter {

    ResponseEntity<?> getAllShowtimes();

    ResponseEntity<?> getShowtimeById(String showtimeId);

    ResponseEntity<?> createShowtime(Showtime showtime);

    ResponseEntity<?> updateShowtime(String showtimeId, Showtime showtime);

    ResponseEntity<?> deleteShowtime(String showtimeId);
}

package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.dto.ShowtimeInput;
import com.bookmyshow.models.Showtime;

public interface ShowtimeServiceInter {

    ResponseEntity<?> getAllShowtimes();

    ResponseEntity<?> getShowtimeById(String showtimeId);

    ResponseEntity<?> createShowtime(ShowtimeInput showtime);

    ResponseEntity<?> updateShowtime(String showtimeId, Showtime showtime);

    ResponseEntity<?> deleteShowtime(String showtimeId);

    ResponseEntity<?> getShowtimesByMovieId(String movieId, String date);
}

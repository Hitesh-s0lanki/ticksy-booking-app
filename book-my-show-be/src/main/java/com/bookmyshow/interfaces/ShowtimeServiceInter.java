package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.proto.ShowtimeProto;

public interface ShowtimeServiceInter {

    ResponseEntity<?> getAllShowtimes();

    ResponseEntity<?> getShowtimeById(String showtimeId);

    ResponseEntity<?> createShowtime(ShowtimeProto.ShowtimeInput showtime);

    ResponseEntity<?> updateShowtime(String showtimeId, ShowtimeProto.Showtime showtime);

    ResponseEntity<?> deleteShowtime(String showtimeId);

    ResponseEntity<?> getShowtimesByMovieId(String movieId, String date);
}

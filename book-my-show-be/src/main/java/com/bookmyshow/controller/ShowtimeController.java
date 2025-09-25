package com.bookmyshow.controller;

import com.bookmyshow.proto.ShowtimeProto;
import com.bookmyshow.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("showtimes")
public class ShowtimeController {

    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping(produces = "application/x-protobuf")
    public ResponseEntity<?> getAllShowtimes() {
        return showtimeService.getAllShowtimes();
    }

    @GetMapping(value = "by-movie/{movieId}", produces = "application/x-protobuf")
    public ResponseEntity<?> getShowtimesByMovieId(@PathVariable String movieId,
            @RequestParam String date) {
        return showtimeService.getShowtimesByMovieId(movieId, date);
    }

    @GetMapping(value = "by-event/{eventId}", produces = "application/x-protobuf")
    public ResponseEntity<?> getShowtimeByEventId(@PathVariable String eventId) {
        return showtimeService.getShowtimeByEventId(eventId);
    }

    @GetMapping(value = "{showtimeId}", produces = "application/x-protobuf")
    public ResponseEntity<?> getShowtimeById(@PathVariable String showtimeId) {
        return showtimeService.getShowtimeById(showtimeId);
    }

    @GetMapping(value = "booked-seats/{showtimeId}", produces = "application/x-protobuf")
    public ResponseEntity<?> getBookedSeats(@PathVariable String showtimeId) {
        return showtimeService.getBookedSeats(showtimeId);
    }

    @PostMapping(produces = "application/x-protobuf")
    public ResponseEntity<?> createShowtime(@RequestBody ShowtimeProto.ShowtimeInput showtime) {
        return showtimeService.createShowtime(showtime);
    }

    @PatchMapping(value = "update/{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> updateShowtime(@PathVariable String id, @RequestBody ShowtimeProto.Showtime showtime) {
        return showtimeService.updateShowtime(id, showtime);
    }

    @DeleteMapping(value = "delete/{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> deleteShowtime(@PathVariable String id) {
        return showtimeService.deleteShowtime(id);
    }
}
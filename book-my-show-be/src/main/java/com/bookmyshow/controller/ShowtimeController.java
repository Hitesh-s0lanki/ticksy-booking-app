package com.bookmyshow.controller;

import com.bookmyshow.models.Showtime;
import com.bookmyshow.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("showtimes")
public class ShowtimeController {

    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping()
    public ResponseEntity<?> getAllShowtimes() {
        return showtimeService.getAllShowtimes();
    }

    @GetMapping("{id}")
    public ResponseEntity<?> getShowtimeById(@PathVariable String id) {
        return showtimeService.getShowtimeById(id);
    }

    @PostMapping()
    public ResponseEntity<?> createShowtime(@RequestBody Showtime showtime) {
        return showtimeService.createShowtime(showtime);
    }

    @PatchMapping("update/{id}")
    public ResponseEntity<?> updateShowtime(@PathVariable String id, @RequestBody Showtime showtime) {
        return showtimeService.updateShowtime(id, showtime);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteShowtime(@PathVariable String id) {
        return showtimeService.deleteShowtime(id);
    }
}

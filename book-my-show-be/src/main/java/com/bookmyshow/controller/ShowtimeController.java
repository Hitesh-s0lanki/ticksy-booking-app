package com.bookmyshow.controller;

import com.bookmyshow.dto.ShowtimeDetails;
import com.bookmyshow.dto.ShowtimeInput;
import com.bookmyshow.dto.ShowtimeMovieResponse;
import com.bookmyshow.models.Showtime;
import com.bookmyshow.proto.ShowtimeProto;
import com.bookmyshow.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("showtimes")
public class ShowtimeController {

    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping(produces = "application/x-protobuf")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ShowtimeProto.ShowtimeList> getAllShowtimes() {
        ResponseEntity<?> resp = showtimeService.getAllShowtimes();
        if (resp.getStatusCode().is2xxSuccessful()) {
            List<Showtime> showtimes = (List<Showtime>) resp.getBody();
            ShowtimeProto.ShowtimeList.Builder builder = ShowtimeProto.ShowtimeList.newBuilder();
            showtimes.forEach(st -> builder.addShowtimes(toProto(st)));
            return ResponseEntity.ok(builder.build());
        }
        return ResponseEntity.status(resp.getStatusCode()).build();
    }

    @GetMapping(value = "by-movie/{movieId}", produces = "application/x-protobuf")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ShowtimeProto.ShowtimeMovieResponseList> getShowtimesByMovieId(@PathVariable String movieId,
            @RequestParam String date) {
        ResponseEntity<?> resp = showtimeService.getShowtimesByMovieId(movieId, date);
        if (resp.getStatusCode().is2xxSuccessful()) {
            List<ShowtimeMovieResponse> list = (List<ShowtimeMovieResponse>) resp.getBody();
            ShowtimeProto.ShowtimeMovieResponseList.Builder builder = ShowtimeProto.ShowtimeMovieResponseList
                    .newBuilder();
            list.forEach(item -> builder.addResponses(toProto(item)));
            return ResponseEntity.ok(builder.build());
        }
        return ResponseEntity.status(resp.getStatusCode()).build();
    }

    @GetMapping(value = "{id}", produces = "application/x-protobuf")
    public ResponseEntity<ShowtimeProto.Showtime> getShowtimeById(@PathVariable String id) {
        ResponseEntity<?> resp = showtimeService.getShowtimeById(id);
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() instanceof Showtime st) {
            return ResponseEntity.ok(toProto(st));
        }
        return ResponseEntity.status(resp.getStatusCode()).build();
    }

    @PostMapping(consumes = "application/x-protobuf", produces = "application/x-protobuf")
    public ResponseEntity<ShowtimeProto.Showtime> createShowtime(@RequestBody ShowtimeProto.ShowtimeInput showtime) {
        ShowtimeInput input = fromProto(showtime);
        ResponseEntity<?> resp = showtimeService.createShowtime(input);
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() instanceof Showtime st) {
            return ResponseEntity.ok(toProto(st));
        }
        return ResponseEntity.status(resp.getStatusCode()).build();
    }

    @PatchMapping(value = "update/{id}", consumes = "application/x-protobuf", produces = "application/x-protobuf")
    public ResponseEntity<ShowtimeProto.Showtime> updateShowtime(@PathVariable String id,
            @RequestBody ShowtimeProto.Showtime showtime) {
        Showtime st = fromProto(showtime);
        ResponseEntity<?> resp = showtimeService.updateShowtime(id, st);
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() instanceof Showtime updated) {
            return ResponseEntity.ok(toProto(updated));
        }
        return ResponseEntity.status(resp.getStatusCode()).build();
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteShowtime(@PathVariable String id) {
        return showtimeService.deleteShowtime(id);
    }

    private ShowtimeProto.Showtime toProto(Showtime showtime) {
        ShowtimeProto.Showtime.Builder builder = ShowtimeProto.Showtime.newBuilder()
                .setShowtimeId(showtime.getShowtimeId().toString())
                .setVenueId(showtime.getVenueId().toString())
                .setDate(showtime.getDate().toString())
                .setStartAt(showtime.getStartAt().toString())
                .setEndAt(showtime.getEndAt().toString());

        if (showtime.getMovieId() != null) {
            builder.setMovieId(showtime.getMovieId().toString());
        }
        if (showtime.getEventId() != null) {
            builder.setEventId(showtime.getEventId().toString());
        }
        return builder.build();
    }

    private Showtime fromProto(ShowtimeProto.Showtime proto) {
        Showtime showtime = new Showtime();
        if (!proto.getShowtimeId().isEmpty()) {
            showtime.setShowtimeId(UUID.fromString(proto.getShowtimeId()));
        }
        showtime.setVenueId(UUID.fromString(proto.getVenueId()));
        if (!proto.getMovieId().isEmpty()) {
            showtime.setMovieId(UUID.fromString(proto.getMovieId()));
        }
        if (!proto.getEventId().isEmpty()) {
            showtime.setEventId(UUID.fromString(proto.getEventId()));
        }
        showtime.setDate(LocalDate.parse(proto.getDate()));
        showtime.setStartAt(LocalDateTime.parse(proto.getStartAt()));
        showtime.setEndAt(LocalDateTime.parse(proto.getEndAt()));
        return showtime;
    }

    private ShowtimeInput fromProto(ShowtimeProto.ShowtimeInput proto) {
        ShowtimeInput input = new ShowtimeInput();
        input.setVenueId(proto.getVenueId());
        input.setMovieId(proto.getMovieId());
        input.setEventId(proto.getEventId());
        input.setDate(LocalDate.parse(proto.getDate()));
        input.setStartAt(LocalDateTime.parse(proto.getStartAt()));
        return input;
    }

    private ShowtimeProto.ShowtimeDetails toProto(ShowtimeDetails details) {
        return ShowtimeProto.ShowtimeDetails.newBuilder()
                .setShowtimeId(details.getShowtimeId())
                .setStartAt(details.getStartAt())
                .setEndAt(details.getEndAt())
                .build();
    }

    private ShowtimeProto.ShowtimeMovieResponse toProto(ShowtimeMovieResponse response) {
        ShowtimeProto.ShowtimeMovieResponse.Builder builder = ShowtimeProto.ShowtimeMovieResponse.newBuilder()
                .setVenueId(response.getVenueId())
                .setVenueName(response.getVenueName())
                .setVenueMapUrl(response.getVenueMapUrl())
                .setVenueLocation(response.getVenueLocation());
        response.getShowtimes().forEach(d -> builder.addShowtimes(toProto(d)));
        return builder.build();
    }
}

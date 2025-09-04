package com.bookmyshow.service;

import com.bookmyshow.interfaces.ShowtimeServiceInter;
import com.bookmyshow.models.Showtime;
import com.bookmyshow.repository.ShowtimeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class ShowtimeService implements ShowtimeServiceInter {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Override
    public ResponseEntity<?> getAllShowtimes() {
        try {
            List<Showtime> showtimes = showtimeRepository.findAll();
            return ResponseEntity.ok(showtimes);
        } catch (Exception e) {
            log.error("Failed to fetch all showtimes. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getShowtimeById(String showtimeId) {
        try {
            Optional<Showtime> showtimeOpt = showtimeRepository.findById(UUID.fromString(showtimeId));
            if (showtimeOpt.isEmpty()) {
                throw new Exception("Showtime not found with ID: " + showtimeId);
            }
            return ResponseEntity.ok(showtimeOpt.get());
        } catch (Exception e) {
            log.error("Failed to fetch showtime by ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createShowtime(Showtime showtime) {
        try {
            return ResponseEntity.ok(showtimeRepository.save(showtime));
        } catch (Exception e) {
            log.error("Failed to create showtime: {}. Error: {}", showtime, e.getMessage());
            return ResponseEntity.status(500).body("Failed to create showtime: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateShowtime(String showtimeId, Showtime showtime) {
        try {
            if (showtime == null || showtime.getStartAt() == null || showtime.getDate() == null) {
                throw new Exception("Showtime Payload is invalid");
            }

            return showtimeRepository.findById(UUID.fromString(showtimeId))
                    .map(existingShowtime -> {
                        existingShowtime.setStartAt(showtime.getStartAt());
                        existingShowtime.setEndAt(showtime.getEndAt());
                        existingShowtime.setDate(showtime.getDate());
                        return ResponseEntity.ok(showtimeRepository.save(existingShowtime));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to update showtime with ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteShowtime(String showtimeId) {
        try {
            return showtimeRepository.findById(UUID.fromString(showtimeId))
                    .map(showtime -> {
                        showtimeRepository.delete(showtime);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to delete showtime with ID: {}. Error: {}", showtimeId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }
}

package com.bookmyshow.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.bookmyshow.dto.EventInput;
import com.bookmyshow.enums.EventCategoryEnum;
import com.bookmyshow.enums.EventTypeEnum;
import com.bookmyshow.interfaces.EventServiceInter;
import com.bookmyshow.models.Event;
import com.bookmyshow.repository.EventRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EventService implements EventServiceInter {

    @Autowired
    private EventRepository eventRepository;

    @Override
    public ResponseEntity<?> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @Override
    public ResponseEntity<?> getEventById(String eventId) {
        try {
            return eventRepository.findById(UUID.fromString(eventId))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to fetch event by ID: {}. Error: {}", eventId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createEvent(EventInput event) {
        try {

            if (event == null
                    || event.getTitle() == null || event.getTitle().isEmpty()
                    || event.getDescription() == null || event.getDescription().isEmpty()) {
                throw new Exception("Event Payload is invalid");
            }

            if (event.getCategoryType() == null) {
                throw new Exception("Event category is required");
            }

            if (event.getEventType() == null) {
                throw new Exception("Event type is required");
            }

            // parse event object
            Event newEvent = new Event();
            newEvent.setTitle(event.getTitle());
            newEvent.setDescription(event.getDescription());
            newEvent.setCategoryType(EventCategoryEnum.valueOf(event.getCategoryType().toUpperCase()));
            newEvent.setOrganizerName(event.getOrganizerName());
            newEvent.setStartDate(
                    event.getStartDate() != null ? java.time.LocalDate.parse(event.getStartDate()) : null);
            newEvent.setEndDate(
                    event.getEndDate() != null ? java.time.LocalDate.parse(event.getEndDate()) : null);
            newEvent.setBannerUrl(event.getBannerUrl());
            newEvent.setEventType(EventTypeEnum.valueOf(event.getEventType().toUpperCase()));

            return ResponseEntity.ok(eventRepository.save(newEvent));
        } catch (Exception e) {
            log.error("Failed to create event: {}. Error: {}", event, e.getMessage());
            return ResponseEntity.status(500).body("Failed to create event: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateEvent(String eventId, Event event) {
        try {
            if (event == null
                    || event.getTitle() == null || event.getTitle().isEmpty()
                    || event.getDescription() == null || event.getDescription().isEmpty()) {
                throw new Exception("Event Payload is invalid");
            }

            return eventRepository.findById(UUID.fromString(eventId))
                    .map(existingEvent -> {
                        existingEvent.setTitle(event.getTitle());
                        existingEvent.setDescription(event.getDescription());
                        existingEvent.setCategoryType(event.getCategoryType());
                        existingEvent.setOrganizerName(event.getOrganizerName());
                        existingEvent.setStartDate(event.getStartDate());
                        existingEvent.setEndDate(event.getEndDate());
                        existingEvent.setBannerUrl(event.getBannerUrl());
                        return ResponseEntity.ok(eventRepository.save(existingEvent));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to update event with ID: {}. Error: {}", eventId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteEvent(String eventId) {
        try {
            return eventRepository.findById(UUID.fromString(eventId))
                    .map(event -> {
                        eventRepository.delete(event);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to delete event with ID: {}. Error: {}", eventId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

}

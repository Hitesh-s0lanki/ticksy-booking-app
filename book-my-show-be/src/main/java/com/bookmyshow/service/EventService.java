package com.bookmyshow.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.bookmyshow.enums.EventCategoryEnum;
import com.bookmyshow.enums.EventTypeEnum;
import com.bookmyshow.interfaces.EventServiceInter;
import com.bookmyshow.models.Event;
import com.bookmyshow.proto.EventProto;
import com.bookmyshow.proto.EventProto.EventInput;
import com.bookmyshow.proto.UtilsProto;
import com.bookmyshow.repository.EventRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EventService implements EventServiceInter {

    @Autowired
    private EventRepository eventRepository;

    @Override
    public ResponseEntity<?> getAllEvents(String title, String eventType, String categoryType) {
        try {
            EventTypeEnum eventTypeEnum = (eventType != null && !eventType.isBlank())
                    ? EventTypeEnum.valueOf(eventType.toUpperCase())
                    : null;
            EventCategoryEnum categoryEnum = (categoryType != null && !categoryType.isBlank())
                    ? EventCategoryEnum.valueOf(categoryType.toUpperCase())
                    : null;

            List<Event> events = eventRepository.findByOptionalParams(
                    title != null && !title.isBlank() ? title : null,
                    eventTypeEnum,
                    categoryEnum);

            List<EventProto.Event> eventProtos = events.stream()
                    .map(this::toProto)
                    .collect(Collectors.toList());

            EventProto.EventsList response = EventProto.EventsList.newBuilder()
                    .addAllEvents(eventProtos)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch all events. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getEventById(String eventId) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(UUID.fromString(eventId));
            if (eventOpt.isEmpty()) {
                throw new Exception("Event not found with ID: " + eventId);
            }
            return ResponseEntity.ok(toProto(eventOpt.get()));
        } catch (Exception e) {
            log.error("Failed to fetch event by ID: {}. Error: {}", eventId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> createEvent(EventProto.EventInput event) {
        try {
            Event entity = toEntity(event);
            Event saved = eventRepository.save(entity);
            return ResponseEntity.ok(toProto(saved));
        } catch (Exception e) {
            log.error("Failed to create event: {}. Error: {}", event, e.getMessage());
            return ResponseEntity.status(500).body("Failed to create event: " + e.getMessage());
        }
    }

    public ResponseEntity<?> createEventJson(com.bookmyshow.dto.EventInput event) {
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
    public ResponseEntity<?> updateEvent(String eventId, EventProto.Event event) {
        try {
            if (event == null || event.getTitle().isBlank() || event.getDescription().isBlank()) {
                throw new Exception("Event Payload is invalid");
            }

            return eventRepository.findById(UUID.fromString(eventId))
                    .map(existingEvent -> {
                        existingEvent.setTitle(event.getTitle());
                        existingEvent.setDescription(event.getDescription());
                        existingEvent.setEventType(EventTypeEnum.valueOf(event.getEventType().toUpperCase()));
                        existingEvent.setCategoryType(EventCategoryEnum
                                .valueOf(event.getCategoryType().toUpperCase()));
                        existingEvent.setOrganizerName(event.getOrganizerName());
                        if (!event.getStartDate().isEmpty()) {
                            existingEvent.setStartDate(LocalDate.parse(event.getStartDate()));
                        } else {
                            existingEvent.setStartDate(null);
                        }
                        if (!event.getEndDate().isEmpty()) {
                            existingEvent.setEndDate(LocalDate.parse(event.getEndDate()));
                        } else {
                            existingEvent.setEndDate(null);
                        }
                        existingEvent.setBannerUrl(event.getBannerUrl());
                        Event saved = eventRepository.save(existingEvent);
                        return ResponseEntity.ok(toProto(saved));
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
            if (eventId == null || eventId.trim().isEmpty()) {
                throw new Exception("Invalid event ID");
            }
            UUID uuid = UUID.fromString(eventId);
            if (!eventRepository.existsById(uuid)) {
                throw new Exception("Event not found");
            }

            eventRepository.deleteById(uuid);

            UtilsProto.SuccessResponse response = UtilsProto.SuccessResponse.newBuilder()
                    .setMessage("Event deleted successfully")
                    .setStatus(200)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete event with ID: {}. Error: {}", eventId, e.getMessage());
            return ResponseEntity.status(500).body("[ERROR]: " + e.getMessage());
        }
    }

    private EventProto.Event toProto(Event event) {
        EventProto.Event.Builder builder = EventProto.Event.newBuilder()
                .setEventId(event.getEventId().toString())
                .setTitle(event.getTitle())
                .setDescription(event.getDescription())
                .setEventType(event.getEventType() != null ? event.getEventType().name() : "")
                .setCategoryType(event.getCategoryType() != null ? event.getCategoryType().name() : "");

        if (event.getOrganizerName() != null) {
            builder.setOrganizerName(event.getOrganizerName());
        }
        if (event.getStartDate() != null) {
            builder.setStartDate(event.getStartDate().toString());
        }
        if (event.getEndDate() != null) {
            builder.setEndDate(event.getEndDate().toString());
        }
        if (event.getBannerUrl() != null) {
            builder.setBannerUrl(event.getBannerUrl());
        }

        return builder.build();
    }

    private Event toEntity(EventProto.EventInput event) {
        Event entity = new Event();
        entity.setTitle(event.getTitle());
        entity.setDescription(event.getDescription());
        entity.setEventType(EventTypeEnum.valueOf(event.getEventType().toUpperCase()));
        entity.setCategoryType(EventCategoryEnum.valueOf(event.getCategoryType().toUpperCase()));
        entity.setOrganizerName(event.getOrganizerName());
        if (!event.getStartDate().isEmpty()) {
            entity.setStartDate(LocalDate.parse(event.getStartDate()));
        }
        if (!event.getEndDate().isEmpty()) {
            entity.setEndDate(LocalDate.parse(event.getEndDate()));
        }
        entity.setBannerUrl(event.getBannerUrl());
        entity.setCreatedAt(java.time.LocalDateTime.now());
        return entity;
    }
}

package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.dto.EventInput;
import com.bookmyshow.models.Event;

public interface EventServiceInter {

    public ResponseEntity<?> getAllEvents();

    public ResponseEntity<?> getEventById(String eventId);

    public ResponseEntity<?> createEvent(EventInput event);

    public ResponseEntity<?> updateEvent(String eventId, Event event);

    public ResponseEntity<?> deleteEvent(String eventId);
}

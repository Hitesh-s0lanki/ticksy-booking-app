package com.bookmyshow.interfaces;

import org.springframework.http.ResponseEntity;

import com.bookmyshow.proto.EventProto;

public interface EventServiceInter {

    public ResponseEntity<?> getAllEvents(String title, String eventType, String categoryType);

    public ResponseEntity<?> getEventById(String eventId);

    public ResponseEntity<?> createEvent(EventProto.EventInput event);

    public ResponseEntity<?> updateEvent(String eventId, EventProto.Event event);

    public ResponseEntity<?> deleteEvent(String eventId);
}

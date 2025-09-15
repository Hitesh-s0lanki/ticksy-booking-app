package com.bookmyshow.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.models.Event;
import com.bookmyshow.proto.EventProto;
import com.bookmyshow.proto.EventProto.EventInput;
import com.bookmyshow.service.EventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController()
@RequestMapping("events")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping(produces = "application/x-protobuf")
    public ResponseEntity<?> getAllEvents(
            @RequestParam(required = false, defaultValue = "") String title,
            @RequestParam(required = false, defaultValue = "") String eventType,
            @RequestParam(required = false, defaultValue = "") String categoryType) {
        return eventService.getAllEvents(title, eventType, categoryType);
    }

    @GetMapping(value = "{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        return eventService.getEventById(id);
    }

    @PostMapping(produces = "application/x-protobuf")
    public ResponseEntity<?> createEvent(@RequestBody EventProto.EventInput event) {
        return eventService.createEvent(event);
    }

    @PostMapping(value = "json")
    public ResponseEntity<?> createEventJson(@RequestBody com.bookmyshow.dto.EventInput event) {
        return eventService.createEventJson(event);
    }

    @PatchMapping(value = "update/{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody EventProto.Event event) {
        return eventService.updateEvent(id, event);
    }

    @DeleteMapping(value = "delete/{id}", produces = "application/x-protobuf")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        return eventService.deleteEvent(id);
    }

}

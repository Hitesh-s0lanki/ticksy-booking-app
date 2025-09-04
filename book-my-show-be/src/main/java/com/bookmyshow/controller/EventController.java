package com.bookmyshow.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.models.Event;
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

    @GetMapping()
    public ResponseEntity<?> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("{id}")
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        return eventService.getEventById(id);
    }

    @PostMapping()
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        return eventService.createEvent(event);
    }

    @PatchMapping("update/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody Event event) {
        return eventService.updateEvent(id, event);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        return eventService.deleteEvent(id);
    }

}

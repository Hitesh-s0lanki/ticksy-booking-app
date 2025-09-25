package com.bookmyshow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyshow.proto.EventProto;
import com.bookmyshow.service.EventService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController()
@RequestMapping("events")
@Tag(name = "Events", description = "Endpoints for creating and managing live events and experiences.")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping(produces = "application/x-protobuf")
    @Operation(summary = "List events", description = "Retrieve events with optional filters for title, type and category.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Events retrieved successfully."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching events.")
    })
    public ResponseEntity<?> getAllEvents(
            @Parameter(description = "Optional case-insensitive filter on event title.", example = "Music")
            @RequestParam(required = false, defaultValue = "") String title,
            @Parameter(description = "Optional filter based on event type.", example = "CONCERT")
            @RequestParam(required = false, defaultValue = "") String eventType,
            @Parameter(description = "Optional filter based on category type.", example = "MUSIC")
            @RequestParam(required = false, defaultValue = "") String categoryType) {
        return eventService.getAllEvents(title, eventType, categoryType);
    }

    @GetMapping(value = "{id}", produces = "application/x-protobuf")
    @Operation(summary = "Get event", description = "Retrieve event details by identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event found."),
            @ApiResponse(responseCode = "404", description = "Event not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while fetching event details.")
    })
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        return eventService.getEventById(id);
    }

    @PostMapping(produces = "application/x-protobuf")
    @Operation(summary = "Create event (protobuf)", description = "Create a new event using protobuf payloads.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event created successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid event data provided."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while creating event.")
    })
    public ResponseEntity<?> createEvent(@RequestBody EventProto.EventInput event) {
        return eventService.createEvent(event);
    }

    @PostMapping(value = "json")
    @Operation(summary = "Create event (JSON)", description = "Create a new event using JSON payloads.", responses = {
            @ApiResponse(responseCode = "200", description = "Event created successfully.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.bookmyshow.dto.EventInput.class))),
            @ApiResponse(responseCode = "400", description = "Invalid event data provided."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while creating event.")
    })
    public ResponseEntity<?> createEventJson(@RequestBody com.bookmyshow.dto.EventInput event) {
        return eventService.createEventJson(event);
    }

    @PatchMapping(value = "update/{id}", produces = "application/x-protobuf")
    @Operation(summary = "Update event", description = "Apply partial updates to an existing event.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event updated successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid event update supplied."),
            @ApiResponse(responseCode = "404", description = "Event not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while updating event.")
    })
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody EventProto.Event event) {
        return eventService.updateEvent(id, event);
    }

    @DeleteMapping(value = "delete/{id}", produces = "application/x-protobuf")
    @Operation(summary = "Delete event", description = "Remove an event from the catalogue.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event deleted successfully."),
            @ApiResponse(responseCode = "404", description = "Event not found."),
            @ApiResponse(responseCode = "500", description = "Unexpected error while deleting event.")
    })
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        return eventService.deleteEvent(id);
    }

}

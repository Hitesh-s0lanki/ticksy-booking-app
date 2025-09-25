package com.bookmyshow.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController()
@Tag(name = "Health", description = "Endpoints for checking the health of the backend service.")
public class DemoController {

    @GetMapping("v1")
    @Operation(summary = "Health check", description = "Returns a friendly message indicating that the backend is operational.")
    public String getMethodName() {
        return "Ticksy -> Backend Up and Working 🎉";
    }
}

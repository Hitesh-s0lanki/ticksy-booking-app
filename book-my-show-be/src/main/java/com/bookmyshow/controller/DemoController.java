package com.bookmyshow.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController()
public class DemoController {

    @GetMapping("v1")
    public String getMethodName() {
        return "Ticksy -> Backend Up and Working 🎉";
    }
}

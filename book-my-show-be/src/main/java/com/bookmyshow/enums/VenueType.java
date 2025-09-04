package com.bookmyshow.enums;

public enum VenueType {
    CINEMA("CINEMA"),
    SEMINAR("SEMINAR");

    private String value;

    VenueType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}

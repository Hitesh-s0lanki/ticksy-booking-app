package com.bookmyshow.enums;

public enum EventTypeEnum {
    GENERAL("GENERAL"),
    SPORTS("SPORTS");

    private String type;

    EventTypeEnum(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}

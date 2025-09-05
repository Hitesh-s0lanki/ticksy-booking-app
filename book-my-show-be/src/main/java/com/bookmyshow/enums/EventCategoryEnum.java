package com.bookmyshow.enums;

public enum EventCategoryEnum {
    MUSIC("MUSIC"),
    COMEDY("COMEDY"),
    ART("ART"),
    TECHNOLOGY("TECHNOLOGY"),
    FOOD("FOOD"),
    DANCE("DANCE"),
    LITERATURE("LITERATURE"),
    SEMINAR("SEMINAR"),
    WORKSHOP("WORKSHOP");

    private String category;

    EventCategoryEnum(String category) {
        this.category = category;
    }

    public String getCategory() {
        return category;
    }
}

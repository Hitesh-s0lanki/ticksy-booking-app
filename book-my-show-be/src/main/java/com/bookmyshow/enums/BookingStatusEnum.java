package com.bookmyshow.enums;

public enum BookingStatusEnum {
    ACTIVE("ACTIVE"),
    CANCEL("CANCEL"),
    NONACTIVE("NONACTIVE");

    private String status;

    BookingStatusEnum(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}

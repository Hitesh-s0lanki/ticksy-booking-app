package com.bookmyshow.dto;

import lombok.Data;

@Data
public class ShowtimeDetails {
    private String showtimeId;
    private String startAt;
    private String endAt;
}
package com.bookmyshow.dto;

import java.util.List;

import lombok.Data;

@Data
public class ShowtimeMovieResponse {
    private String venueId;
    private String venueName;
    private String venueMapUrl;
    private String venueLocation;
    private List<ShowtimeDetails> showtimes;
}

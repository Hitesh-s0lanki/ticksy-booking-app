package com.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventInput {
    private String title;
    private String description;
    private String eventType;
    private String categoryType;
    private String organizerName;
    private String startDate;
    private String endDate;
    private String bannerUrl;
}

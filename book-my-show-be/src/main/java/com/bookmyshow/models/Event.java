package com.bookmyshow.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.bookmyshow.enums.EventCategoryEnum;
import com.bookmyshow.enums.EventTypeEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events_show")
public class Event {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "event_id", updatable = false, nullable = false)
    private UUID eventId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_type", nullable = false)
    private EventTypeEnum eventType = EventTypeEnum.GENERAL;

    @Column(name = "category_type")
    private EventCategoryEnum categoryType = EventCategoryEnum.SEMINAR;

    @Column(name = "organizer_name", length = 100)
    private String organizerName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

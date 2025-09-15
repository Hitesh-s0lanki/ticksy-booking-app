package com.bookmyshow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyshow.enums.EventCategoryEnum;
import com.bookmyshow.enums.EventTypeEnum;
import com.bookmyshow.models.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("""
            SELECT e
            FROM Event e
            WHERE (:title IS NULL OR e.title ILIKE CONCAT('%', CAST(:title AS text), '%'))
              AND (:eventType IS NULL OR e.eventType = :eventType)
              AND (:categoryType IS NULL OR e.categoryType = :categoryType)
            """)
    List<Event> findByOptionalParams(
            @Param("title") String title,
            @Param("eventType") EventTypeEnum eventType,
            @Param("categoryType") EventCategoryEnum categoryType);

}

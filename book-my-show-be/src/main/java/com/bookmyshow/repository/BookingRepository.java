package com.bookmyshow.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookmyshow.enums.BookingStatusEnum;
import com.bookmyshow.models.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByUserId(String userId, Pageable pageable);

    List<Booking> findByShowtimeId(String showtimeId);

    List<Booking> findByShowtimeIdAndStatusIn(String showtimeId, Collection<BookingStatusEnum> statuses);

}

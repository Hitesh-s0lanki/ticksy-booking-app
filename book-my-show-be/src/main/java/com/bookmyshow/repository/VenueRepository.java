package com.bookmyshow.repository;

import com.bookmyshow.models.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import com.bookmyshow.enums.VenueType;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID> {

    List<Venue> findByVenueType(VenueType venueType);

}

package com.bookmyshow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyshow.models.Movie;

@Repository
public interface MovieRepository extends JpaRepository<Movie, UUID> {

    @Query("""
              SELECT DISTINCT m
              FROM Movie m
              LEFT JOIN m.genre g
              WHERE (:title IS NULL OR m.title ILIKE CONCAT('%', :title, '%'))
                AND (:genre IS NULL OR g ILIKE CONCAT('%', :genre, '%'))
            """)
    List<Movie> findByOptionalTitleAndGenre(
            @Param("title") String title,
            @Param("genre") String genre);

}

package com.bookmyshow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookmyshow.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

}

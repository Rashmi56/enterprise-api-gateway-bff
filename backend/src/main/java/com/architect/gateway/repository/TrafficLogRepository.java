package com.architect.gateway.repository;

import com.architect.gateway.model.TrafficLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrafficLogRepository extends JpaRepository<TrafficLog, Long> {
}
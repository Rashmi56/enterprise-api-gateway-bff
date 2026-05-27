package com.architect.gateway.service;

import com.architect.gateway.model.TrafficLog;
import com.architect.gateway.repository.TrafficLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AnalyticsService {

    @Autowired
    private TrafficLogRepository trafficLogRepository;

    @Async
    public void logTransaction(String clientId, String endpoint, int status) {
        try {
            TrafficLog log = new TrafficLog(clientId, endpoint, status, LocalDateTime.now());
            trafficLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to persist analytics log asynchronously: " + e.getMessage());
        }
    }
}
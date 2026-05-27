package com.architect.gateway.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "traffic_logs")
public class TrafficLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientId;
    private String endpoint;
    private int httpStatus;
    private LocalDateTime timestamp;

    // Constructors
    public TrafficLog() {}

    public TrafficLog(String clientId, String endpoint, int httpStatus, LocalDateTime timestamp) {
        this.clientId = clientId;
        this.endpoint = endpoint;
        this.httpStatus = httpStatus;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getClientId() { return clientId; }
    public String getEndpoint() { return endpoint; }
    public int getHttpStatus() { return httpStatus; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
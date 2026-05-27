package com.architect.gateway.controller;

import com.architect.gateway.service.RateLimiterService;
import com.architect.gateway.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class GatewayController {

    @Autowired
    private RateLimiterService rateLimiterService;

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/resource")
    public ResponseEntity<?> accessSecureEndpoint(@RequestParam(value = "client", defaultValue = "anonymous") String clientId) {
        
        boolean allowed = rateLimiterService.isAllowed(clientId);

        if (!allowed) {
            // Asynchronously log the 429 rate limit violation and exit
            analyticsService.logTransaction(clientId, "/api/v1/resource", HttpStatus.TOO_MANY_REQUESTS.value());
            
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                        "error", "Too Many Requests",
                        "status", 429,
                        "message", "Rate limit exceeded. Your sliding window quota resets shortly."
                    ));
        }

        analyticsService.logTransaction(clientId, "/api/v1/resource", HttpStatus.OK.value());

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Request authenticated. Distributed data aggregate safely compiled.",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
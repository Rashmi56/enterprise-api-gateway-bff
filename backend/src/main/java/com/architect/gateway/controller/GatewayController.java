package com.architect.gateway.controller;

import com.architect.gateway.service.RateLimiterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*") // Allows our future React UI to talk to it smoothly
public class GatewayController {

    @Autowired
    private RateLimiterService rateLimiterService;

    @GetMapping("/resource")
    public ResponseEntity<?> accessSecureEndpoint(@RequestParam(value = "client", defaultValue = "anonymous") String clientId) {
        
        // Invoke our custom high-scale sliding window mechanism
        boolean allowed = rateLimiterService.isAllowed(clientId);

        if (!allowed) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                        "error", "Too Many Requests",
                        "status", 429,
                        "message", "Rate limit exceeded. Your sliding window quota resets shortly."
                    ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Request authenticated. Distributed data aggregate safely compiled.",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
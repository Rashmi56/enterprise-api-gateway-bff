package com.architect.gateway.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RateLimiterService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // Define policy: Max 10 requests within a rolling 10-second window
    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_SIZE_MS = 10000; 

    public boolean isAllowed(String clientId) {
        String redisKey = "rate_limit:" + clientId;
        long currentTimeMs = System.currentTimeMillis();
        long windowStartBound = currentTimeMs - WINDOW_SIZE_MS;

        try {
            // Execute operations atomically inside a Redis Transaction (MULTI/EXEC)
            redisTemplate.watch(redisKey);
            
            // 1. Check current size within the sliding window boundary
            Long currentRequestCount = redisTemplate.opsForZSet().count(redisKey, windowStartBound, currentTimeMs);
            
            if (currentRequestCount != null && currentRequestCount >= MAX_REQUESTS) {
                redisTemplate.unwatch();
                return false; // Rate limit exceeded!
            }

            // 2. Open atomic write pipeline
            redisTemplate.multi();
            
            // Remove records that have fallen outside the sliding time window
            redisTemplate.opsForZSet().removeRangeByScore(redisKey, 0, windowStartBound);
            
            // Append current unique request timestamp to the sorted set
            // We use a random UUID string as value to prevent duplicate timestamps collapsing together
            redisTemplate.opsForZSet().add(redisKey, UUID.randomUUID().toString(), currentTimeMs);
            
            List<Object> results = redisTemplate.exec();
            
            // If the transaction returns empty, another thread modified the key (Optimistic Locking failure)
            return results != null && !results.isEmpty();

        } catch (Exception e) {
            redisTemplate.unwatch();
            // Default fallback policy if database connection struggles
            return true; 
        }
    }
}
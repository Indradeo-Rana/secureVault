package in.infosys.backend.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Optional;

@Service
public class RedisCacheService {

    private static final Logger log =
            LoggerFactory.getLogger(RedisCacheService.class);

    private static final String VERSION_PREFIX =
            "securevault:security-analytics:version:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisCacheService(
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public <T> Optional<T> get(
            String key,
            Class<T> type) {

        try {
            String json = redisTemplate.opsForValue().get(key);

            if (json == null) {
                return Optional.empty();
            }

            return Optional.of(
                    objectMapper.readValue(json, type)
            );

        } catch (Exception ex) {
            log.warn(
                    "Redis cache read failed for key '{}'. Falling back to PostgreSQL.",
                    key,
                    ex
            );
            return Optional.empty();
        }
    }

    public void put(
            String key,
            Object value,
            Duration ttl) {

        try {
            String json = objectMapper.writeValueAsString(value);

            redisTemplate.opsForValue().set(
                    key,
                    json,
                    ttl
            );

        } catch (Exception ex) {
            log.warn(
                    "Redis cache write failed for key '{}'. PostgreSQL remains the source of truth.",
                    key,
                    ex
            );
        }
    }

    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception ex) {
            log.warn(
                    "Redis cache delete failed for key '{}'.",
                    key,
                    ex
            );
        }
    }

    /**
     * Versioning lets us invalidate all analytics cache variants for a user
     * without running an expensive Redis KEYS command.
     */
    public long getVersion(String username) {
        String key = VERSION_PREFIX + username;

        try {
            String value = redisTemplate.opsForValue().get(key);

            if (value == null) {
                redisTemplate.opsForValue().set(key, "1");
                return 1L;
            }

            return Long.parseLong(value);

        } catch (Exception ex) {
            log.warn(
                    "Redis version lookup failed for user '{}'. Using version 0.",
                    username,
                    ex
            );
            return 0L;
        }
    }

    public void invalidateSecurityAnalytics(String username) {

        if (username == null || username.isBlank()) {
            return;
        }

        String key = VERSION_PREFIX + username;

        try {
            Long newVersion =
                    redisTemplate.opsForValue().increment(key);

            log.debug(
                    "Security analytics cache invalidated for user '{}'. New version={}",
                    username,
                    newVersion
            );

        } catch (Exception ex) {
            log.warn(
                    "Redis cache invalidation failed for user '{}'. TTL will still prevent permanent stale data.",
                    username,
                    ex
            );
        }
    }
}

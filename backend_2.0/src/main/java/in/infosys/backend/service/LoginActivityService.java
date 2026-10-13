package in.infosys.backend.service;

import in.infosys.backend.dto.LoginActivityResponseDto;
import in.infosys.backend.entity.LoginActivity;
import in.infosys.backend.repository.LoginActivityRepository;
import in.infosys.backend.cache.RedisCacheService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoginActivityService {

    private final LoginActivityRepository loginActivityRepository;
    private final RedisCacheService redisCacheService;

    public LoginActivityService(
            LoginActivityRepository loginActivityRepository,
            RedisCacheService redisCacheService) {
        this.loginActivityRepository = loginActivityRepository;
        this.redisCacheService = redisCacheService;
    }

    public void recordLogin(
            String username,
            boolean success,
            String ipAddress) {

        LoginActivity activity = new LoginActivity();

        activity.setUsername(username);
        activity.setSuccess(success);
        activity.setIpAddress(ipAddress);
        activity.setTimestamp(LocalDateTime.now());

        loginActivityRepository.save(activity);

        // Login activity changes the derived security analytics.
        // invalidate the cache for this user to ensure fresh data is used next time.
        redisCacheService.invalidateSecurityAnalytics(username);
    }

    public List<LoginActivityResponseDto> getLoginHistory() {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return loginActivityRepository
                .findAllByUsernameOrderByTimestampDesc(username)
                .stream()
                .map(activity ->
                        new LoginActivityResponseDto(
                                activity.getId(),
                                activity.getUsername(),
                                activity.getIpAddress(),
                                activity.isSuccess(),
                                activity.getTimestamp()
                        )
                )
                .toList();
    }
}

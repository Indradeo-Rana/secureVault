package in.infosys.backend.service;

import in.infosys.backend.dto.*;
import in.infosys.backend.entity.User;
import in.infosys.backend.entity.ApplicationRole;
import in.infosys.backend.repository.UserRepository;
import in.infosys.backend.security.CustomUserDetails;
import in.infosys.backend.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MfaService mfaService;
    private final DeviceService deviceService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            MfaService mfaService,
            DeviceService deviceService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mfaService = mfaService;
        this.deviceService = deviceService;
    }

    public User registerUser(RegisterRequestDto request) {

        if (request == null
                || request.getPassword() == null
                || request.getPassword().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setRole(ApplicationRole.USER);

        return userRepository.save(user);
    }

    public AuthResponseDto login(LoginRequestDto request,
            String deviceId,
            HttpServletRequest httpRequest
    ) {

        if (request == null ||
                request.getUsername() == null ||
                request.getPassword() == null) {

            throw new BadCredentialsException(
                    "Username and password are required"
            );
        }

        String identifier =
                request.getUsername().trim();

        User user = userRepository
                .findByUsername(identifier)
                .or(() ->
                        userRepository.findByEmail(identifier)
                )
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid username or password"
                        )
                );

        String storedPassword =
                user.getPassword();

        if (storedPassword == null ||
                storedPassword.isBlank()) {

            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        if (!isBcryptHash(storedPassword)) {

            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                storedPassword
        )) {

            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        // -------------------------------------------------
        // MFA
        // -------------------------------------------------
        if (user.isMfaEnabled()) {

            return mfaService.createChallenge(user);
        }

        // -------------------------------------------------
        // Device Information
        // -------------------------------------------------

        if (deviceId == null || deviceId.isBlank()) {
            deviceId = UUID.randomUUID().toString();
        }

        String userAgent =
                httpRequest.getHeader("User-Agent");

        String ipAddress =
                httpRequest.getRemoteAddr();

        // -------------------------------------------------
        // Register / Update Device
        // -------------------------------------------------

        deviceService.registerOrUpdateDevice(
                user,
                deviceId,
                userAgent,
                ipAddress
        );

        // -------------------------------------------------
        // Generate JWT
        // -------------------------------------------------

        String token =
                jwtService.generateToken(
                        new CustomUserDetails(user),
                        deviceId
                );

        return new AuthResponseDto(
                token,
                user.getUsername(),
                user.getEmail(),
                "Login successful",
                false,
                null
        );
    }

    // method to get + update user profile
    public UserProfileResponseDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new UserProfileResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isMfaEnabled(),
                user.getRole().name()
        );
    }

    // method to update user profile
    public UserProfileResponseDto updateProfile(
            String currentUsername, UpdateProfileRequestDto request
    ){
        if(request == null) {
            throw new IllegalArgumentException("Profile Data is required");
        }
        if(request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if(request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String newUsername = request.getUsername().trim();
        String newEmail = request.getEmail().trim();

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // ---------------------------------------------
        // Check duplicate email
        // ---------------------------------------------
        if (!user.getEmail().equals(newEmail)
                && userRepository.existsByEmail(newEmail)) {

            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        // ---------------------------------------------
        // Update profile
        // ---------------------------------------------
        user.setUsername(newUsername);
        user.setEmail(newEmail);

        User updatedUser =
                userRepository.save(user);

        return new UserProfileResponseDto(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.isMfaEnabled(),
                updatedUser.getRole() != null
                        ? updatedUser.getRole().name()
                        : null
        );
    }

    private boolean isBcryptHash(String value) {

        return value != null &&
                value.matches(
                        "\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}"
                );
    }
}


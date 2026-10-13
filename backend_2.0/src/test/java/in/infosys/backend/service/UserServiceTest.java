package in.infosys.backend.service;

import in.infosys.backend.dto.AuthResponseDto;
import in.infosys.backend.dto.LoginRequestDto;
import in.infosys.backend.dto.RegisterRequestDto;
import in.infosys.backend.dto.UpdateProfileRequestDto;
import in.infosys.backend.dto.UserProfileResponseDto;
import in.infosys.backend.entity.ApplicationRole;
import in.infosys.backend.entity.User;
import in.infosys.backend.repository.UserRepository;
import in.infosys.backend.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Use MockitoExtension to enable Mockito annotations
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private MfaService mfaService;

    @Mock
    private DeviceService deviceService;

    @Mock
    private HttpServletRequest httpRequest;

    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();

        userService = new UserService(
                userRepository,
                passwordEncoder,
                jwtService,
                mfaService,
                deviceService
        );
    }

    private User createUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("indra");
        user.setEmail("indra@example.com");
        user.setPassword(passwordEncoder.encode("Password@123"));
        user.setRole(ApplicationRole.USER);
        user.setMfaEnabled(false);
        return user;
    }

    @Test // tells JUnit that this is a test method
    void registerUserSuccessfully() {
        // 1. Create a RegisterRequestDto
        RegisterRequestDto request = new RegisterRequestDto(
                "indra", "indra@example.com", "Password@123"
        );

        // 2. Mock the userRepository.save() method to return the user
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // 3. Call the actual registerUser method
        User result = userService.registerUser(request);

        // 4. Verify the result
        assertEquals("indra", result.getUsername());
        assertEquals("indra@example.com", result.getEmail());
        assertTrue(passwordEncoder
                .matches("Password@123", result.getPassword()
                )
        );
        assertEquals(ApplicationRole.USER, result.getRole());

        // 5 . Verify that userRepository.save() was called once
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUserFailsWhenRequestIsNull() {
        assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(null)
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUserFailsWhenPasswordIsBlank() {
        RegisterRequestDto request = new RegisterRequestDto(
                "indra", "indra@example.com", " "
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(request)
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginSuccessfully() {
        User user = createUser();

        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));
        when(httpRequest.getHeader("User-Agent"))
                .thenReturn("Chrome");
        when(httpRequest.getRemoteAddr())
                .thenReturn("127.0.0.1");
        when(jwtService.generateToken(any(), eq("device-1")))
                .thenReturn("test-jwt-token");

        LoginRequestDto request = new LoginRequestDto(
                "indra", "Password@123"
        );

        AuthResponseDto result = userService.login(
                request, "device-1", httpRequest
        );

        assertEquals("test-jwt-token", result.getToken());
        assertEquals("indra", result.getUsername());
        assertEquals("indra@example.com", result.getEmail());
        assertFalse(result.isMfaRequired());

        verify(deviceService).registerOrUpdateDevice(
                user, "device-1", "Chrome", "127.0.0.1"
        );
    }

    @Test
    void loginFailsWhenRequestIsNull() {
        assertThrows(
                BadCredentialsException.class,
                () -> userService.login(null, "device-1", httpRequest)
        );
    }

    @Test
    void loginFailsWhenUserDoesNotExist() {
        when(userRepository.findByUsername("unknown"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown"))
                .thenReturn(Optional.empty());

        LoginRequestDto request = new LoginRequestDto(
                "unknown", "Password@123"
        );

        assertThrows(
                BadCredentialsException.class,
                () -> userService.login(request, "device-1", httpRequest)
        );
    }

    @Test
    void loginFailsWhenPasswordIsIncorrect() {
        User user = createUser();

        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));

        LoginRequestDto request = new LoginRequestDto(
                "indra", "WrongPassword"
        );

        assertThrows(
                BadCredentialsException.class,
                () -> userService.login(request, "device-1", httpRequest)
        );

        verify(jwtService, never()).generateToken(any(), anyString());
    }

    @Test
    void loginFailsWhenStoredPasswordIsNotBcrypt() {
        User user = createUser();
        user.setPassword("plain-text-password");

        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));

        LoginRequestDto request = new LoginRequestDto(
                "indra", "plain-text-password"
        );

        assertThrows(
                BadCredentialsException.class,
                () -> userService.login(request, "device-1", httpRequest)
        );

        verify(jwtService, never()).generateToken(any(), anyString());
    }

    @Test
    void loginCreatesMfaChallengeWhenMfaIsEnabled() {
        User user = createUser();
        user.setMfaEnabled(true);

        AuthResponseDto challengeResponse = new AuthResponseDto(
                null, "indra", "indra@example.com",
                "MFA verification required", true, "challenge-1"
        );

        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));
        when(mfaService.createChallenge(user))
                .thenReturn(challengeResponse);

        LoginRequestDto request = new LoginRequestDto(
                "indra", "Password@123"
        );

        AuthResponseDto result = userService.login(
                request, "device-1", httpRequest
        );

        assertTrue(result.isMfaRequired());
        assertEquals("challenge-1", result.getMfaChallengeId());

        verify(mfaService).createChallenge(user);
        verify(deviceService, never()).registerOrUpdateDevice(
                any(), anyString(), any(), any()
        );
    }

    @Test
    void getUserProfileSuccessfully() {
        User user = createUser();

        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));

        UserProfileResponseDto result =
                userService.getUserProfile("indra");

        assertEquals(1L, result.getId());
        assertEquals("indra", result.getUsername());
        assertEquals("indra@example.com", result.getEmail());
        assertEquals("USER", result.getRole());
    }

    @Test
    void getUserProfileFailsWhenUserDoesNotExist() {
        when(userRepository.findByUsername("missing"))
                .thenReturn(Optional.empty());

        assertThrows(
                UsernameNotFoundException.class,
                () -> userService.getUserProfile("missing")
        );
    }

    @Test
    void updateProfileSuccessfully() {
        User user = createUser();

        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("new@example.com"))
                .thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequestDto request = new UpdateProfileRequestDto(
                "indra_new", "new@example.com"
        );

        UserProfileResponseDto result =
                userService.updateProfile("indra", request);

        assertEquals("indra_new", result.getUsername());
        assertEquals("new@example.com", result.getEmail());

        verify(userRepository).save(user);
    }

    @Test
    void updateProfileFailsWhenEmailAlreadyExists() {
        User user = createUser();

        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("taken@example.com"))
                .thenReturn(true);

        UpdateProfileRequestDto request = new UpdateProfileRequestDto(
                "indra_new", "taken@example.com"
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateProfile("indra", request)
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateProfileFailsWhenRequestIsNull() {
        assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateProfile("indra", null)
        );
    }
}

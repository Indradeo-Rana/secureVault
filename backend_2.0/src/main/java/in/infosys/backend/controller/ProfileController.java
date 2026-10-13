package in.infosys.backend.controller;

import in.infosys.backend.dto.UpdateProfileRequestDto;
import in.infosys.backend.dto.UserProfileResponseDto;
import in.infosys.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponseDto> getProfile(
            Authentication authentication
    ){
        String username = authentication.getName();
        UserProfileResponseDto userProfile = userService.getUserProfile(username);

        return ResponseEntity.ok(userProfile);
    }

    @PutMapping
    public ResponseEntity<UserProfileResponseDto> updateProfile(
            Authentication authentication,
           @RequestBody UpdateProfileRequestDto request
    ){
        String currentUsername  = authentication.getName();
        UserProfileResponseDto updatedProfile = userService.updateProfile(
                currentUsername, request);

        return ResponseEntity.ok(updatedProfile);
    }
}

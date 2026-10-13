package in.infosys.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponseDto {

    private Long id;
    private String username;
    private String email;
    private boolean mfaEnabled;
    private String role;
}

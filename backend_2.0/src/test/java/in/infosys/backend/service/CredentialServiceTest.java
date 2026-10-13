package in.infosys.backend.service;

import in.infosys.backend.dto.CredentialCreateRequestDto;
import in.infosys.backend.dto.CredentialUpdateRequestDto;
import in.infosys.backend.entity.Credential;
import in.infosys.backend.entity.User;
import in.infosys.backend.repository.CredentialRepository;
import in.infosys.backend.repository.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CredentialServiceTest {

    @Mock
    private CredentialRepository credentialRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EncryptionService encryptionService;

    @Mock
    private CredentialShareService credentialShareService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private CredentialService credentialService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("indra");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "indra",
                        "password"
                )
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockCurrentUser() {
        when(userRepository.findByUsername("indra"))
                .thenReturn(Optional.of(user));
    }

    private Credential createCredential() {
        Credential credential = new Credential();

        credential.setId(10L);
        credential.setTitle("Gmail");
        credential.setUsername("indra@gmail.com");
        credential.setPassword("encrypted-password");
        credential.setWebsite("https://gmail.com");
        credential.setNotes("encrypted-notes");
        credential.setCategory("Personal");
        credential.setCredentialType("WEBSITE_LOGIN");
        credential.setFavorite(false);
        credential.setDeleted(false);
        credential.setUser(user);

        return credential;
    }

    // 1. Successful credential creation
    @Test
    void createCredentialSuccessfully() {
        mockCurrentUser();

        CredentialCreateRequestDto request =
                new CredentialCreateRequestDto(
                        "Gmail",
                        "indra@gmail.com",
                        "Secret@123",
                        "https://gmail.com",
                        "My account",
                        "Personal",
                        "WEBSITE_LOGIN",
                        false
                );

        when(encryptionService.encrypt("Secret@123"))
                .thenReturn("encrypted-password");

        when(encryptionService.encrypt("My account"))
                .thenReturn("encrypted-notes");

        when(credentialRepository.save(any(Credential.class)))
                .thenAnswer(invocation -> {
                    Credential saved = invocation.getArgument(0);
                    saved.setId(10L);
                    return saved;
                });

        when(encryptionService.decrypt("encrypted-password"))
                .thenReturn("Secret@123");

        when(encryptionService.decrypt("encrypted-notes"))
                .thenReturn("My account");

        var result = credentialService.createCredential(request);

        assertNotNull(result);
        assertEquals("Gmail", result.getTitle());
        assertEquals("Secret@123", result.getPassword());

        verify(credentialRepository).save(any(Credential.class));

        verify(auditLogService).log(
                eq("CREATE"),
                eq("CREDENTIAL"),
                eq(10L),
                contains("Gmail")
        );
    }

    // 2. Null request is rejected
    @Test
    void createCredentialFailsWhenRequestIsNull() {
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> credentialService.createCredential(null)
        );

        assertEquals(
                "Credential data is required",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verify(credentialRepository, never())
                .save(any(Credential.class));
    }

    // 3. Blank title is rejected
    @Test
    void createCredentialFailsWhenTitleIsBlank() {
        CredentialCreateRequestDto request =
                new CredentialCreateRequestDto(
                        " ",
                        "indra",
                        "Secret@123",
                        null,
                        null,
                        null,
                        "WEBSITE_LOGIN",
                        false
                );

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> credentialService.createCredential(request)
        );

        assertEquals("Title is required", exception.getMessage());

        verifyNoInteractions(userRepository);
        verify(credentialRepository, never())
                .save(any(Credential.class));
    }

    // 4. Missing username is rejected for website login
    @Test
    void createCredentialFailsWhenUsernameIsMissing() {
        mockCurrentUser();

        CredentialCreateRequestDto request =
                new CredentialCreateRequestDto(
                        "Gmail",
                        " ",
                        "Secret@123",
                        null,
                        null,
                        null,
                        "WEBSITE_LOGIN",
                        false
                );

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> credentialService.createCredential(request)
        );

        assertEquals("Username is required", exception.getMessage());

        verify(credentialRepository, never())
                .save(any(Credential.class));
    }

    // 5. Secure note can be created without username/password
    @Test
    void createSecureNoteDoesNotRequireUsernameOrPassword() {
        mockCurrentUser();

        CredentialCreateRequestDto request =
                new CredentialCreateRequestDto(
                        "Private note",
                        null,
                        null,
                        null,
                        "My private information",
                        "Personal",
                        "SECURE_NOTE",
                        false
                );

        when(encryptionService.encrypt("My private information"))
                .thenReturn("encrypted-note");

        when(credentialRepository.save(any(Credential.class)))
                .thenAnswer(invocation -> {
                    Credential saved = invocation.getArgument(0);
                    saved.setId(11L);
                    return saved;
                });

        when(encryptionService.decrypt("encrypted-note"))
                .thenReturn("My private information");

        var result = credentialService.createCredential(request);

        assertNotNull(result);
        assertEquals("Private note", result.getTitle());
        assertEquals("SECURE_NOTE", result.getCredentialType());
        assertEquals("My private information", result.getNotes());

        verify(credentialRepository).save(argThat(
                credential ->
                        "SECURE_NOTE".equals(
                                credential.getCredentialType()
                        )
                                && "".equals(credential.getPassword())
        ));
    }

    // 6. Successful credential update
    @Test
    void updateCredentialSuccessfully() {
        mockCurrentUser();

        Credential existing = createCredential();

        CredentialUpdateRequestDto request =
                new CredentialUpdateRequestDto(
                        "Updated Gmail",
                        "newuser@gmail.com",
                        "NewSecret@123",
                        "https://gmail.com",
                        "Updated notes",
                        "Work",
                        "WEBSITE_LOGIN",
                        true
                );

        when(credentialRepository.findByIdAndDeletedFalse(10L))
                .thenReturn(Optional.of(existing));

        when(credentialShareService.canEdit(existing, user))
                .thenReturn(true);

        when(encryptionService.encrypt("NewSecret@123"))
                .thenReturn("new-encrypted-password");

        when(encryptionService.encrypt("Updated notes"))
                .thenReturn("new-encrypted-notes");

        when(credentialRepository.save(existing))
                .thenReturn(existing);

        when(encryptionService.decrypt("new-encrypted-password"))
                .thenReturn("NewSecret@123");

        when(encryptionService.decrypt("new-encrypted-notes"))
                .thenReturn("Updated notes");

        ResponseEntity<?> response =
                credentialService.updateCredential(10L, request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Updated Gmail", existing.getTitle());
        assertEquals("newuser@gmail.com", existing.getUsername());
        assertEquals("new-encrypted-password", existing.getPassword());
        assertEquals("Work", existing.getCategory());
        assertTrue(existing.isFavorite());

        verify(credentialRepository).save(existing);

        verify(auditLogService).log(
                eq("UPDATE"),
                eq("CREDENTIAL"),
                eq(10L),
                contains("Updated Gmail")
        );
    }

    // 7. Updating a nonexistent credential fails
    @Test
    void updateCredentialFailsWhenCredentialDoesNotExist() {
        mockCurrentUser();

        CredentialUpdateRequestDto request =
                new CredentialUpdateRequestDto(
                        "Updated",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        false
                );

        when(credentialRepository.findByIdAndDeletedFalse(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> credentialService.updateCredential(99L, request)
        );

        assertEquals(
                "Credential not found or access denied",
                exception.getMessage()
        );

        verify(credentialRepository, never())
                .save(any(Credential.class));

        verifyNoInteractions(credentialShareService);
    }

    // 8. Deleting another user's/nonexistent credential is rejected
    @Test
    void deleteCredentialFailsWhenCredentialDoesNotBelongToUser() {
        mockCurrentUser();

        when(credentialRepository.findByIdAndUserAndDeletedFalse(
                99L, user
        )).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> credentialService.deleteCredential(99L)
        );

        assertEquals(
                "Credential not found or access denied",
                exception.getMessage()
        );

        verify(credentialRepository, never())
                .delete(any(Credential.class));
    }

    // 9. Blank search returns the current user's credentials
    @Test
    void searchWithBlankKeywordReturnsAllUserCredentials() {
        mockCurrentUser();

        when(credentialRepository.findAllByUserAndDeletedFalse(user))
                .thenReturn(Collections.emptyList());

        ResponseEntity<?> response =
                credentialService.searchCredentials(" ");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());

        verify(credentialRepository)
                .findAllByUserAndDeletedFalse(user);

        verify(credentialRepository, never())
                .searchCredentials(any(User.class), anyString());
    }
}

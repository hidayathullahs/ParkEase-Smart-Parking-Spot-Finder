package com.parkease.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkease.dto.GoogleLoginRequest;
import com.parkease.dto.JwtResponse;
import com.parkease.dto.LoginRequest;
import com.parkease.dto.SignupRequest;
import com.parkease.model.Role;
import com.parkease.model.User;
import com.parkease.repository.UserRepository;
import com.parkease.security.JwtUtils;
import com.parkease.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole());
    }

    public JwtResponse registerUser(SignupRequest signUpRequest) throws Exception {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new Exception("Error: Email is already in use!");
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole());

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signUpRequest.getEmail(), signUpRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole());
    }

    public JwtResponse googleLogin(GoogleLoginRequest googleRequest) {
        String rawToken = googleRequest.getToken() != null ? googleRequest.getToken() : googleRequest.getTokenId();
        if ((googleRequest.getEmail() == null || googleRequest.getEmail().isEmpty()) && rawToken != null && rawToken.contains(".")) {
            try {
                String[] parts = rawToken.split("\\.");
                if (parts.length >= 2) {
                    String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                    JsonNode node = new ObjectMapper().readTree(payload);
                    if (node.has("email")) googleRequest.setEmail(node.get("email").asText());
                    if (node.has("name")) googleRequest.setName(node.get("name").asText());
                    if (node.has("sub")) googleRequest.setGoogleId(node.get("sub").asText());
                    if (node.has("picture")) googleRequest.setPhoto(node.get("picture").asText());
                }
            } catch (Exception e) {
                logger.warn("Could not parse Google ID token payload: {}", e.getMessage());
            }
        }

        if (googleRequest.getEmail() == null || googleRequest.getEmail().isEmpty()) {
            throw new RuntimeException("Invalid Google token: email missing");
        }

        // Check if user exists
        User user = userRepository.findByEmail(googleRequest.getEmail()).orElse(null);

        if (user == null) {
            user = new User();
            user.setName(googleRequest.getName() != null ? googleRequest.getName() : "Google User");
            user.setEmail(googleRequest.getEmail());
            user.setGoogleId(googleRequest.getGoogleId());
            if (googleRequest.getPhoto() != null) {
                user.setPhoto(googleRequest.getPhoto());
            }
            user.setRole(Role.USER);
            user = userRepository.save(user);
        } else if (user.getGoogleId() == null && googleRequest.getGoogleId() != null) {
            user.setGoogleId(googleRequest.getGoogleId());
            user = userRepository.save(user);
        }

        String jwt = jwtUtils.generateJwtToken(user);

        return new JwtResponse(jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name());
    }

    public void forgotPassword(String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpire(new Date(System.currentTimeMillis() + 3600000)); // 1 hour
        userRepository.save(user);
    }

    public void resetPassword(String token, String newPassword) throws Exception {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new Exception("Invalid token"));

        if (user.getResetPasswordExpire().before(new Date())) {
            throw new Exception("Token expired");
        }

        user.setPassword(encoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpire(null);
        userRepository.save(user);
    }
}

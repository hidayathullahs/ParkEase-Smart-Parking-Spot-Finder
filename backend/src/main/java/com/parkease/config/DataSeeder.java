package com.parkease.config;

import com.parkease.model.Role;
import com.parkease.model.User;
import com.parkease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUser("admin@gmail.com", "admin123", "Admin User", Role.ADMIN);
        seedUser("provider@gmail.com", "provider123", "Provider User", Role.PROVIDER);
        seedUser("user@gmail.com", "user123", "Normal User", Role.USER);
    }

    private void seedUser(String email, String password, String name, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            userRepository.save(user);
            System.out.println("Seeded user: " + email);
        }
    }
}

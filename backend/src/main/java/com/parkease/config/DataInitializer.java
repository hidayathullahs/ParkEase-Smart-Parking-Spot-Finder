package com.parkease.config;

import com.parkease.model.Role;
import com.parkease.model.User;
import com.parkease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin exists
        if (!userRepository.existsByEmail("admin@parkease.com")) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@parkease.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setRole(Role.ADMIN);
            admin.setPhone("0000000000");
            
            userRepository.save(admin);
            System.out.println("✅ Default Admin User Created: admin@parkease.com / admin123");
        } else {
            // Optional: Ensure the existing admin has the correct role
            User admin = userRepository.findByEmail("admin@parkease.com").orElse(null);
            if (admin != null) {
                boolean changed = false;
                if (admin.getRole() != Role.ADMIN) {
                    admin.setRole(Role.ADMIN);
                    changed = true;
                }
                // Force reset password to ensure we can login
                admin.setPassword(passwordEncoder.encode("admin123"));
                changed = true;
                
                if (changed) {
                    userRepository.save(admin);
                    System.out.println("✅ Updated existing admin@parkease.com role/password");
                }
            }
        }

        // Check if a provider exists for testing
        if (!userRepository.existsByEmail("owner@parkease.com")) {
            User owner = new User();
            owner.setName("Demo Space Owner");
            owner.setEmail("owner@parkease.com");
            owner.setPassword(passwordEncoder.encode("owner123"));
            owner.setRole(Role.PROVIDER);
            owner.setPhone("1111111111");

            userRepository.save(owner);
            System.out.println("✅ Default Owner User Created: owner@parkease.com / owner123");
        } else {
             User owner = userRepository.findByEmail("owner@parkease.com").orElse(null);
            if (owner != null) {
                boolean changed = false;
                if (owner.getRole() != Role.PROVIDER) {
                    owner.setRole(Role.PROVIDER);
                    changed = true;
                }
                // Force reset password
                owner.setPassword(passwordEncoder.encode("owner123"));
                changed = true;

                if (changed) {
                    userRepository.save(owner);
                    System.out.println("✅ Updated existing owner@parkease.com role/password");
                }
            }
        }
    }
}

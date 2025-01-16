package com.Tuul.ScooterRentalApp.controllers;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;

import com.Tuul.ScooterRentalApp.models.User;
import com.Tuul.ScooterRentalApp.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.io.StringWriter;
import java.io.PrintWriter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            if (user.getId() == null || user.getEmail() == null || user.getName() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing required fields: id, email, and name are required"));
            }

            String userId = userService.createUser(user);
            return ResponseEntity.ok(Map.of(
                    "userId", userId,
                    "success", true,
                    "message", "User successfully registered"));
        } catch (UserCreationException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage(), "success", false));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Server error occurred",
                            "details", e.getMessage(),
                            "success", false));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestHeader("Authorization") String idToken) {
        if (idToken == null || !idToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance()
                    .verifyIdToken(idToken.replace("Bearer ", ""));
            String uid = decodedToken.getUid();

            User user = userService.loginUser(uid);
            return ResponseEntity.ok(user);

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during login");
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Object> getUser(@PathVariable String userId) {
        try {
            Optional<User> user = userService.getUser(userId);
            if (user.isPresent()) {
                User returnUser = user.get();
                return new ResponseEntity<>(user.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error retrieving user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<Object> getAllUsers() {
    try {
    List<User> users = userService.getAllUsers();
    // users.forEach(user -> user.setPassword(null)); // Remove passwords before
    return new ResponseEntity<>(users, HttpStatus.OK);
    } catch (ExecutionException | InterruptedException e) {
    e.printStackTrace();
    return new ResponseEntity<>("Error retrieving users",
    HttpStatus.INTERNAL_SERVER_ERROR);
    }
    }

}

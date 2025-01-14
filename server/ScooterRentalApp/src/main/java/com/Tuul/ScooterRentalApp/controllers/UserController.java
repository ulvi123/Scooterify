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


@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    //@RequestHeader("Authorization") String idToken

    // @PostMapping("/register")
    // public ResponseEntity<?> registerUser(@RequestBody User user) {
    //     try {
    //         // Remove "Bearer " if present
    //         // String token = idToken.replace("Bearer ", "");
            
    //         // FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
    //         // String uid = decodedToken.getUid();
            
    //         // // Print debug information
    //         // System.out.println("Decoded UID: " + uid);
    //         // System.out.println("User object: " + user);  // Add toString() to your User class if not present
            
    //         // user.setId(uid);

    
    //         String userId = userService.createUser(user);
    //         return ResponseEntity.ok().body(new HashMap<String, String>() {{
    //             put("userId", userId);
    //             put("message", "User successfully registered");
    //         }});
    //         // return ResponseEntity.ok(Map.of("userId", userId, "message", "User successfully registered"));

            
    //     } catch (FirebaseAuthException e) {
    //         System.out.println("Firebase Auth Error: " + e.getMessage());
    //         return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
    //             .body(new HashMap<String, String>() {{
    //                 put("error", "Invalid Firebase token");
    //                 put("details", e.getMessage());
    //             }});
                
    //     } catch (IllegalArgumentException e) {
    //         System.out.println("Validation Error: " + e.getMessage());
    //         return ResponseEntity.badRequest()
    //             .body(new HashMap<String, String>() {{
    //                 put("error", "Invalid request");
    //                 put("details", e.getMessage());
    //             }});
                
    //     } catch (Exception e) {
    //         System.out.println("Server Error: " + e.getMessage());
    //         e.printStackTrace();  
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body(new HashMap<String, String>() {{
    //                 put("error", "Server error occurred");
    //                 put("details", e.getMessage());
    //             }});
    //     }
    // }


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Validate required fields
            if (user.getId() == null || user.getEmail() == null || user.getName() == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields: id, email, and name are required"));
            }
    
            String userId = userService.createUser(user);
            return ResponseEntity.ok(Map.of(
                "userId", userId,
                "success", true,
                "message", "User successfully registered"
            ));
        } catch (UserCreationException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage(), "success", false));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Server error occurred",
                    "details", e.getMessage(),
                    "success", false
                ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestHeader("Authorization") String idToken) {
        try {
            // Verify Firebase token
            FirebaseToken decodedToken = FirebaseAuth.getInstance()
                .verifyIdToken(idToken.replace("Bearer ", ""));
            String uid = decodedToken.getUid();

            // Use the new loginUser service method
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


    @GetMapping("/{userId}")  // Fixed path - removed redundant /users/
    public ResponseEntity<Object> getUser(@PathVariable String userId) {
        try {
            Optional<User> user = userService.getUser(userId);
            if (user.isPresent()) {
                User returnUser = user.get();
                // returnUser.setPassword(null);
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
            // users.forEach(user -> user.setPassword(null)); // Remove passwords before sending
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error retrieving users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
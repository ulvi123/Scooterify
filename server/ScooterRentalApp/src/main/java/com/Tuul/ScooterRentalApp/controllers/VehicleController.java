package com.Tuul.ScooterRentalApp.controllers;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.Tuul.ScooterRentalApp.models.Vehicle;
import com.Tuul.ScooterRentalApp.services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173") // Adjust this to match your React app's URL
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping("/pair")
    public ResponseEntity<?> pairScooter(@RequestHeader("Authorization") String authHeader,
            @RequestBody PairingRequest request) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            String userId = decodedToken.getUid();

            // Verify that the userId in the token matches the one in the request
            if (!userId.equals(request.getUserId())) {
                return ResponseEntity.status(403).body("User ID mismatch");
            }

            if (request.getPairingCode() == null || request.getPairingCode().isEmpty()) {
                return ResponseEntity.badRequest().body("Missing pairingCode");
            }

            Optional<Vehicle> activeVehicle = vehicleService.findActiveVehicleByUserId(userId);
            if (activeVehicle.isPresent()) {
                return ResponseEntity.status(400)
                        .body("You already have a paired scooter. Visit your profile or dashboard to manage it.");
            }

            // Find the vehicle by pairing code
            Optional<Vehicle> vehicleOpt = vehicleService.findByPairingCode(request.getPairingCode());
            if (vehicleOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid pairing code");
            }

            Vehicle vehicle = vehicleOpt.get();
            vehicle.setRented(true);
            vehicle.setPairingCode(null);
            vehicleService.updateVehicle(vehicle);
            return ResponseEntity.ok(vehicle.getId());

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(401).body("Invalid token: " + e.getMessage());
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.internalServerError()
                    .body("An error occurred while pairing the scooter: " + e.getMessage());
        }
    }

    // I also would need unpair method to unpair the scooter when the reservation is
    // ended

    // function goes here .....

    @PutMapping("/{vehicleId}/unpair")
    public ResponseEntity<?> unpairScooter(@PathVariable String vehicleId,
            @RequestHeader("Authorization") String authorization) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing authorization");
            }
            String token = authorization.substring(7);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            String userId = decodedToken.getUid();

            Optional<Vehicle> vehicleOptional = vehicleService.getVehicle(vehicleId);
            if (vehicleOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Vehicle not found");
            }

            Vehicle vehicle = vehicleOptional.get();

            System.out.println("Unpair attempt - Vehicle userId: " + vehicle.getUserId() + ", Request userId: " + userId);


            if (vehicle.getUserId() != null && !userId.equals(vehicle.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("User is not authorized to unpair this vehicle");
            }

            vehicleService.unpairVehicle(vehicleId);
            return ResponseEntity.ok().build(); // I feel returning no body here

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token: " + e.getMessage());
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred.");
        }
    }

    @GetMapping("/{vehicleId}/power")
    public ResponseEntity<?> setVehiclePower(@PathVariable String vehicleId,
            @RequestParam String command,
            @RequestHeader("Authorization") String authorization) {
        try {
      
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

        
            String idToken = authorization.substring(7);
            System.out.println("Token length: " + idToken.length());

            try {
        
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String uid = decodedToken.getUid();
                System.out.println("Token verified successfully for user: " + uid);

      
                Optional<Vehicle> vehicleOpt = vehicleService.getVehicle(vehicleId);

                if (vehicleOpt.isEmpty()) {
                    return ResponseEntity.notFound().build();
                }

                Vehicle vehicle = vehicleOpt.get();

          
                if ("ON".equalsIgnoreCase(command) || "OFF".equalsIgnoreCase(command)) {
                    vehicleService.updateVehiclePowerStatus(vehicleId, command);
                    return ResponseEntity.ok(vehicle);
                } else {
                    return ResponseEntity.badRequest().body("Invalid command for power state.");
                }

            } catch (FirebaseAuthException e) {
                System.out.println("Token verification failed: " + e.getMessage());
                return ResponseEntity.status(401).body("Invalid token: " + e.getMessage());
            }

        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body("Error fetching vehicle: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

}

class PairingRequest {
    private String pairingCode;
    private String userId;

 
    public String getPairingCode() {
        return pairingCode;
    }

    public void setPairingCode(String pairingCode) {
        this.pairingCode = pairingCode;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
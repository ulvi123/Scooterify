package com.Tuul.ScooterRentalApp.controllers;

import com.Tuul.ScooterRentalApp.models.Reservation;
import com.Tuul.ScooterRentalApp.services.VehicleService;
import com.Tuul.ScooterRentalApp.services.ReservationService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.Optional;



@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = { "http://localhost:5173" }, allowCredentials = "true")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;
    @Autowired
    private VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<String> createReservation(@RequestBody Reservation reservation)
            throws ExecutionException, InterruptedException, TimeoutException {
        String reservationId = reservationService.createReservation(reservation);
        return ResponseEntity.ok(reservationId);
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<Reservation> getReservation(@PathVariable String vehicleId)
            throws ExecutionException, InterruptedException, TimeoutException {
        return reservationService.getReservation(vehicleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<String> finishReservation(
            @PathVariable String vehicleId,
            @RequestParam double endLatitude,
            @RequestParam double endLongitude) throws ExecutionException, InterruptedException, TimeoutException {
        reservationService.finishReservation(vehicleId, endLatitude, endLongitude);

        // String vehicle = vehicleService.getVehicle(vehicleId).get();
        
        // if(vehicle == null){
        //     return ResponseEntity.notFound().build();
        // }

        // vehicle.setRented(false);
        // vehicle.updateVehicle(vehicle);


        return ResponseEntity.ok("Reservation finished");
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveReservation(@RequestHeader("Authorization") String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        try {
            String idToken = authorization.substring(7);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            Optional<Reservation> activeReservation = reservationService.getActiveReservation(uid);

            if (activeReservation.isEmpty()) {
                return ResponseEntity.noContent().build(); // 204 No Content
            }

            // Return the entire reservation object, not just the ID
            return ResponseEntity.ok(activeReservation.get());

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token: " + e.getMessage());
        } catch (ExecutionException | InterruptedException | TimeoutException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An internal error occurred.");
        }
    }

}

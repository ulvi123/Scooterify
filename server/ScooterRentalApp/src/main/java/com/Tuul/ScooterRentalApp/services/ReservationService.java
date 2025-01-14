package com.Tuul.ScooterRentalApp.services;

import com.google.cloud.firestore.WriteResult;
import java.util.concurrent.TimeoutException;
import com.google.cloud.firestore.DocumentSnapshot;
import com.Tuul.ScooterRentalApp.models.Reservation;
import com.Tuul.ScooterRentalApp.models.Vehicle;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.Tuul.ScooterRentalApp.firebase.FirebaseInitialization;
import org.springframework.beans.factory.annotation.Autowired;
import com.google.cloud.firestore.QuerySnapshot;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import com.google.cloud.firestore.WriteBatch;
import java.util.Map;
import java.time.Duration;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.time.Instant;
import java.util.Optional;

import com.google.cloud.Timestamp;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ExecutionException;

@Service
public class ReservationService {
    private final Firestore firestore;
    @Autowired
    private final VehicleService vehicleService;

    public ReservationService(FirebaseInitialization firebaseInitialization, VehicleService vehicleService) {
        this.vehicleService = vehicleService;
        this.firestore = FirestoreClient.getFirestore();
    }

    // creating a reservation
    public String createReservation(Reservation reservation)
            throws ExecutionException, InterruptedException, TimeoutException {
        Vehicle vehicle = vehicleService.getVehicle(reservation.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (vehicle.getId() == null || vehicle.getId().isEmpty()) {
            throw new RuntimeException("Vehicle ID is invalid");
        }

        if (vehicle.isRented()) {
            throw new RuntimeException("Vehicle is rented by other customers");
        }

        reservation.setStartTime(LocalDateTime.now(ZoneId.of("UTC")));
        reservation.setStartLatitude(vehicle.getLatitude());
        reservation.setStartLongitude(vehicle.getLongitude());
        vehicle.setRented(true);

        return saveReservationAndVehicle(reservation, vehicle);
    }

    // storing the reservation to the firestore
    private String saveReservationAndVehicle(Reservation reservation, Vehicle vehicle)
            throws ExecutionException,TimeoutException, InterruptedException {
        WriteBatch batch = firestore.batch();
        DocumentReference vehicleRef = firestore.collection("vehicles").document(reservation.getVehicleId());
        DocumentReference docRef = firestore.collection("reservations").document();
        reservation.setId(docRef.getId());

        batch.update(vehicleRef, "rented", vehicle.isRented());

        Map<String, Object> reservationData = new HashMap<>();
        reservationData.put("userId", reservation.getUserId());
        reservationData.put("vehicleId", reservation.getVehicleId());
        reservationData.put("startLongitude", reservation.getStartLongitude());
        reservationData.put("startLatitude", reservation.getStartLatitude());
        reservationData.put("startTime", reservation.getStartTime()); // Use LocalDateTime, conversion handled in //
                                                                      // Firestore
        reservationData.put("endTime", reservation.getEndTime()); // Use LocalDateTime, conversion handled in Firestore
        reservationData.put("cost", reservation.getCost());

        batch.set(docRef, reservationData);
        try {
            batch.commit().get(5, TimeUnit.SECONDS);
        } catch (java.util.concurrent.TimeoutException e) {
            System.err.println("Firestore batch commit timed out: " + e.getMessage());
            throw e;
        }

        return reservation.getId();
    }

    // Adding a method here to get reservation by ID
    public Optional<Reservation> getReservation(String vehicleId)
            throws ExecutionException, InterruptedException, TimeoutException {
        DocumentReference docRef = firestore.collection("reservations").document(vehicleId);
        DocumentSnapshot document = docRef.get().get(5, TimeUnit.SECONDS); // Throws TimeoutException
        if (document.exists()) {
            return Optional.ofNullable(document.toObject(Reservation.class));
        } else {
            return Optional.empty();
        }
    }

    // caluclating the ride duration post-reservation finish
    private long calculateRentalDurationMinutes(LocalDateTime startTime, LocalDateTime endTime) {
        if (endTime == null || startTime == null) {
            return 0;
        }
        Duration duration = Duration.between(startTime, endTime);
        return duration.toMinutes();
    }

    // calculating the cost of the rental
    private double calculateCost(long minutes) {
        double cost = 1.0; // 1€ per rental start
        if (minutes <= 10) {
            cost += minutes * 0.5;
        } else {
            cost += 10 * 0.5;
            cost += (minutes - 10) * 0.3;
        }
        return cost;
    }

    // getting the active reservation id
    public Optional<Reservation> getActiveReservation(String userId) throws ExecutionException, InterruptedException, TimeoutException {
        try {
            // First get the ApiFuture
            ApiFuture<QuerySnapshot> future = firestore.collection("reservations")
                    .whereEqualTo("userId", userId)
                    .whereEqualTo("endTime", null)
                    .limit(1)
                    .get();
    
            // Then apply timeout to the future
            QuerySnapshot querySnapshot = future.get(5, TimeUnit.SECONDS);
            
            if (!querySnapshot.isEmpty()) {
                DocumentSnapshot document = querySnapshot.getDocuments().get(0);
                return Optional.ofNullable(document.toObject(Reservation.class));
            }
            
            return Optional.empty();
            
        } catch (TimeoutException e) {
            System.err.println("Firestore query timed out: " + e.getMessage());
            throw e;
        }
    }

    // method to finish the reservation and update the vehicle and the reservation
    // data
    public void finishReservation(String reservationId, double endLatitude, double endLongitude)
            throws ExecutionException, InterruptedException, TimeoutException {
        Optional<Reservation> optionalReservation = getReservation(reservationId);
        if (optionalReservation.isPresent()) {
            Reservation reservation = optionalReservation.get();
            reservation.setEndLatitude(endLatitude);
            reservation.setEndLongitude(endLongitude);
            reservation.setEndTime(LocalDateTime.now(ZoneId.of("UTC")));

            

            Map<String, Object> updates = new HashMap<>();
            updates.put("endLatitude", reservation.getEndLatitude());
            updates.put("endLongitude", reservation.getEndLongitude());
            updates.put("endTime", reservation.getEndTime()); 
            updates.put("cost", reservation.calculateCost());

            DocumentReference docRef = firestore.collection("reservations").document(reservationId);
            docRef.update(updates).get(5, TimeUnit.SECONDS); // Add timeout
        }
    }

}

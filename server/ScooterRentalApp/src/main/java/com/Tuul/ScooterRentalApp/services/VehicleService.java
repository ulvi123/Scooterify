package com.Tuul.ScooterRentalApp.services;

import com.google.cloud.firestore.WriteResult;
import com.Tuul.ScooterRentalApp.models.Vehicle;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.Query;
import com.google.firebase.cloud.FirestoreClient;
import com.Tuul.ScooterRentalApp.firebase.FirebaseInitialization;
import org.springframework.stereotype.Service;
import com.google.cloud.firestore.FieldValue;


import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class VehicleService {

    private final Firestore firestore;

    public VehicleService(FirebaseInitialization firebaseInitialization) {
        this.firestore = FirestoreClient.getFirestore();
    }

    public Optional<Vehicle> getVehicle(String vehicleId) throws ExecutionException, InterruptedException {
        System.out.println("Attempting to fetch vehicle with ID: " + vehicleId);
        DocumentReference docRef = firestore.collection("vehicles").document(vehicleId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        try {
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                Vehicle vehicle = document.toObject(Vehicle.class);
                if (vehicle != null) {
                    vehicle.setId(document.getId());
                }
                System.out.println("Vehicle found: " + vehicle);
                return Optional.of(vehicle);
            } else {
                System.out.println("No vehicle found with ID: " + vehicleId);
            }
        } catch (ExecutionException | InterruptedException e) {
            System.err.println("Error while fetching vehicle: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public Optional<Vehicle> findByPairingCode(String pairingCode) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("vehicles")
                .whereEqualTo("pairingCode", pairingCode)
                .limit(1)
                .get();

        QuerySnapshot querySnapshot = future.get();
        if (!querySnapshot.isEmpty()) {
            DocumentSnapshot document = querySnapshot.getDocuments().get(0);
            Vehicle vehicle = document.toObject(Vehicle.class);
            if (vehicle != null) {
                vehicle.setId(document.getId());
            }
            return Optional.ofNullable(vehicle);
        }
        return Optional.empty();
    }

    public Optional<Vehicle> findActiveVehicleByUserId(String userId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("vehicles")
                .whereEqualTo("userId", userId)
                .whereEqualTo("rented", true)
                .limit(1)
                .get();

        QuerySnapshot querySnapshot = future.get();
        if (!querySnapshot.isEmpty()) {
            DocumentSnapshot document = querySnapshot.getDocuments().get(0);
            Vehicle vehicle = document.toObject(Vehicle.class);
            if (vehicle != null) {
                vehicle.setId(document.getId());
            }
            return Optional.ofNullable(vehicle);
        }
        return Optional.empty();
    }

    public void updateVehicle(Vehicle vehicle) throws ExecutionException, InterruptedException {
        if (vehicle.getId() == null || vehicle.getId().isEmpty()) {
            throw new IllegalArgumentException("Vehicle ID is invalid.");
        }

        DocumentReference docRef = firestore.collection("vehicles").document(vehicle.getId());

        try {
            // Create a map with the fields to update
            Map<String, Object> updates = new HashMap<>();
            updates.put("rented", vehicle.isRented());
            updates.put("latitude", vehicle.getLatitude());
            updates.put("longitude", vehicle.getLongitude());
            updates.put("stateOfCharge", vehicle.getStateOfCharge());
            updates.put("estimatedRange", vehicle.getEstimatedRange());
            updates.put("pairingCode", vehicle.getPairingCode());

            ApiFuture<WriteResult> future = docRef.update(updates);
            future.get();
            System.out.println("Vehicle updated successfully");
        } catch (ExecutionException | InterruptedException e) {
            System.err.println("Error updating vehicle: " + e.getMessage());
            throw new RuntimeException("Error updating vehicle", e);
        }
    }

    public void updateVehiclePowerStatus(String vehicleId, String command)
            throws ExecutionException, InterruptedException {
        // Validate the command
        if (!"ON".equals(command) && !"OFF".equals(command)) {
            throw new IllegalArgumentException("Invalid command. It must be 'ON' or 'OFF'.");
        }

        // Reference to the vehicle document
        DocumentReference docRef = firestore.collection("vehicles").document(vehicleId);

        // Create a map with the field to update
        Map<String, Object> updates = new HashMap<>();
        updates.put("poweredOn", "ON".equals(command)); // Set to true if ON, false if OFF

        // Update the vehicle's poweredOn state in Firestore
        ApiFuture<WriteResult> future = docRef.update(updates);
        future.get(); // Wait for the operation to complete
        System.out.println("Vehicle " + vehicleId + " powered " + command);
    }

    // public void unpairVehicle(String vehicleId) throws ExecutionException, InterruptedException {
    //     if (vehicleId == null || vehicleId.length() == 0 || vehicleId.isEmpty()) {
    //         throw new IllegalArgumentException("Vehicle ID is invalid.");
    //     }

    //     // vehicleId or id--check it after testing,if it failes, then put id since in
    //     // firestore it is stated as id
    //     DocumentReference docRef = firestore.collection("vehicles").document(vehicleId);
    //     Map<String, Object> updates = new HashMap<String, Object>();
    //     updates.put("rented", false);
    //     updates.put("userId", null);
    //     updates.put("pairingCode", generateNewPairingCode());

    //     // Here I am pushing the updates to the firestire to unpair the vehicle
    //     docRef.update(updates).get();

    // }

    private String generateNewPairingCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public void unpairVehicle(String vehicleId) throws ExecutionException, InterruptedException {
        if (vehicleId == null || vehicleId.isEmpty()) {
            throw new IllegalArgumentException("Vehicle ID is invalid.");
        }

        DocumentReference docRef = firestore.collection("vehicles").document(vehicleId);
        DocumentSnapshot snapshot = docRef.get().get();

        if (!snapshot.exists()) {
            throw new IllegalStateException("Vehicle not found");
        }
        System.out.println("Vehicle state before unpair: " + snapshot.getData());

        Map<String, Object> updates = new HashMap<>();
        updates.put("rented", false);
        updates.put("userId", null);
        updates.put("pairingCode", generateNewPairingCode());
        updates.put("lastUnpairedAt", FieldValue.serverTimestamp());

  
        String currentUserId = snapshot.getString("userId");
        if (currentUserId != null) {
            DocumentReference userRef = firestore.collection("users").document(currentUserId);
            DocumentSnapshot userSnapshot = userRef.get().get();
            if (userSnapshot.exists()) {
                String activeVehicle = userSnapshot.getString("activeVehicle");
                if (vehicleId.equals(activeVehicle)) {
                    userRef.update("activeVehicle", null).get();
                }
            }
        }

        docRef.update(updates).get();

        DocumentSnapshot afterUpdate = docRef.get().get();
        System.out.println("Vehicle state after unpair: " + afterUpdate.getData());
    }

}
package com.Tuul.ScooterRentalApp.repositories;

import com.Tuul.ScooterRentalApp.models.Vehicle;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class VehicleRepository {

    private static final String COLLECTION_NAME = "vehicles";

    public Optional<Vehicle> findByPairingCode(String pairingCode) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        var query = db.collection(COLLECTION_NAME).whereEqualTo("pairingCode", pairingCode).get();

        var documents = query.get().getDocuments();
        if (documents.isEmpty()) {
            return Optional.empty();
        }

        var document = documents.get(0);
        Vehicle vehicle = document.toObject(Vehicle.class);
        vehicle.setId(document.getId());
        return Optional.of(vehicle);
    }

    public Optional<Vehicle> findByUserIdAndRented(String userId, boolean rented) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        var query = db.collection(COLLECTION_NAME)
                .whereEqualTo("userId", userId)
                .whereEqualTo("rented", rented)
                .get();

        var documents = query.get().getDocuments();
        if (documents.isEmpty()) {
            return Optional.empty();
        }

        var document = documents.get(0);
        Vehicle vehicle = document.toObject(Vehicle.class);
        vehicle.setId(document.getId());
        return Optional.of(vehicle);
    }

    public void save(Vehicle vehicle) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(vehicle.getId()).set(vehicle).get();
    }
}

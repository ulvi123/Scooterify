package com.Tuul.ScooterRentalApp.services;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.Tuul.ScooterRentalApp.firebase.FirebaseInitialization;
import com.Tuul.ScooterRentalApp.models.User; 
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.io.PrintWriter;
import java.io.StringWriter;



@Service
public class UserService {
    private final Firestore firestore;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(FirebaseInitialization firebaseInitialization){
        this.firestore = FirestoreClient.getFirestore();
    }

    public String createUser(User user) {
        try {
            System.out.println("Creating user: " + user); // Print the user object
            DocumentReference docRef = firestore.collection("users").document(user.getId());
            ApiFuture<WriteResult> future = docRef.set(user);
            WriteResult result = future.get();
            System.out.println("WriteResult: " + result);
            return user.getId();
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            String stackTrace = sw.toString();

            System.err.println("Failed to create user: " + e.getMessage() + "\nStack Trace:\n" + stackTrace);
            throw new RuntimeException("Failed to create user", e); // Re-throw the exception!
        }
    }

    public User loginUser(String uid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("users").document(uid);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        if (!document.exists()) {
            throw new RuntimeException("User not found");
        }

        User user = document.toObject(User.class);
        if (user != null) {
            user.setId(document.getId());
            // user.setPassword(null); // Don't send password back
        }
        
        return user;
    }

    public boolean validateUserSession(String uid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("users").document(uid);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        return document.exists();
    }




    public Optional<User> getUser(String userId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("users").document(userId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        if (document.exists()) {
            return Optional.of(document.toObject(User.class));
        } else {
            return Optional.empty();
        }
    }

    public List<User> getAllUsers() throws ExecutionException, InterruptedException {
        CollectionReference usersCollection = firestore.collection("users");
        ApiFuture<QuerySnapshot> future = usersCollection.get();
        List<QueryDocumentSnapshot> doucments = future.get().getDocuments();

        List<User> userList = new ArrayList<>();
        for (QueryDocumentSnapshot document : doucments) {
            User user = document.toObject(User.class);
            user.setId(document.getId());
            userList.add(user);
        }
        return userList;
    }

}

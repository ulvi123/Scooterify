package com.Tuul.ScooterRentalApp.models;

import com.google.cloud.firestore.annotation.DocumentId;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    @DocumentId
    private String id;
    private String email;
    private String name;
    private String activeVehicle;

    public User() {

    }

    public User(String id, String email, String name, String activeVehicle) {
        this.email = email;
        this.name = name;
        this.activeVehicle = activeVehicle;
    }

    public String getEmail() {
        return email; // Assuming you have an email field
    }
    
    public String getName() {
        return name; // Assuming you have a name field
    }

    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    

    public String getActiveVehicle() {
        return activeVehicle;
    }
    
    public void setActiveVehicle(String activeVehicle) {
        this.activeVehicle = activeVehicle;
    }
}
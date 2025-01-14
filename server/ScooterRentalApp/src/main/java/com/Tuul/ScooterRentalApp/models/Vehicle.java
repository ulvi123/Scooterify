

package com.Tuul.ScooterRentalApp.models;
import java.time.LocalDateTime;

import lombok.Data;
@Data
public class Vehicle {
    private String id;
    private String vehicleId;
    private int stateOfCharge;
    private double longitude;
    private double latitude;
    private String pairingCode;
    private boolean rented;  // Change from isRented to rented to match Firestore
    private double estimatedRange;
    private String userId;  // New field to associate a scooter with a user
    private boolean poweredOn;
    private LocalDateTime lastUpdated; // Field to store the last updated time


    public String getUserId() {
        return this.userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getStateOfCharge() {
        return stateOfCharge;
      }
    
    public double getEstimatedRange() {
        return estimatedRange;
      }

    public String getId() {
        return id; 
    }
    
    public void setId(String id) {
        this.id = id;
    }

    public boolean isRented() {
        return this.rented;
    }

    public void setRented(boolean rented) {
        this.rented = rented;
    }


    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public boolean isPoweredOn() {
        return poweredOn;
    }

    public void setPoweredOn(boolean poweredOn) {
        this.poweredOn = poweredOn;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }


}


package com.Tuul.ScooterRentalApp.models;
import java.time.LocalDateTime;

import lombok.Data; //Usually Lombok does provide bakground implementaiton for getters and setters but somehow the compiler was complaining so I added them manually
@Data
public class Vehicle {
    private String id;
    private String vehicleId;
    private int stateOfCharge;
    private double longitude;
    private double latitude;
    private String pairingCode;
    private boolean rented;  
    private double estimatedRange;
    private String userId;  
    private boolean poweredOn;
 

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

   

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

   



}
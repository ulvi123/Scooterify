package com.Tuul.ScooterRentalApp.models;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.google.cloud.Timestamp;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.Instant;
import java.util.Date;

@Data
@NoArgsConstructor
public class Reservation {
    private String id;
    private String userId;
    private String vehicleId;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Timestamp startTime;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Timestamp endTime;
    
    private double startLongitude;
    private double startLatitude;
    private double endLongitude;
    private double endLatitude;
    private double cost;


    public void setStartTime(LocalDateTime startTime) {
        if (startTime != null) {
            Date date = Date.from(startTime.atZone(ZoneId.of("UTC")).toInstant());
            this.startTime = Timestamp.of(date);
        }
    }

    public LocalDateTime getStartTime() {
        if (startTime != null) {
            return LocalDateTime.ofInstant(
                Instant.ofEpochSecond(
                    startTime.getSeconds(), 
                    startTime.getNanos()
                ),
                ZoneId.of("UTC")
            );
        }
        return null;
    }

    public void setEndTime(LocalDateTime endTime) {
        if (endTime != null) {
            Date date = Date.from(endTime.atZone(ZoneId.of("UTC")).toInstant());
            this.endTime = Timestamp.of(date);
        }
    }

    public LocalDateTime getEndTime() {
        if (endTime != null) {
            return LocalDateTime.ofInstant(
                Instant.ofEpochSecond(
                    endTime.getSeconds(), 
                    endTime.getNanos()
                ),
                ZoneId.of("UTC")
            );
        }
        return null;
    }

    public void finishReservation(double endLatitude, double endLongitude) {
        this.endLatitude = endLatitude;
        this.endLongitude = endLongitude;
        this.setEndTime(LocalDateTime.now(ZoneId.of("UTC")));
        this.cost = calculateCost();
    }

    public double calculateCost() {
        if (startTime == null || endTime == null) {
            return 0.0;
        }
        long duration = ChronoUnit.MINUTES.between(getStartTime(), getEndTime());
        double costPerMinute = 0.5;
        return duration * costPerMinute;
    }
}

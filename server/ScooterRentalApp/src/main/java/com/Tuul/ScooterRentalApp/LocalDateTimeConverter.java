// package com.Tuul.ScooterRentalApp;

// import com.google.cloud.Timestamp;
// import com.google.cloud.firestore.annotation.ServerTimestamp;
// import com.google.firebase.database.PropertyName;
// import java.time.LocalDateTime;
// import java.time.ZoneId;
// import java.util.Date;

// public class LocalDateTimeConverter {
//     @ServerTimestamp
//     private Timestamp timestamp;

//     public LocalDateTimeConverter() {}

//     public LocalDateTimeConverter(LocalDateTime localDateTime) {
//         this.timestamp = localDateTime != null ? Timestamp.of(Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant())) : null;
//     }

//     @PropertyName("timestamp")
//     public Timestamp getTimestamp() {
//         return timestamp;
//     }

//     @PropertyName("timestamp")
//     public void setTimestamp(Timestamp timestamp) {
//         this.timestamp = timestamp;
//     }

//     public LocalDateTime toLocalDateTime() {
//         return timestamp != null ? LocalDateTime.ofInstant(timestamp.toDate().toInstant(), ZoneId.systemDefault()) : null;
//     }
// }
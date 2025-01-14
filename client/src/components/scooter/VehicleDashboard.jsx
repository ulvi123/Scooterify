// import React, { useState, useEffect } from "react";
// import {
//   getTheCurrentUserData,
//   getVehicleStatus,
// } from "../../services/vehicleDataServices";

// export const VehicleDashboard = () => {
//   const [vehicleData, setVehicleData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchVehicleData = async () => {
//       try {
//         setLoading(true);
//         console.log("Fetching vehicle data..."); // Log when fetching starts
//         const userData = await getTheCurrentUserData();
//         console.log("User Data from useEffect:", userData); // Log userData in useEffect
//         if (!userData.activeVehicle) {
//           setError("No active vehicle found");
//           console.log("Error set: No active vehicle found"); // Log when error is set
//           return;
//         }

//         // Then get vehicle status
//         const vehicleStatus = await getVehicleStatus(userData.activeVehicle);
//         console.log("Vehicle Status:", vehicleStatus); // Log the fetched vehicle status
//         setVehicleData(vehicleStatus);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVehicleData();

//     // Optional: Set up real-time updates
//     const intervalId = setInterval(fetchVehicleData, 80000); // Update every 30 seconds

//     return () => clearInterval(intervalId);
//   }, []);

//   if (loading) return <div>Loading vehicle data...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!vehicleData) return <div>No vehicle data available</div>;

//   return (
//     <div className="vehicle-dashboard">
//       <h2>Vehicle Status</h2>
//       <div className="status-grid">
//         <div className="status-item">
//           <h3>Battery Level</h3>
//           <p>{vehicleData.soc}%</p>
//         </div>
//         <div className="status-item">
//           <h3>Estimated Range</h3>
//           <p>{vehicleData.estimatedRange} km</p>
//         </div>
//         <div className="status-item">
//           <h3>Odometer</h3>
//           <p>{vehicleData.odometer} km</p>
//         </div>
//         <div className="status-item">
//           <h3>Power Status</h3>
//           <p>{vehicleData.poweredOn ? "On" : "Off"}</p>
//         </div>
//         <div className="status-item">
//           <h3>Location</h3>
//           <p>
//             Lat: {vehicleData.location.lat}
//             <br />
//             Lng: {vehicleData.location.lng}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

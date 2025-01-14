import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "../utils/LoadSpinner";
import { ErrorAlert } from "../utils/ErrorsAlerting";
import {
  getTheCurrentUserData,
  getTheCurrentVehicleData,
  getVehicleStatus,
  sendScooterCommand,
  finishReservation,
  unpairScooter,
  getReservationIdFromStorage,
} from "../../services/vehicleDataServices";
import styles from "../../styles/scooterDashb.module.css";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useParams } from "react-router-dom";
import { auth } from "../../services/firebase";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places"];

const VITE_GOOGLE_MAPS_API_KEY = "AIzaSyASkpletaqUH-NHlo1avkOAijauzoDf09A";

export const VehicleDashboard = () => {
  const { vehicleId } = useParams();
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const fetchVehicleData = async (vehicleIdToFetch) => {
    try {
      setLoading(true);
      const vehicleStatus = await getVehicleStatus(vehicleIdToFetch);
      setVehicleData(vehicleStatus);
      setUserLocation(vehicleStatus.location);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const togglePowerStatus = async (vehicleId, command) => {
    if (!vehicleId) {
      setError("Vehicle ID is missing.");
      return;
    }

    try {
      await sendScooterCommand(vehicleId, command);
      setVehicleData((prevData) => ({
        ...prevData,
        poweredOn: command === "ON",
      }));
    } catch (err) {
      setError("Failed to send command.");
    }
  };

  const handleReservation = async () => {
    console.log("Starting reservation end process");

    try {
      setLoading(true);

      const vehicleData = await getTheCurrentVehicleData(vehicleId);
      console.log("VehicledATA:", vehicleData);

      // Verify vehicle data first
      if (!vehicleData?.id) {
        throw new Error("No vehicle data available to end reservation.");
      }

      // Verify location data
      if (!vehicleData.location?.latitude || !vehicleData.location?.longitude) {
        throw new Error("Vehicle location data is missing or invalid.");
      }

      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Authentication required");
      }

      console.log("Ending reservation with coordinates:", {
        latitude: vehicleData.location.latitude,
        longitude: vehicleData.location.longitude,
      });

      // End the reservation
      await finishReservation(
        vehicleId,
        vehicleData.location.latitude,
        vehicleData.location.longitude,
        idToken
      );

      // Unpairing the scooter
      await unpairScooter(vehicleId, idToken);

      // Success cleanup
      setVehicleData(null);
      setUserLocation(null);
      alert("Reservation ended successfully, and the scooter is now unpaired.");
    } catch (error) {
      setError(error.message);
      console.error("Reservation end error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (vehicleId) {
          fetchVehicleData(vehicleId);
        } else {
          const userData = await getTheCurrentUserData();
          const activeVehicle = userData.activeVehicle;
          if (!activeVehicle) {
            setError("No active vehicle found");
            return;
          }
          fetchVehicleData(activeVehicle);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error.message); // Log the error
          setLocationError("Could not get your location.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, [vehicleId]);

  if (loading && !vehicleData) {
    return <LoadingSpinner size="large" />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (locationError) {
    return <ErrorAlert message={locationError} />;
  }

  const center = userLocation || vehicleData?.location || { lat: 0, lng: 0 };

  const getBatteryColor = (soc) => {
    if (soc > 70) return "#4CAF50"; // Green for high battery
    if (soc > 30) return "#FFA726"; // Orange for medium battery
    return "#F44336"; // Red for low battery
  };

  return (
    <div className={styles.enhancedDashboard}>
      <div className={styles.controlPanelButtons}>
        <button
          className={styles.turnOnBtn}
          onClick={() => {
            if (vehicleData?.vehicleId) {
              togglePowerStatus(vehicleData.vehicleId, "ON");
            } else {
              setError("Vehicle ID is missing for Turn On");
            }
          }}
        >
          Turn On
        </button>
        <button
          className={styles.turnOffBtn}
          onClick={() => {
            if (vehicleData?.vehicleId) {
              togglePowerStatus(vehicleData.vehicleId, "OFF");
            } else {
              setError("Vehicle ID is missing for Turn Off");
            }
          }}
        >
          Turn Off
        </button>
        <button
          className={styles.endReservationBtn}
          onClick={handleReservation}
          // disabled={!vehicleData?.reservationId || loading}
        >
          {loading ? "Ending Reservation..." : "End Reservation"}
        </button>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.infoPanel}>
          <h2>Scooter Information</h2>
          <div className={styles.infoGrid}>
            {/* Battery Card - Enhanced with SOC data */}
            <div className={styles.infoCard}>
              <h3>Battery State</h3>
              <div className={styles.batteryIndicator}>
                <div
                  className={styles.batteryLevel}
                  style={{
                    width: `${vehicleData?.soc || 0}%`,
                    backgroundColor: getBatteryColor(vehicleData?.soc || 0),
                  }}
                />
                <span className={styles.batteryPercentage}>
                  SOC: {vehicleData?.soc || 0}%
                </span>
              </div>
            </div>

            {/* State of Charge Card */}
            <div className={styles.infoCard}>
              <h3>State of Charge</h3>
              <p className={styles.socValue}>{vehicleData?.soc || 0}%</p>
              <p className={styles.socStatus}>
                {vehicleData?.soc >= 90
                  ? "Fully Charged"
                  : vehicleData?.soc >= 70
                  ? "Good"
                  : vehicleData?.soc >= 30
                  ? "Moderate"
                  : "Low Battery"}
              </p>
            </div>

            {/* Range Card */}
            <div className={styles.infoCard}>
              <h3>Estimated Range</h3>
              <p>{vehicleData?.estimatedRange || 0} km</p>
            </div>

            {/* Odometer Card */}
            <div className={styles.infoCard}>
              <h3>Odometer</h3>
              <p>{vehicleData?.odometer || 0} km</p>
            </div>

            {/* Power Status Card */}
            <div className={styles.infoCard}>
              <h3>Power Status</h3>
              <p>{vehicleData?.poweredOn ? "ON" : "OFF"}</p>
            </div>

            {/* Location Card */}
            <div className={styles.infoCard}>
              <h3>Current Location</h3>
              <p>
                {vehicleData?.location
                  ? `${vehicleData.location.lat.toFixed(
                      4
                    )}, ${vehicleData.location.lng.toFixed(4)}`
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.mapPanel}>
          <h1>Vehicle Map</h1>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
            >
              <Marker position={center} />
            </GoogleMap>
          ) : (
            <div>Loading Map...</div>
          )}
        </div>
      </div>
    </div>
  );
};

// import React, { useState, useEffect } from "react";
// import { LoadingSpinner } from "../utils/LoadSpinner";
// import { ErrorAlert } from "../utils/ErrorsAlerting";
// import styles from "../../styles/scooterDashb.module.css";
// import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
// import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
// import auth  from '../../services/firebase';
// import { toast } from 'react-toastify';

// const containerStyle = {
//   width: "100%",
//   height: "100%",
// };

// const libraries = ["places"];

// const VITE_GOOGLE_MAPS_API_KEY = "AIzaSyASkpletaqUH-NHlo1avkOAijauzoDf09A";

// export const VehicleDashboard = () => {
//   const { vehicleId } = useParams();
//   const navigate = useNavigate(); // Initialize useNavigate
//   const { currentUser } = auth();
//   const [vehicleData, setVehicleData] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userLocation, setUserLocation] = useState(null);
//   const [locationError, setLocationError] = useState(null);
//   const { isLoaded } = useJsApiLoader({
//     id: "google-map-script",
//     googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY,
//     libraries: libraries,
//   });

//   const fetchVehicleData = async (vehicleIdToFetch) => {
//     try {
//       setLoading(true);
//       if (!currentUser) return;
//         const idToken = await currentUser.getIdToken();
//       const vehicleStatus = await VehicleDataService.getVehicle(vehicleIdToFetch,idToken);
//       setVehicleData(vehicleStatus.data);
//       setUserLocation(vehicleStatus.data.location);
//     } catch (err) {
//       setError(err.message);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const togglePowerStatus = async (command) => {
//     try {
//         if (!currentUser) return;
//         const idToken = await currentUser.getIdToken();
//       await VehicleDataService.sendScooterCommand(vehicleData.id, command,idToken);
//       setVehicleData((prevData) => ({
//         ...prevData,
//         poweredOn: command === "ON",
//       }));
//     } catch (err) {
//         console.error("Failed to send command.", err);
//         toast.error(err.message);
//     }
//   };

//   const handleReservation = async () => {
//     if (!vehicleData?.location) {
//       setError(
//         "Cannot end the booked reservation:Vehicle location could not be found."
//       );
//       toast.error(
//         "Cannot end the booked reservation:Vehicle location could not be found."
//       );
//       return;
//     }
//     try {
//         if (!currentUser) return;
//         const idToken = await currentUser.getIdToken();
//       await VehicleDataService.finishReservation(vehicleData.id, vehicleData.location.lng,vehicleData.location.lat, idToken);
//       await fetchVehicleData(vehicleData.id);
//       toast.success("Reservation ended successfully!");
//     } catch (error) {
//         console.error("Failed to end reservation.", error);
//         toast.error(error.message);
//     }
//   };

//   const handleUnpair = async () => { // New unpair function
//     try {
//       if (!currentUser) return;
//       const idToken = await currentUser.getIdToken();
//       await VehicleDataService.unpairScooter(vehicleData.id, idToken);
//       toast.success("Scooter unpaired successfully!");
//       navigate('/map'); // Or wherever you want to redirect
//     } catch (error) {
//         console.error("Failed to unpair scooter.", error);
//         toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (vehicleId) {
//           fetchVehicleData(vehicleId);
//         } else {
//             if (!currentUser) return;
//             const idToken = await currentUser.getIdToken();
//           const userData = await VehicleDataService.getTheCurrentUserData(idToken);
//           const activeVehicle = userData.activeVehicle;
//           if (!activeVehicle) {
//             setError("No active vehicle found");
//             toast.error("No active vehicle found");
//             return;
//           }
//           fetchVehicleData(activeVehicle);
//         }
//       } catch (err) {
//         setError(err.message);
//         toast.error(err.message);
//       }
//     };
//     fetchData();

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error("Geolocation error:", error.message); // Log the error
//           setLocationError("Could not get your location.");
//           toast.error("Could not get your location.");
//         }
//       );
//     } else {
//       setLocationError("Geolocation is not supported by your browser.");
//       toast.error("Geolocation is not supported by your browser.");
//     }
//   }, [vehicleId,currentUser]);

//   if (loading && !vehicleData) {
//     return <LoadingSpinner size="large" />;
//   }

//   if (error) {
//     return <ErrorAlert message={error} />;
//   }

//   if (locationError) {
//     return <ErrorAlert message={locationError} />;
//   }

//   if(!vehicleData){
//     return <div>No active vehicle found.</div>
//   }

//   const center = userLocation || vehicleData?.location || { lat: 0, lng: 0 };

//   const getBatteryColor = (soc) => {
//     if (soc > 70) return "#4CAF50"; // Green for high battery
//     if (soc > 30) return "#FFA726"; // Orange for medium battery
//     return "#F44336"; // Red for low battery
//   };

//   return (
//     <div className={styles.enhancedDashboard}>
//       <div className={styles.controlPanelButtons}>
//         <button
//           className={styles.turnOnBtn}
//           onClick={() => {
//             if (vehicleData?.id) {
//               togglePowerStatus( "ON");
//             } else {
//               setError("Vehicle ID is missing for Turn On");
//               toast.error("Vehicle ID is missing for Turn On");
//             }
//           }}
//         >
//           Turn On
//         </button>
//         <button
//           className={styles.turnOffBtn}
//           onClick={() => {
//             if (vehicleData?.id) {
//               togglePowerStatus("OFF");
//             } else {
//               setError("Vehicle ID is missing for Turn Off");
//               toast.error("Vehicle ID is missing for Turn Off");
//             }
//           }}
//         >
//           Turn Off
//         </button>
//         <button
//           className={styles.endReservationBtn}
//           onClick={handleReservation}
//           disabled={!vehicleData?.rented}
//         >
//           End Reservation
//         </button>
//         <button // New Unpair button
//           className={styles.endReservationBtn}
//           onClick={handleUnpair}
//           disabled={!vehicleData?.userId || vehicleData?.userId !== currentUser?.uid}
//         >
//           Unpair Scooter
//         </button>
//       </div>

//       <div className={styles.dashboardGrid}>
//         <div className={styles.infoPanel}>
//           <h2>Scooter Information</h2>
//           <div className={styles.infoGrid}>
//             {/* Battery Card - Enhanced with SOC data */}
//             <div className={styles.infoCard}>
//               <h3>Battery State</h3>
//               <div className={styles.batteryIndicator}>
//                 <div
//                   className={styles.batteryLevel}
//                   style={{
//                     width: `${vehicleData?.soc || 0}%`,
//                     backgroundColor: getBatteryColor(vehicleData?.soc || 0),
//                   }}
//                 />
//                 <span className={styles.batteryPercentage}>
//                   SOC: {vehicleData?.soc || 0}%
//                 </span>
//               </div>
//             </div>

//             {/* State of Charge Card */}
//             <div className={styles.infoCard}>
//               <h3>State of Charge</h3>
//               <p className={styles.socValue}>{vehicleData?.soc || 0}%</p>
//               <p className={styles.socStatus}>
//                 {vehicleData?.soc >= 90
//                   ? "Fully Charged"
//                   : vehicleData?.soc >= 70
//                   ? "Good"
//                   : vehicleData?.soc >= 30
//                   ? "Moderate"
//                   : "Low Battery"}
//               </p>
//             </div>

//             {/* Range Card */}
//             <div className={styles.infoCard}>
//               <h3>Estimated Range</h3>
//               <p>{vehicleData?.estimatedRange || 0} km</p>
//             </div>

//             {/* Odometer Card */}
//             <div className={styles.infoCard}>
//               <h3>Odometer</h3>
//               <p>{vehicleData?.odometer || 0} km</p>
//             </div>

//             {/* Power Status Card */}
//             <div className={styles.infoCard}>
//               <h3>Power Status</h3>
//               <p>{vehicleData?.poweredOn ? "ON" : "OFF"}</p>
//             </div>

//             {/* Location Card */}
//             <div className={styles.infoCard}>
//               <h3>Current Location</h3>
//               <p>
//                 {vehicleData?.location
//                   ? `${vehicleData.location.lat.toFixed(
//                       4
//                     )}, ${vehicleData.location.lng.toFixed(4)}`
//                   : "Unknown"}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className={styles.mapPanel}>
//           <h1>Vehicle Map</h1>
//           {isLoaded ? (
//             <GoogleMap
//               mapContainerStyle={containerStyle}
//               center={center}
//               zoom={15}
//             >
//               <Marker position={center} />
//             </GoogleMap>
//           ) : (
//             <div>Loading Map...</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

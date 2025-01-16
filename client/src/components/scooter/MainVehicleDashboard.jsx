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
  testReservation
} from "../../services/vehicleDataServices";
import styles from "../../styles/scooterDashb.module.css";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Marker } from "@googlemaps/adv-markers-utils";

import { useParams } from "react-router-dom";
import { auth } from "../../services/firebase";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places"];

//Comment:Please uncomment this while testing, for some unknown software issue fetching the env variables from .env file was not working
// const VITE_GOOGLE_MAPS_API_KEY = "AIzaSyASkpletaqUH-NHlo1avkOAijauzoDf09A"

export const VehicleDashboard = () => {
  const { vehicleId } = useParams();
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPairingCode, setShowPairingCode] = useState(false);
  const [showCost, setShowCost] = useState(null);
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

  useEffect(() => {
    console.log("Rendering Vehicle Dashboard");
  }, []);

  //imitializing the map view
  useEffect(() => {
    if (isLoaded && userLocation) {
      const initMap = async () => {

        const mapDiv = document.getElementById("map");
      
        if (!mapDiv) {
          console.error("Map container not found!");
          return;
        }
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary(
          "marker"
        );

        const map = new Map(document.getElementById("map"), {
          center: userLocation,
          zoom: 14,
          mapId: "4504f8b37365c3d0",
        });

        new AdvancedMarkerElement({
          map,
          position: userLocation,
        });
      };

      const timeoutId = setTimeout(initMap, 5000); 
      return () => clearTimeout(timeoutId);

    }
  }, [isLoaded, userLocation]);

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
      {successMessage && (
        <div className={styles.successAlert}>
          <strong className={styles.successTitle}>Success! </strong>
          <span className={styles.successMessage}>{successMessage}</span>
        </div>
      )}
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
          <div id="map" style={{ width: "100%", height: "700px" }}></div>
        </div>

        {vehicleData && (
          <div className={styles.pairingCostSection}>
            {vehicleData.pairingCode && (
              <div className={styles.pairingCodeDisplay}>
                <h2>Your New Pairing Code:</h2>
                <p>{vehicleData.pairingCode}</p>
                <p>Use this code for your next ride!</p>
              </div>
            )}
            {vehicleData.cost && (
              <div className={styles.costDisplay}>
                <h2>Cost of Your Tour:</h2>
                <p>{vehicleData.cost.toFixed(2)}€</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

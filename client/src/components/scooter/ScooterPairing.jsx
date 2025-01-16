import React, { useState, useEffect } from "react";
import { pairScooter, getTheCurrentUserData } from "../../services/vehicleDataServices";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const ScooterPairing = () => {
  const [pairingCode, setPairingCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  const navigate = useNavigate(); // Initialize the navigate hook

  // Check user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserData();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data and check for active vehicle
  const fetchUserData = async () => {
    try {
      const userData = await getTheCurrentUserData();
      if (userData.activeVehicle) {
        setActiveVehicle(userData.activeVehicle);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    }
  };

  // Redirect if user has an active vehicle
  useEffect(() => {
    if (activeVehicle) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);

      const redirectTimer = setTimeout(() => {
        navigate(`/scooter/${activeVehicle}`); // Use navigate instead of window.location
      }, 4000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimer);
      };
    }
  }, [activeVehicle, navigate]); // Add navigate to dependencies

  const handlePairing = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("Please ensure you are fully logged in before pairing.");
      }

      const userData = await getTheCurrentUserData();
      if (userData.activeVehicle) {
        setActiveVehicle(userData.activeVehicle); // Set active vehicle to trigger redirect
        return;
      }

      console.log("Attempting to pair with code:", pairingCode);
      const vehicleId = await pairScooter(pairingCode);
      console.log("Pairing successful. Vehicle ID:", vehicleId);
      setActiveVehicle(vehicleId);
    } catch (err) {
      console.error("Pairing failed:", err.message);
      setError(err.message || "Pairing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to pair a scooter.</div>;
  }

  if (activeVehicle) {
    return (
      <div>
        <h2>You already have a paired scooter</h2>
        <p>Redirecting to your scooter in {redirectCountdown} seconds...</p>
        <button onClick={() => navigate(`/scooter/${activeVehicle}`)}>
          Go to Scooter Now
        </button>
      </div>
    );
  }

  return (
    <div className="pairing-container">
      <h2>Pair Your Scooter</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handlePairing}>
        <input
          type="text"
          placeholder="Enter pairing code"
          value={pairingCode}
          onChange={(e) => setPairingCode(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Pairing..." : "Pair Scooter"}
        </button>
      </form>
    </div>
  );
};
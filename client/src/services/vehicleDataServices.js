import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import axios from "axios";

const API_URL = "http://localhost:8080";

export const pairScooter = async (pairingCode) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be logged in to pair a scooter");
    }

    const idToken = await user.getIdToken();
    const response = await axios.post(
      "http://localhost:8080/api/vehicles/pair",
      { pairingCode, userId: user.uid },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const vehicleId = response.data;
    await updateActiveVehicle(vehicleId);

    return vehicleId;
  } catch (error) {
    if (
      error.response &&
      error.response.status === 400 &&
      error.response.data === "Invalid pairing code"
    ) {
      throw new Error(
        "This scooter has already been paired or the pairing code is invalid."
      );
    }
    console.error("Error in pairScooter:", error);
    throw error;
  }
};

//this function may be needed when ending the reservation process
export const unpairScooter = async (vehicleId, idToken) => {
  // Implement unpairScooter
  try {
    await axios.put(`${API_URL}/api/vehicles/${vehicleId}/unpair`, null, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  } catch (error) {
    handleError(error,"unpairScooter");
  }
};

export const finishReservation = async (
  vehicleId,
  endLatitude,
  endLongitude,
  idToken
) => {
  try {
    
    if (!idToken) {
      throw new Error("Authentication token is required");
    }

    const response = await axios.put(
      `${API_URL}/reservations/${vehicleId}`,
      null,
      {
        params: { endLatitude, endLongitude },
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    if (response.data) {
      console.log("Reservation finished successfully:", response.data);
      return response.data;
    }
    
    throw new Error("No data received from server");
  } catch (error) {
    console.error("Error in finishReservation:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    handleError(error,"finishReservation");
  }
};

export const sendScooterCommand = async (vehicleId, command) => {
  try {
    const token = localStorage.getItem("authToken");
    console.log(
      "Retrieved token:",
      token ? token.substring(0, 20) + "..." : "No token found"
    );

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(
      "Making request to:",
      `http://localhost:8080/api/vehicles/${vehicleId}/power?command=${command}`
    );
    console.log("Headers:", {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      "Content-Type": "application/json",
    });

    const response = await axios.get(
      `http://localhost:8080/api/vehicles/${vehicleId}/power?command=${command}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Command error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    throw error;
  }
};


export const getTheCurrentUserData = async () => {
  try {
    const user = auth.currentUser;
    console.log("Current User:", user); // Log the user object

    if (!user) throw new Error("No authenticated user found");

    const userRefDoc = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRefDoc);

    if (!userDoc.exists()) {
      await setDoc(userRefDoc, {
        id: user.uid,
        email: user.email,
      });
    }
    console.log("User Doc Snapshot:", userDoc); // Log the document snapshot
    if (!userDoc.exists()) throw new Error("User document not found");
    // setDoc(userRefDoc, { id: user.uid, email: user.email })

    const userData = userDoc.data();
    console.log("Fetched user data:", userData);
    console.log(userData.activeVehicle);
    console.log("Active Vehicle ID:", userData.activeVehicle); // Crucial: Log the activeVehicle value

    if (!userData.activeVehicle) {
      console.log("No active vehicle found for user.");
      return { ...userData, activeVehicle: null }; // Return user data with activeVehicle as null
    } else {
      console.log("Active vehicle id: " + userData.activeVehicle);
    }

    return userData;
  } catch (error) {
    console.error("Error fetching user data", error);
    throw error;
  }
};

export const getTheCurrentVehicleData = async (vehicleId) => {
  try {
    console.log("Fetching data for vehicle ID:", vehicleId);
    const vehicleDocRef = doc(db, "vehicles", vehicleId);
    const vehicleDoc = await getDoc(vehicleDocRef);
    if (!vehicleDoc.exists()) {
      throw new Error("Vehicle document not found");
    }

    const vehicleData = vehicleDoc.data();

    console.log("VehicleId: " + vehicleId);

    console.log("Vehicle data from Firestore:", vehicleData);

    if (!vehicleData.location.latitude || !vehicleData.longitude) {
      console.warn("the current Vehicle location data is missing in Firestore!");
    }


    return vehicleData;
  } catch (error) {
    console.error("Error fetching the vehicle data", error);
    throw error;
  }
};

export const updateActiveVehicle = async (vehicleId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("The user is not logged in");

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { activeVehicle: vehicleId });

    console.log(
      "Active vehicle updated successfully for user",
      user.uid,
      "Vehicle ID:",
      vehicleId
    );
    return true;
  } catch (error) {
    console.error("Error in updateActiveVehicle:", error);
    throw error;
  }
};

export const getVehicleStatus = async (vehicleId) => {
  try {
    const vehicleData = await getTheCurrentVehicleData(vehicleId);
    console.log("Raw vehicle data:", vehicleData);
    const location = vehicleData.location || { lat: 0, lng: 0 };
    console.log("Processed location:", location); // Debug log

    return {
      vehicleId: vehicleId,
      estimatedRange: vehicleData.estimatedRange || 0,
      location: {
        lat: location.latitude || 0,
        lng: location.longitude || 0
      },
      odometer: vehicleData.odometer || 0,
      poweredOn: vehicleData.poweredOn || false,
      soc: vehicleData.soc || 0, 
    };
  } catch (error) {
    console.error("Error fetching vehicle status", error);
    throw error;
  }
};

export const handleError = (error, operationName) => {
  // Added operationName for better logging
  console.error(`Error in ${operationName}:`, error);
  if (error.response) {
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
    console.error("Response headers:", error.response.headers);
  } else if (error.request) {
    console.error("Request:", error.request);
  } else {
    console.error("Error message:", error.message);
  }
  throw error;
};


export const getReservationIdFromStorage = async(idToken)=>{
  try {
    const response = await axios.get(`${API_URL}/reservations/active`,{
      headers:{
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      }
    })
    if(!response.data || !response.data.id){
      console.error("No reservation id found")
      return null
    }

    return response.data.id
  } catch (error) {
    console.error("Error fetching active reservation", error.message,);
    return null
  }
}

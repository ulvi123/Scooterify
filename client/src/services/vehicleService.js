// vehicleService.js
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from '../services/firebase';

export const pairScooter = async (pairingCode, userId) => {
  try {
    // Query for the vehicle with the given pairing code
    const vehiclesRef = collection(db, "vehicles");
    const q = query(vehiclesRef, where("pairingCode", "==", pairingCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid pairing code");
    }

    const vehicleDoc = querySnapshot.docs[0];
    const vehicleId = vehicleDoc.id;

    // Update the vehicle document to mark it as paired
    await updateDoc(doc(db, "vehicles", vehicleId), {
      pairedUserId: userId,
      pairingCode: null // Clear the pairing code after successful pairing
    });

    console.log(`Vehicle ${vehicleId} paired successfully with user ${userId}`);
    return vehicleId;
  } catch (error) {
    console.error("Error pairing scooter:", error);
    throw error;
  }
};
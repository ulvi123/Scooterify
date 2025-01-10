// import React, { useState,useEffect, useInsertionEffect} from "react";
// import { auth } from "../../services/firebase";
// import { onAuthStateChanged } from 'firebase/auth';
// import createApiClient from "../../services/api";

// export const ScooterPairing = ({ onPairSuccess }) => {
//   const [pairingCode, setPairingCode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [user,setUser] = useState(null)

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//         setUser(currentUser);
//     });

//     return () => unsubscribe();
// }, []);

// //code to be implemented after the backend is built

// //   const handlePairing = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       if(!user){
// //         throw new Error("No user is signed in")
// //       }
// //       const idToken = await user.getIdToken();
// //       const apiClient = createApiClient(idToken);
// //       await apiClient.pairScooter(pairingCode);
// //       onPairSuccess?.();
// //     } catch (error) {
// //       setError(error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };


// const handlePairing = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//         // Simulate API call
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         console.log(`Pairing code submitted: ${pairingCode}`);
//         onPairSuccess?.();
//     } catch (error) {
//         setError("Simulated error: Pairing failed");
//     } finally {
//         setLoading(false);
//     }
// }

//   return (
//     <div className="pairing-container">
//       <h2>Pair Your Scooter</h2>
//       {error && <div className="error">{error}</div>}
//       <form onSubmit={handlePairing}>
//         <input
//           type="text"
//           placeholder="Enter pairing code"
//           value={pairingCode}
//           onChange={(e) => setPairingCode(e.target.value)}
//           disabled={loading}
//           required
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Pairing..." : "Pair Scooter"}
//         </button>
//       </form>
//     </div>
//   );
// };




//simulated version of scooter pairing before I have the backend


import React, { useState } from "react";

export const ScooterPairing = ({ onPairSuccess }) => {
  const [pairingCode, setPairingCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePairing = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Pairing code submitted: ${pairingCode}`);
      onPairSuccess(pairingCode); // Pass the pairing code to the parent
    } catch (error) {
      setError("Simulated error: Pairing failed");
    } finally {
      setLoading(false);
    }
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
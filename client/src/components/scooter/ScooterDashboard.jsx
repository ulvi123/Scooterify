// // import React, { useState, useEffect } from "react";
// // import { auth } from "../../services/firebase";
// // import { db } from "../../services/firebase";
// // import { doc, onSnapshot } from "firebase/firestore";
// // import  ScooterMap  from '../maps/ScooterMap';
// // import { LoadingSpinner } from '../utils/LoadSpinner';
// // import { ErrorAlert } from '../utils/ErrorsAlerting';
// // import { useLocation } from '../../hooks/useLocation';

// // export const ScooterDashboard = ({ vehicleId }) => {
// //   const [scooterData, setScooterData] = useState(null);
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const { location: userLocation, error: locationError } = useLocation();

// //   useEffect(() => {
// //     if (!vehicleId) return;
// //     setLoading(true);

// //     const unsubscribe = onSnapshot(
// //       doc(db, "vehicles", vehicleId),
// //       (doc) => {
// //         if (doc.exists()) {
// //           setScooterData(doc.data());
// //           setLoading(false);
// //         } else {
// //           setScooterData(null);
// //           setError("Scooter not found");
// //           setLoading(false);
// //         }
// //       },
// //       (error) => {
// //         setError("Failed to load scooter data");
// //         console.error(error);
// //       }
// //     );

// //     return () => unsubscribe();
// //   }, [vehicleId]);

// //   const sendCommand = async (command) => {
// //     setLoading(true);
// //     try {
// //       const token = await auth.currentUser.getIdToken();
// //       const response = await fetch(
// //         "https://europe-west3-coscooter-eu-staging.cloudfunctions.net/send-commands",
// //         {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             command,
// //             vehicleId,
// //           }),
// //           params: {
// //             apiKey: token,
// //           },
// //         }
// //       );

// //       if (!response.ok) throw new Error("Command failed");
// //     } catch (error) {
// //       setError(error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="dashboard-loading">
// //         <LoadingSpinner size="large" />
// //         <p>Loading scooter data...</p>
// //       </div>
// //     );
// //   }

// //   if (!scooterData) return <div>Loading scooter data...</div>;

// //   return (
// //     <div className="enhanced-dashboard">
// //       {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
// //       {locationError && <ErrorAlert message={locationError} />}

// //       <div className="dashboard-grid">
// //         <div className="control-panel">
// //           <h2>Scooter Controls</h2>
// //           <div className="controls">
// //             <button
// //               className={`control-button ${scooterData?.poweredOn ? 'active' : ''}`}
// //               onClick={() => handleCommand('START')}
// //               disabled={loading}
// //             >
// //               {loading ? <LoadingSpinner size="small" /> : 'Turn ON'}
// //             </button>
// //             <button
// //               className={`control-button ${!scooterData?.poweredOn ? 'active' : ''}`}
// //               onClick={() => handleCommand('STOP')}
// //               disabled={loading}
// //             >
// //               {loading ? <LoadingSpinner size="small" /> : 'Turn OFF'}
// //             </button>
// //           </div>
// //         </div>

// //         <div className="info-panel">
// //           <div className="info-grid">
// //             <div className="info-card">
// //               <h3>Battery</h3>
// //               <div className="battery-indicator">
// //                 <div 
// //                   className="battery-level" 
// //                   style={{ width: `${scooterData?.soc}%` }}
// //                 />
// //                 <span>{scooterData?.soc}%</span>
// //               </div>
// //             </div>

// //             <div className="info-card">
// //               <h3>Range</h3>
// //               <p>{scooterData?.estimatedRange} km</p>
// //             </div>

// //             <div className="info-card">
// //               <h3>Odometer</h3>
// //               <p>{scooterData?.odometer} km</p>
// //             </div>

// //             <div className="info-card">
// //               <h3>Lock Status</h3>
// //               <p className={scooterData?.locked ? 'status-locked' : 'status-unlocked'}>
// //                 {scooterData?.locked ? 'Locked' : 'Unlocked'}
// //               </p>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="map-panel">
// //           <h2>Location</h2>
// //           <ScooterMap 
// //             scooterLocation={scooterData?.location}
// //             userLocation={userLocation}
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };





// //simulated version

// import React, { useState, useEffect } from "react";
// import { LoadingSpinner } from '../utils/LoadSpinner';
// import { ErrorAlert } from '../utils/ErrorsAlerting';

// // Simulated ScooterMap component
// const ScooterMap = ({ scooterLocation, userLocation }) => (
//   <div style={{ backgroundColor: '#e0e0e0', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//     Simulated Map
//   </div>
// );

// export const ScooterDashboard = ({ vehicleId }) => {
//   const [scooterData, setScooterData] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [userLocation, setUserLocation] = useState(null);

//   useEffect(() => {
//     // Simulate loading scooter data
//     setTimeout(() => {
//       setScooterData({
//         poweredOn: true,
//         soc: 75,
//         estimatedRange: 30,
//         odometer: 150,
//         locked: false,
//         location: { lat: 40.7128, lng: -74.0060 }
//       });
//       setUserLocation({ lat: 40.7129, lng: -74.0061 });
//       setLoading(false);
//     }, 1500);
//   }, [vehicleId]);

//   const handleCommand = (command) => {
//     setLoading(true);
//     // Simulate sending command
//     setTimeout(() => {
//       if (command === 'START') {
//         setScooterData(prev => ({ ...prev, poweredOn: true }));
//       } else if (command === 'STOP') {
//         setScooterData(prev => ({ ...prev, poweredOn: false }));
//       }
//       setLoading(false);
//     }, 1000);
//   };

//   if (loading && !scooterData) {
//     return (
//       <div className="dashboard-loading">
//         <LoadingSpinner size="large" />
//         <p>Loading scooter data...</p>
//       </div>
//     );
//   }

//   if (!scooterData) return <div>No scooter data available.</div>;

//   return (
//     <div className="enhanced-dashboard">
//       {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

//       <div className="dashboard-grid">
//         <div className="control-panel">
//           <h2>Scooter Controls</h2>
//           <div className="controls">
//             <button
//               className={`control-button ${scooterData.poweredOn ? 'active' : ''}`}
//               onClick={() => handleCommand('START')}
//               disabled={loading}
//             >
//               {loading ? <LoadingSpinner size="small" /> : 'Turn ON'}
//             </button>
//             <button
//               className={`control-button ${!scooterData.poweredOn ? 'active' : ''}`}
//               onClick={() => handleCommand('STOP')}
//               disabled={loading}
//             >
//               {loading ? <LoadingSpinner size="small" /> : 'Turn OFF'}
//             </button>
//           </div>
//         </div>

//         <div className="info-panel">
//           <div className="info-grid">
//             <div className="info-card">
//               <h3>Battery</h3>
//               <div className="battery-indicator">
//                 <div 
//                   className="battery-level" 
//                   style={{ width: `${scooterData.soc}%` }}
//                 />
//                 <span>{scooterData.soc}%</span>
//               </div>
//             </div>

//             <div className="info-card">
//               <h3>Range</h3>
//               <p>{scooterData.estimatedRange} km</p>
//             </div>

//             <div className="info-card">
//               <h3>Odometer</h3>
//               <p>{scooterData.odometer} km</p>
//             </div>

//             <div className="info-card">
//               <h3>Lock Status</h3>
//               <p className={scooterData.locked ? 'status-locked' : 'status-unlocked'}>
//                 {scooterData.locked ? 'Locked' : 'Unlocked'}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="map-panel">
//           <h2>Location</h2>
//           <ScooterMap 
//             scooterLocation={scooterData.location}
//             userLocation={userLocation}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

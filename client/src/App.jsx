// import React, { useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Navigate,
// } from "react-router-dom";
// import { auth } from "./services/firebase";
// import { Login } from "./components/auth/Login";
// import { Register } from "./components/auth/Register";
// import { ScooterPairing } from "./components/scooter/ScooterPairing";
// // import { ScooterDashboard } from "./components/scooter/ScooterDashboard";
// import "./index.css";
// import { VehicleDashboard } from "./components/scooter/MainVehicleDashboard";

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     console.log("Setting up auth listener");
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       console.log("Auth state changed:", user?.email); // Debug log
//       setUser(user);
//     });

//     const currentUser = auth.currentUser;
//     console.log("Current auth state:", currentUser?.email);

//     return () => unsubscribe();
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   if (!user) return <Navigate to="/login" />;

//   return children;
// };

// function App() {
//   const [user, setUser] = useState(null);
//   const [activeVehicle, setActiveVehicle] = useState(null);
//   const [showRegister, setShowRegister] = useState(false);

//   useEffect(() => {
//     console.log("Setting up auth listener");
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       console.log("Auth state changed:", user?.email); // Debug log
//       setUser(user);
//     });

//     // Debug log current auth state
//     const currentUser = auth.currentUser;
//     console.log("Current auth state:", currentUser?.email);

//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await auth.signOut();
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   // Debug log before conditional render
//   console.log("Rendering App with user:", user?.email);

//   if (!user) {
//     console.log("Showing auth screen because no user"); // Debug log
//     return (
//       <div className="auth-wrapper">
//         {showRegister ? (
//           <Register />
//         ) : (
//           <Login setUser={setUser} /> // Pass setUser to Login component
//         )}
//         <button onClick={() => setShowRegister(!showRegister)}>
//           {showRegister ? "Switch to Login" : "Switch to Register"}
//         </button>
//       </div>
//     );
//   }

//   console.log("Showing main app screen"); // Debug log
//   return (
//     <div className="app">
//       <header>
//         <h1>Tuul Scooter App</h1>
//         <button onClick={handleLogout}>Logout</button>
//       </header>

//       <main>
//         {/* {!activeVehicle ? (
//           <ScooterPairing onPairSuccess={(vehicleId) => setActiveVehicle(vehicleId)} />
//         ) : (
//           <ScooterDashboard vehicleId={activeVehicle} />
//         )}

//         <VehicleDashboard/> */}

//         {!activeVehicle ? (
//           <ScooterPairing
//             onPairSuccess={(vehicleId) => setActiveVehicle(vehicleId)}
//           />
//         ) : (
//           <VehicleDashboard vehicleId={activeVehicle} hasControls={true} /> // Use combined component with controls
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { auth } from "./services/firebase";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ScooterPairing } from "./components/scooter/ScooterPairing";
import { VehicleDashboard } from "./components/scooter/MainVehicleDashboard";
import "./index.css";

// Functional component to handle Link logic
function AuthSwitch() {
  const location = useLocation();

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background-color 0.3s ease",
  };

  const buttonHoverStyle = {
    backgroundColor: "#0056b3",
  };

  const [isHovering, setIsHovering] = React.useState(false);

  return (
    <Link
      to={location.pathname === "/register" ? "/login" : "/register"}
      style={{ ...buttonStyle, ...(isHovering ? buttonHoverStyle : {}) }} // Apply styles
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {location.pathname === "/register"
        ? "Switch to Login"
        : "Switch to Register"}
    </Link>
  );
}

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Get and store the token when user is authenticated
        try {
          const token = await user.getIdToken();
          localStorage.setItem("authToken", token);
          console.log("Token stored successfully");
        } catch (error) {
          console.error("Error getting token:", error);
        }
      } else {
        // Clear token when user is not authenticated
        localStorage.removeItem("authToken");
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get and store token when auth state changes
          const token = await user.getIdToken(true); // Force token refresh
          localStorage.setItem("authToken", token);
          console.log("Token refreshed and stored");

          // Set up token refresh
          const tokenRefreshInterval = setInterval(async () => {
            try {
              const newToken = await user.getIdToken(true);
              localStorage.setItem("authToken", newToken);
              console.log("Token refreshed");
            } catch (error) {
              console.error("Token refresh failed:", error);
            }
          }, 55 * 60 * 1000); // Refresh token every 55 minutes

          setUser(user);

          // Clean up interval on unmount
          return () => clearInterval(tokenRefreshInterval);
        } catch (error) {
          console.error("Error getting initial token:", error);
        }
      } else {
        localStorage.removeItem("authToken");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('authToken'); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Tuul Scooter App</h1>
          {user && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </header>

        <main className="app-main">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" /> : <Register />}
            />

            <Route
              path="/scooter/:vehicleId"
              element={
                <ProtectedRoute>
                  <VehicleDashboard hasControls={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pair"
              element={
                <ProtectedRoute>
                  <ScooterPairing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ScooterPairing />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {!user && (
          <div className="auth-wrapper">
            <AuthSwitch /> {/* Use the AuthSwitch component */}
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

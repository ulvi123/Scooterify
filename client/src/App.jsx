import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ScooterPairing } from './components/scooter/ScooterPairing';
import { ScooterDashboard } from './components/scooter/ScooterDashboard';
import "./index.css"

function App() {
  const [user, setUser] = useState(null);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="auth-wrapper">
        {showRegister ? (
          <Register />
        ) : (
          <Login />
        )}
        <button onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Tuul Scooter App</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main>
        {!activeVehicle ? (
          <ScooterPairing onPairSuccess={(vehicleId) => setActiveVehicle(vehicleId)} />
        ) : (
          <ScooterDashboard vehicleId={activeVehicle} />
        )}
      </main>
    </div>
  );
}

export default App;
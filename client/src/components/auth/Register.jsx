import React, { useState } from "react";
import { auth } from "../../services/firebase";
import { registerUser } from "../../services/firebase"; // Import registerUser


export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    try {
      const additionalData = { name };
      const { user, idToken, message } = await registerUser(email, password, additionalData);
      
      if (user) {
        console.log("Registered user:", user);
        localStorage.setItem("idToken", idToken);
        // TODO: Redirect to dashboard or home page
        // For example: history.push('/dashboard');
      } else {
        setError(message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "An unexpected error occurred during registration");
    }
  };

  return (
    <div className="authentication-container">
      <h1>Create Account</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

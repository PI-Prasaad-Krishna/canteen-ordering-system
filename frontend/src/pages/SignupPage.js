import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Send role as "student" (default role defined in the schema)
      await axios.post("http://localhost:5000/signup", {
        name,
        email,
        password,
        role: "student",  // Role can be explicitly set as "student"
      });

      alert("Signup successful! You can now log in.");
      navigate("/login");  // Redirect to login after signup
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Error signing up. Try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Signup</h1>
      <form onSubmit={handleSignup}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default SignupPage;

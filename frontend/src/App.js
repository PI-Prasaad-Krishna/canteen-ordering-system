import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";

function App() {
  // ✅ Load cart from localStorage when app starts
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });

  // ✅ Load authentication status from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // ✅ Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Add item to cart
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // ✅ Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId));
  };

  // ✅ Logout function: clears token & cart, redirects to login
  const handleLogout = () => {
    localStorage.removeItem("token");  // Remove JWT token
    localStorage.removeItem("cart");   // Clear cart
    setIsAuthenticated(false);
    setCart([]);  // Clear cart state
    window.location.href = "/login";  // Redirect to login
  };

  // ✅ Protecting routes that require authentication (e.g. /order/:orderId)
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage addToCart={addToCart} />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
        <Route path="/order/:orderId" element={<ProtectedRoute element={<OrderStatusPage />} />} />
      </Routes>
    </Router>
  );
}

export default App;
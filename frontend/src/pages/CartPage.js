import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

function CartPage({ cart, removeFromCart }) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // ✅ Load token when page renders
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const placeOrder = async () => {
    setLoading(true);

    // ✅ Ensure token is read properly
    const currentToken = localStorage.getItem("token") || token;

    if (!currentToken) {
      alert("You must be logged in to place an order.");
      navigate("/login");
      setLoading(false);
      return;
    }

    const orderData = {
      canteenId: "1234",
      items: cart.map((item) => ({
        foodId: item._id,
        quantity: item.quantity || 1,
        price: item.price,
        counterId: item.counterId || "default_counter",
      })),
      totalPrice: cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/order",
        orderData,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      if (response.data.orderId) {
        navigate(`/order/${response.data.orderId}`);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item._id}>
              <h2>{item.name}</h2>
              <p>₹{item.price}</p>
              <button onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          ))}
          <button onClick={placeOrder} disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
}

export default CartPage;

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

function CartPage({ cart, removeFromCart }) {
  const [loading, setLoading] = useState(false); // State to track if the order is being placed
  const navigate = useNavigate();

  const placeOrder = async () => {
    setLoading(true); // Set loading to true when the order starts
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");

      // If there's no token, redirect to login page
      if (!token) {
        alert("You must be logged in to place an order.");
        navigate("/login");
        return;
      }

      // Make the API call to place the order
      const response = await axios.post(
        "http://localhost:5000/api/order",  // API endpoint to place the order
        {
          canteenId: "1234",
          items: cart.map((item) => ({ _id: item._id, quantity: 1 })),  // Preparing order data
        },
        {
          headers: { Authorization: `Bearer ${token}` },  // Pass the token in the headers
        }
      );

      // Order placed successfully, navigate to order status page
      navigate(`/order/${response.data.orderId}`);
      // Optionally clear the cart after placing the order
      // clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false); // Reset loading state after the request is finished
    }
  };

  // Optionally clear the cart
  const clearCart = () => {
    // Call a function to clear the cart in the parent component
    // For example: removeFromCart(item._id) can be used to clear the items from the cart.
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

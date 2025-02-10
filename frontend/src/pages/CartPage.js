import { useNavigate } from "react-router-dom";
import axios from "axios";

function CartPage({ cart, removeFromCart }) {
  const navigate = useNavigate();

  const placeOrder = async () => {
    try {
      // ✅ Get token from localStorage
      const token = localStorage.getItem("token");

      // ✅ Check if token exists before making the request
      if (!token) {
        console.error("No token found. Please log in.");
        alert("You need to log in to place an order.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/order",
        {
          canteenId: "1234",
          items: cart.map((item) => ({ _id: item._id, quantity: 1 })),
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Send token in headers
        }
      );

      navigate(`/order/${response.data.orderId}`); // Redirect to order page
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item._id} style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h2>{item.name}</h2>
              <p>₹{item.price}</p>
              <button onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          ))}
          <button style={{ width: "100%", marginTop: "10px" }} onClick={placeOrder}>
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}

export default CartPage;

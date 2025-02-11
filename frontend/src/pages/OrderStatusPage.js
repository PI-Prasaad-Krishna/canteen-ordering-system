import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function OrderStatusPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view your order.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrder(response.data);
      } catch (err) {
        console.error("Error fetching order:", err.response?.data || err.message);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div>
      <h1>Order Status</h1>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>

      <h2>Items Ordered:</h2>
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>
            <strong>{item.foodId.name}</strong> - {item.quantity} x ₹{item.price}  
            <br /><strong>Counter ID:</strong> {item.counterId}
          </li>
        ))}
      </ul>

      <h2>OTPs for Collection:</h2>
      {order.otp.length > 0 ? (
        <ul>
          {order.otp.map((otpEntry, index) => (
            <li key={index}>
              <strong>Counter {otpEntry.counterId}:</strong> {otpEntry.otpCode}
            </li>
          ))}
        </ul>
      ) : (
        <p>No OTPs generated.</p>
      )}
    </div>
  );
}

export default OrderStatusPage;

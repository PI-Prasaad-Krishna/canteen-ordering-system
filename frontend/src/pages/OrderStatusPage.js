import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function OrderStatusPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/order/${orderId}`)
      .then((response) => setOrder(response.data))
      .catch((error) => console.error("Error fetching order status:", error));
  }, [orderId]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Order Status</h1>
      {order ? (
        <div>
          <p>Order ID: {order._id}</p>
          <p>Status: {order.status}</p>
          <p>OTP for verification: <strong>{order.otp}</strong></p>
        </div>
      ) : (
        <p>Loading order details...</p>
      )}
    </div>
  );
}

export default OrderStatusPage;

import { useEffect, useState } from "react";
import axios from "axios";

function HomePage({ addToCart }) {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/menu")  // Fetch from backend
      .then((response) => setMenu(response.data))
      .catch((error) => console.error("Error fetching menu:", error));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Menu</h1>
      {menu.length === 0 ? <p>Loading menu...</p> : (
        menu.map((item) => (
          <div key={item._id} style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px"
          }}>
            <h2>{item.name}</h2>
            <p>₹{item.price}</p>
            <button onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))
      )}
    </div>
  );
}

export default HomePage;
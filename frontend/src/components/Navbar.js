import { Link } from "react-router-dom";
import "../index.css"; // Import styles

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/cart">Cart</Link>
    </nav>
  );
}

export default Navbar;

import { Link } from "react-router-dom";

function Navbar({ isAuthenticated, handleLogout }) {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/cart">Cart</Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <button onClick={handleLogout}>Login</button>
            </li>
            <li>
              <Link to="/order">Order</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Signup</Link>  {/* ✅ Show Signup link */}
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
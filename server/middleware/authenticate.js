const jwt = require('jsonwebtoken');

// Middleware to authenticate the user by verifying the JWT token
const authenticate = (req, res, next) => {
  // Get the token from the Authorization header (Format: Bearer <token>)
  const token = req.header('Authorization');

  // If no token is provided, send an error
  if (!token) {
    console.log("❌ No token provided");  // Debugging log
    return res.status(401).json({ message: 'Authorization required' });
  }

  try {
    // Get the secret key from environment variables
    const secretKey = process.env.JWT_SECRET_KEY;

    // Ensure the secret key is defined
    if (!secretKey) {
      console.error("❌ JWT_SECRET_KEY is not defined in environment variables");
      return res.status(500).json({ message: "Internal Server Error: Missing JWT secret key" });
    }

    // Extract the token part from the 'Bearer <token>' format
    const tokenValue = token.split(' ')[1];  // Extract token after 'Bearer'

    console.log("🔹 Token from Authorization Header:", tokenValue);  // Debugging log

    // Verify the token with the secret key
    const decoded = jwt.verify(tokenValue, secretKey);

    // Log the decoded user information
    console.log("✅ Decoded User:", decoded);  // Debugging log

    // Attach the decoded user info to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token verification fails, log the error and send a response
    console.error("❌ Token verification error:", error);  // Debugging log

    // Handle specific token errors
    if (error.name === 'TokenExpiredError') {
      // Handle token expiry specifically
      return res.status(401).json({ message: 'Token has expired, please log in again' });
    }

    if (error.name === 'JsonWebTokenError') {
      // Handle invalid token specifically
      return res.status(401).json({ message: 'Invalid token, please log in again' });
    }

    // Generic error handler for other token-related errors
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
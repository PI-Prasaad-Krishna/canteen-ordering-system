const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization');
  
  // If no token is provided, send an error
  if (!token) {
    console.log("❌ No token provided");  // Debugging log
    return res.status(401).json({ message: 'Authorization required' });
  }

  try {
    // Get the secret key from environment variables
    const secretKey = process.env.JWT_SECRET_KEY;
    
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
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
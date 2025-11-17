// Utility to generate a valid JWT for tests
const jwt = require("jsonwebtoken");
const config = require("../src/config/config");

function generateTestToken(user) {
  // The payload should match what your auth middleware expects
  return jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpire || "7d",
  });
}

module.exports = { generateTestToken };

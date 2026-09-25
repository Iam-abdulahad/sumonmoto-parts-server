const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(user) {
  return jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

module.exports = generateToken;
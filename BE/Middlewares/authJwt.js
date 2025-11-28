const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../Config/jwt.config');

function verifyJWT(req, res, next) {
  const authHeader = req.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookieToken = req.cookies?.token || null;
  const token = bearerToken || cookieToken;

  if (!token) {
    if (req.method === "GET") {
      return res.redirect("/login");
    }
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      clockTolerance: 5
    });
    req.user = decoded;
    // Chống cache cho các trang cần auth để không back về được sau logout
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return next();
  } catch (err) {
    if (req.method === "GET") {
      return res.redirect("/login");
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

module.exports = verifyJWT;

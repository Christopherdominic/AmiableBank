const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(
      new AppError("Authentication required", 401)
    );
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired token", 401)
    );
  }
};

module.exports = authenticate;
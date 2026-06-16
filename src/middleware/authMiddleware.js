const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token)
      return res.status(400).send({ message: "Invalid Token", success: false });

    const decoded = jwt.verify(token, process.env.JWTKEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(400).send({ message: "Invaild Token", success: false });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

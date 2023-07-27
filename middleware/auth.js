const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticateToken = (req, res, next) => {
  const token = req.headers["authentication"];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, jwtData) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    const user = await User.findByPk(jwtData.id);
    req.user = user;
    next();
  });
};

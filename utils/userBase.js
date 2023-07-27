const User = require("../models/User");

exports.getUserDetails = async (id, message) => {
  console.log(id, message);
  const user = await User.findByPk(id);
  return {
    userId: user.id,
    userName: user.userName,
    message: message,
  };
};

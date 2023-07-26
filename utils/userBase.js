const User = require("../models/User");
let onlineUsers = [];

exports.getUserDetails = async (id, message) => {
  console.log(id, message);
  const user = await User.findByPk(id);
  return {
    userId: user.id,
    userName: user.userName,
    message: message,
  };
};

exports.addOnlineUsers = (id, userName) => {
  onlineUsers.push({
    id: id,
    userName: userName,
  });
};

exports.getOnlineUsers = () => {
  return onlineUsers;
};

exports.deleteOnlineUsers = (id) => {
  onlineUsers = onlineUsers.filter((user) => user.id !== id);
};

const Chat = require("../models/chat");

exports.addChat = async (groupchatId, message, userId) => {
  await Chat.create({
    message: message,
    userId: userId,
    groupchatId: groupchatId,
  });
  return;
};

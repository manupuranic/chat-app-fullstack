const ArchiveChat = require("../models/archiveChats");
const Chat = require("../models/chat");

exports.moveChatToArchive = async () => {
  const chats = await Chat.findAll();
  chats.forEach(async (chat) => {
    await ArchiveChat.create({
      message: chat.message,
      userId: chat.userId,
      groupchatId: chat.groupchatId,
    });
  });
  await Chat.destroy({
    where: {},
    truncate: true,
  });
};

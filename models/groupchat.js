const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const GroupChat = sequelize.define("groupchat", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  name: Sequelize.STRING,
});

module.exports = GroupChat;

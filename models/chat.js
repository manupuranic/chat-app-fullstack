const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Chat = sequelize.define("chat", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  message: Sequelize.STRING,
});

module.exports = Chat;

const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Admin = sequelize.define(
  "admin",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
  },
  { timestamps: false }
);

module.exports = Admin;

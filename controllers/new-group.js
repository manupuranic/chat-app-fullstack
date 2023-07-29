const GroupChat = require("../models/groupchat");
const User = require("../models/User");
const sequelize = require("../utils/database");

exports.postNewGroup = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { groupName } = req.body;
  try {
    const gpChat = await GroupChat.create(
      {
        name: groupName,
      },
      { transaction: t }
    );
    await Promise.all([
      gpChat.addUser(req.user.id, { transaction: t }),
      gpChat.createAdmin(
        {
          userId: req.user.id,
        },
        { transaction: t }
      ),
    ]);
    await t.commit();
    res.status(201).json({
      gp: gpChat,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
};

exports.postUpdateGroup = async (req, res, next) => {
  const { groupName } = req.body;
  const gpId = req.query.gpId;
  const t = await sequelize.transaction();
  try {
    await GroupChat.update(
      {
        name: groupName,
      },
      { where: { id: gpId } },
      { transaction: t }
    );
    await t.commit();
    res.json({
      success: true,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "userName", "email", "phone"],
    });
    res.json({
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

exports.addUserToGroup = async (req, res, next) => {
  const t = await sequelize.transaction();
  const userId = req.query.userId;
  const gpId = req.query.gpId;
  try {
    const group = await GroupChat.findByPk(gpId);
    await group.addUser(userId, { transaction: t });
    await t.commit();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

exports.deleteUserFromGroup = async (req, res, next) => {
  const t = await sequelize.transaction();
  const userId = req.query.userId;
  const gpId = req.query.gpId;
  try {
    const group = await GroupChat.findByPk(gpId);
    await group.removeUser(userId, { transaction: t });
    await t.commit();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

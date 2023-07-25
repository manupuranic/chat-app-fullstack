const GroupChat = require("../models/groupchat");
const User = require("../models/User");
const Admin = require("../models/admin");

exports.postNewGroup = async (req, res, next) => {
  const { groupName } = req.body;
  try {
    const gpChat = await GroupChat.create({
      name: groupName,
    });
    await gpChat.addUser(req.user.id);
    res.status(201).json({
      gp: gpChat,
    });
    await gpChat.createAdmin({
      userId: req.user.id,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.postUpdateGroup = async (req, res, next) => {
  const { groupName } = req.body;
  const gpId = req.query.gpId;
  try {
    const response = await GroupChat.update(
      {
        name: groupName,
      },
      { where: { id: gpId } }
    );
    res.json({
      success: true,
    });
  } catch (error) {
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
  const userId = req.query.userId;
  const gpId = req.query.gpId;
  try {
    const group = await GroupChat.findByPk(gpId);
    await group.addUser(userId);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

exports.deleteUserFromGroup = async (req, res, next) => {
  const userId = req.query.userId;
  const gpId = req.query.gpId;
  try {
    const group = await GroupChat.findByPk(gpId);
    await group.removeUser(userId);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

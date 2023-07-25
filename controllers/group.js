const User = require("../models/User");
const Admin = require("../models/admin");
const GroupChat = require("../models/groupchat");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
let members = [];

exports.getGroups = async (req, res, next) => {
  try {
    const groups = await GroupChat.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: User,
          attributes: [],
          where: { id: req.user.id },
        },
      ],
    });
    res.json({
      groups: groups,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

exports.getMembers = async (req, res, next) => {
  const gpId = req.query.gpId;
  try {
    // find all the admin members
    const groupAdminMembers = await GroupChat.findOne({
      where: { id: gpId },
      attributes: [],
      include: [
        {
          model: User,
          attributes: ["id", "userName"],
          include: [
            {
              model: Admin,
              where: { groupchatId: gpId },
            },
          ],
        },
      ],
    });
    // console.log(groupAdminMembers.users);
    const adminUserIds = groupAdminMembers.users.map((user) => {
      return user.id;
    });
    console.log(adminUserIds);
    // find all the other members
    const groupOtherMembers = await GroupChat.findOne({
      where: { id: gpId },
      attributes: [],
      include: [
        {
          model: User,
          attributes: ["id", "userName"],
          where: {
            id: { [Op.notIn]: adminUserIds },
          },
        },
      ],
    });
    const adminmembers = groupAdminMembers.users.map((user) => {
      return {
        id: user.id,
        name: user.userName,
        isAdmin: true,
      };
    });
    let othermembers;
    const otherMembersIds = [];
    if (groupOtherMembers) {
      othermembers = groupOtherMembers.users.map((user) => {
        otherMembersIds.push(user.id);
        return {
          id: user.id,
          name: user.userName,
          isAdmin: false,
        };
      });
    } else {
      othermembers = [];
    }
    members = [...adminUserIds, ...otherMembersIds];
    res.json({
      members: [...adminmembers, ...othermembers],
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

exports.getNonMembers = async (req, res, next) => {
  const gpId = req.query.gpId;
  console.log("nonMembers", members);
  try {
    const users = await User.findAll({
      where: { id: { [Op.notIn]: members } },
      attributes: ["id", [Sequelize.col("userName"), "name"]],
    });
    console.log(users);
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

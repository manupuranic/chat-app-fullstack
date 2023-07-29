const Admin = require("../models/admin");
const sequelize = require("../utils/database");

exports.makeAdmin = async (req, res, next) => {
  const t = await sequelize.transaction();
  const userId = req.query.userId;
  const gpId = req.query.gpId;
  try {
    await Admin.create(
      {
        userId: userId,
        groupchatId: gpId,
      },
      { transaction: t }
    );
    await t.commit();
    res.json({
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

exports.removeAdmin = async (req, res, next) => {
  const gpId = req.query.gpId;
  const userId = req.query.userId;
  const t = await sequelize.transaction();

  try {
    const adminRecord = await Admin.findOne({
      where: {
        userId: userId,
        groupchatId: gpId,
      },
    });
    await adminRecord.destroy({ transaction: t });
    await t.commit();
    res.json({
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

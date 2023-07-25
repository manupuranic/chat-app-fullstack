const Admin = require("../models/admin");

exports.makeAdmin = async (req, res, next) => {
  const userId = req.query.userId;
  const gpId = req.query.gpId;
  try {
    await Admin.create({
      userId: userId,
      groupchatId: gpId,
    });
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

exports.removeAdmin = async (req, res, next) => {
  const gpId = req.query.gpId;
  const userId = req.query.userId;

  try {
    const adminRecord = await Admin.findOne({
      where: {
        userId: userId,
        groupchatId: gpId,
      },
    });
    await adminRecord.destroy();
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
};

require("dotenv").config();
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const socketio = require("socket.io");

const sequelize = require("./utils/database");
const {
  getUserDetails,
  addOnlineUsers,
  getOnlineUsers,
  deleteOnlineUsers,
} = require("./utils/userBase");
const { addChat } = require("./utils/chatBase");

const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const newGroupRouter = require("./routes/new-group");
const groupRouter = require("./routes/groups");
const adminRouter = require("./routes/admin");

const User = require("./models/User");
const Chat = require("./models/chat");
const GroupChat = require("./models/groupchat");
const Admin = require("./models/admin");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://54.167.138.205", "http://localhost"],
    credentials: true,
  })
);

app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/new-group", newGroupRouter);
app.use("/groups", groupRouter);
app.use("/admin", adminRouter);

app.use(express.static(path.join(__dirname, `public`)));

// relations (associations)
User.hasMany(Chat);
Chat.belongsTo(User);

GroupChat.hasMany(Chat);
Chat.belongsTo(GroupChat);

User.belongsToMany(GroupChat, { through: "usergroup" });
GroupChat.belongsToMany(User, { through: "usergroup" });

GroupChat.hasMany(Admin);
User.hasMany(Admin);

//SOCKET IO LOGIC

const BOTNAME = "Mchat Bot";

//Run when client connects
io.on("connection", (socket) => {
  // Joining the room

  socket.on("joinRoom", async ({ userId, gpId, userName }) => {
    // console.log("gpId", gpId);
    if (gpId) {
      // const user = await getUserDetails(userId);
      // addOnlineUsers(userId, user.userName);
      console.log(`${userName} joined ${gpId}`);
      // const user = await getUserDetails(userId);
      socket.join(gpId);

      //Welcome current User
      socket.emit("message", {
        userId: -1,
        message: "Welcome to Mchat app",
        userName: BOTNAME,
        gpId: -1,
      });

      //Broadcast when user connects to chat
      socket.to(gpId).emit("message", {
        userId: -1,
        message: `${userName} has connected to the chat`,
        userName: BOTNAME,
        gpId: -1,
      });
    }
  });

  socket.on("chatMessage", async (data) => {
    // console.log(data);
    if (data.gpId) {
      const [formattedData] = await Promise.all([
        getUserDetails(data.userId, data.message),
        addChat(data.gpId, data.message, data.userId),
      ]);
      console.log(formattedData);
      socket.to(data.gpId).emit("message", formattedData);
    }
  });

  // socket.on("sendUsers", (cb) => {
  //   const users = getOnlineUsers();
  //   cb(users);
  // });

  //Leaving the room
  socket.on("leaveRoom", ({ userId, gpId, userName }) => {
    //Broadcast when user disconnects from chat
    if (gpId) {
      socket.to(gpId).emit("message", {
        userId: -1,
        message: `${userName} has left the chat`,
        userName: BOTNAME,
        gpId: -1,
      });
      console.log(`${userName} left ${gpId}`);
      socket.leave(gpId);
      // deleteOnlineUsers(userId);
    }
  });
});

sequelize
  .sync()
  // .sync({ force: true })
  .then(() => {
    server.listen(3000);
  })
  .catch((err) => console.log(err));

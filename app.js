require("dotenv").config();
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const socketio = require("socket.io");

const sequelize = require("./utils/database");
const { getUserDetails } = require("./utils/userBase");
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
  socket.on("joinRoom", async ({ userId, gpId }) => {
    console.log("gpId", gpId);
    const user = await getUserDetails(userId);
    socket.join(gpId);

    //Welcome current User
    socket.to(gpId).emit("message", {
      userId: -1,
      message: "Welcome to Mchat app",
      userName: BOTNAME,
      gpId: -1,
    });

    //Broadcast when user connects to chat
    socket.broadcast.to(gpId).emit("message", {
      userId: -1,
      message: `${user.userName} has connected to the chat`,
      userName: BOTNAME,
      gpId: -1,
    });

    //Broadcast when user disconnects from chat
    socket.on("disconnect", () => {
      socket.to(gpId).emit("message", {
        userId: -1,
        message: `${user.userName} has left the chat`,
        userName: BOTNAME,
        gpId: -1,
      });
    });
  });

  socket.on("chatMessage", async (data) => {
    // console.log(data);
    const [formattedData] = await Promise.all([
      getUserDetails(data.userId, data.message),
      addChat(data.gpId, data.message, data.userId),
    ]);
    console.log(formattedData);
    socket.broadcast.to(data.gpId).emit("message", formattedData);
  });
});

sequelize
  .sync()
  // .sync({ force: true })
  .then(() => {
    server.listen(3000);
  })
  .catch((err) => console.log(err));

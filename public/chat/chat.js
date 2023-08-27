const baseUrl = "https://chat.puranic.in";

const socket = io();

const form = document.getElementById("send-message");
const token = localStorage.getItem("token");
const profile = document.getElementById("profile");
const tableBody = document.getElementById("table-body");
const logout = document.getElementById("logout");
const newGroup = document.getElementById("newgroup");
const groupList = document.getElementById("group-list");
const onlineList = document.getElementById("online-list");
const menuBtn = document.getElementById("menu-btn");
const messageContainer = document.getElementById("message-container");
const info = document.getElementById("info");
const infoDiv = document.getElementById("info-div");
const memberCount = document.getElementById("member-count");
const membersList = document.getElementById("members-list");
const settings = document.getElementById("settings");
const brand = document.getElementById("brand");
const header = document.querySelector(".header");
const fileInput = document.getElementById("file");

if (!token) {
  window.location.href = "../index.html";
}
const currentUser = parseJwt(token);

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentGpId");
  localStorage.removeItem("newGroupId");
  localStorage.removeItem("messages");
  localStorage.removeItem("newGroupName");
  localStorage.removeItem("currentGpName");
  window.location.href = "../index.html";
});

newGroup.addEventListener("click", () => {
  window.location.href = "../newgroup/new-group.html";
});

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

const openGroupChat = async (e) => {
  const currentGpId = localStorage.getItem("currentGpId");
  socket.emit("leaveRoom", {
    userId: currentUser.id,
    gpId: currentGpId,
    userName: currentUser.userName,
  });
  const gpId = e.target.id;
  const gpName = e.target.innerText;
  localStorage.setItem("currentGpId", gpId);
  localStorage.setItem("currentGpName", gpName);
  profile.replaceChildren();
  profile.appendChild(document.createTextNode(gpName));
  header.style.display = "flex";
  menuBtn.click();
  getMembers();
  await getChats();
  socket.emit("joinRoom", {
    userId: currentUser.id,
    gpId: gpId,
    userName: currentUser.userName,
  });
};
//   const currentGpId = localStorage.getItem("currentGpId");
//   socket.emit("leaveRoom", {
//     userId: currentUser.id,
//     gpId: currentGpId,
//     userName: currentUser.userName,
//   });
//   const gpId = e.target.id;
//   const gpName = e.target.innerText;
//   localStorage.setItem("currentGpId", gpId);
//   localStorage.setItem("currentGpName", gpName);
//   profile.replaceChildren();
//   profile.appendChild(document.createTextNode(gpName));
//   // localStorage.setItem("messages", JSON.stringify([]));
//   header.style.display = "flex";
//   menuBtn.click();
//   // getPrivateChats();
//   socket.emit("joinRoom", {
//     userId: currentUser.id,
//     gpId: gpId,
//     userName: currentUser.userName,
//   });
// };

// const displayOnlineUsers = (user) => {
//   const li = document.createElement("li");
//   li.className = "list-group-item users";
//   li.id = user.id;
//   li.appendChild(document.createTextNode(user.userName));
//   li.addEventListener("click", openPrivateChat);
//   onlineList.appendChild(li);
// };

// const getOnlineUsers = () => {
//   onlineList.replaceChildren();
//   socket.emit("sendUsers", (users) => {
//     console.log(users);
//     users.forEach((user) => {
//       displayOnlineUsers(user);
//     });
//   });
// };

const displayGroups = (group) => {
  const li = document.createElement("li");
  li.className = "list-group-item users";
  li.id = group.id;
  li.appendChild(document.createTextNode(group.name));
  li.addEventListener("click", openGroupChat);
  groupList.appendChild(li);
};

const getGroups = async () => {
  try {
    const response = await axios.get(`${baseUrl}/groups`, {
      headers: { Authentication: token },
    });
    const groups = response.data.groups;
    groups.forEach((group) => {
      displayGroups(group);
    });
  } catch (error) {}
};

const displayChats = (chat) => {
  const { userId, message, userName } = chat;
  const currentUser = parseJwt(token);
  const li = document.createElement("li");
  let formattedMessage;
  if (message.includes("https://")) {
    formattedMessage = `<div class="chat-image">
                          <img src=${message} alt="image" />
                        </div>`;
  } else {
    formattedMessage = message;
  }
  if (currentUser.id === userId) {
    li.className = "list-group-item you-list";
    li.innerHTML = `<div class="rounded shadow-sm you">
                      ${formattedMessage}
                    </div>`;
  } else if (userId == -1) {
    li.className = "list-group-item";
    li.innerHTML = `<div class="botDiv">
                      <span class="spanName botName">${userName}:</span>
                      <span class="botMessage">${formattedMessage}</span>
                    </div>`;
  } else {
    li.className = "list-group-item";
    li.innerHTML = `<div class="others rounded shadow-sm">
                    <span class="spanName">${userName}</span>
                    <span class="spanMessage">${formattedMessage}</span>
                    </div>`;
  }
  tableBody.appendChild(li);
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

const getChats = async () => {
  tableBody.replaceChildren();
  const gpId = localStorage.getItem("currentGpId");
  if (gpId) {
    header.style.display = "flex";
    form.style.display = "block";
    let localMessages = JSON.parse(localStorage.getItem("messages"));
    let gpMessages =
      localMessages && localMessages[gpId] ? localMessages[gpId] : [];
    const lastMsgId = gpMessages.length
      ? gpMessages[gpMessages.length - 1].id
      : -1;
    try {
      const response = await axios.get(
        `${baseUrl}/chat?lastMsgId=${lastMsgId}&gpId=${gpId}`,
        {
          headers: { Authentication: token },
        }
      );
      const chats = response.data.chats;
      gpMessages = gpMessages ? [...gpMessages, ...chats] : [...chats];
      if (gpMessages.length) {
        while (gpMessages.length > 10) {
          gpMessages.shift();
        }
        gpMessages.forEach((chat) => {
          displayChats({
            userId: chat.userId,
            message: chat.message,
            gpId: chat.groupchatId,
            userName: chat.user.userName,
          });
        });
        localMessages[gpId] = gpMessages;
        localStorage.setItem("messages", JSON.stringify(localMessages));
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    tableBody.innerHTML = `
    <li class="list-group-item">
        <h1 class='heading'>Welcome to Mchat App</h1>
    </li>
    <li class="list-group-item">
        <h3 style="text-align: center">Chat in groups or in private</h3>
    </li>`;
  }
};

const onLoad = async () => {
  const gpName = localStorage.getItem("currentGpName");
  const gpId = localStorage.getItem("currentGpId");
  profile.replaceChildren(gpName);
  header.style.display = "none";
  if (gpId) {
    getMembers();
  }
  getGroups();
  await getChats();
  socket.emit("joinRoom", {
    userId: currentUser.id,
    gpId: gpId,
    userName: currentUser.userName,
  });
};

window.addEventListener("DOMContentLoaded", onLoad);

const submitHandler = async (e) => {
  e.preventDefault();
  const gpId = localStorage.getItem("currentGpId");
  const msg = e.target.message;
  const chat = {
    userId: currentUser.id,
    gpId: gpId,
    message: msg.value,
  };
  socket.emit("chatMessage", chat);
  displayChats(chat);
  msg.value = "";
};

form.addEventListener("submit", submitHandler);

const getMembers = async () => {
  const gpId = localStorage.getItem("currentGpId");
  membersList.replaceChildren();
  try {
    const response = await axios.get(
      `${baseUrl}/groups/getmembers?gpId=${gpId}`,
      {
        headers: { Authentication: token },
      }
    );
    const { members: users } = response.data;
    const userCount = users.length;
    memberCount.replaceChildren(document.createTextNode(userCount));
    users.forEach((user) => {
      const li = document.createElement("li");
      const spanName = document.createElement("span");
      const spanStatus = document.createElement("span");
      li.id = user.id;
      li.className = "list-group-item";
      spanName.className = "member-name";
      if (currentUser.id === user.id) {
        spanName.appendChild(document.createTextNode("You"));
      } else {
        spanName.appendChild(document.createTextNode(user.name));
      }
      if (user.isAdmin) {
        if (user.id === currentUser.id) {
          settings.style.display = "block";
        }
        spanStatus.className = "status admin";
        spanStatus.appendChild(document.createTextNode("Admin"));
      } else {
        spanStatus.className = "status member";
        spanStatus.appendChild(document.createTextNode("Member"));
      }
      li.appendChild(spanName);
      li.appendChild(spanStatus);
      membersList.appendChild(li);
    });
  } catch (error) {
    console.log(error);
  }
};

const handleInfo = () => {
  const infoDisplayInfo = infoDiv.style.display;
  if (infoDisplayInfo !== "block") {
    getMembers();
    infoDiv.style.display = "block";
  } else {
    infoDiv.style.display = "none";
  }
};

info.addEventListener("click", handleInfo);

settings.addEventListener("click", () => {
  const gpId = localStorage.getItem("currentGpId");
  const gpName = localStorage.getItem("currentGpName");
  localStorage.setItem("newGroupId", gpId);
  localStorage.setItem("newGroupName", gpName);
  window.location.href = "../editgroup/edit-group.html";
});

brand.addEventListener("click", () => {
  header.style.display = "none";
  localStorage.removeItem("currentGpId");
  localStorage.removeItem("currentGpName");
  menuBtn.click();
  getChats();
  form.style.display = "none";
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const gpId = localStorage.getItem("currentGpId");
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      // Create a JSON object containing the file name and the file buffer
      const fileData = {
        gpId: gpId,
        userId: currentUser.id,
        fileName: file.name,
        fileBuffer: reader.result,
      };
      // Send the file data to the server through the socket
      socket.emit("upload", fileData, (fileUrl) => {
        displayChats({
          userId: currentUser.id,
          message: fileUrl,
          userName: currentUser.userName,
        });
      });
    };
    reader.readAsArrayBuffer(file);
  }
});

// SOCKET LOGIC

socket.on("message", (data) => {
  displayChats(data);
});

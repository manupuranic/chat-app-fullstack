const baseUrl = "http://localhost:3000";

const socket = io();

const form = document.getElementById("send-message");
const token = localStorage.getItem("token");
const profile = document.getElementById("profile");
const tableBody = document.getElementById("table-body");
const logout = document.getElementById("logout");
const newGroup = document.getElementById("newgroup");
const groupList = document.getElementById("group-list");
const menuBtn = document.getElementById("menu-btn");
const messageContainer = document.getElementById("message-container");
const info = document.getElementById("info");
const infoDiv = document.getElementById("info-div");
const memberCount = document.getElementById("member-count");
const membersList = document.getElementById("members-list");
const settings = document.getElementById("settings");
const brand = document.getElementById("brand");
const header = document.querySelector(".header");

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

const openGroupChat = (e) => {
  const gpId = e.target.id;
  const gpName = e.target.innerText;
  localStorage.setItem("currentGpId", gpId);
  localStorage.setItem("currentGpName", gpName);
  profile.replaceChildren();
  profile.appendChild(document.createTextNode(gpName));
  localStorage.setItem("messages", JSON.stringify([]));
  header.style.display = "flex";
  getChats();
  getMembers();
  menuBtn.click();
};

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
  const trow = document.createElement("tr");
  if (currentUser.id === userId) {
    trow.className = "right";
    trow.innerHTML = `<td></td>
                  <td>
                    <span class="you rounded shadow-sm">${message}</span>
                  </td>
    `;
  } else {
    trow.innerHTML = `<td>
                    <span class="others rounded shadow-sm">${userName}: ${message}</span>
                  </td>
                  <td></td>
  `;
  }
  tableBody.appendChild(trow);
};

const getChats = async () => {
  tableBody.replaceChildren();
  const gpId = localStorage.getItem("currentGpId");
  socket.emit("joinRoom", { userId: currentUser.id, gpId: gpId });
  if (gpId) {
    header.style.display = "flex";
    form.style.display = "block";
    let localMessages = JSON.parse(localStorage.getItem("messages"));
    const lastMsgId = localMessages.length
      ? localMessages[localMessages.length - 1].id
      : -1;
    try {
      const response = await axios.get(
        `${baseUrl}/chat?lastMsgId=${lastMsgId}&gpId=${gpId}`,
        {
          headers: { Authentication: token },
        }
      );
      const chats = response.data.chats;
      console.log(chats);
      if (localMessages) {
        localMessages = [...localMessages, ...chats];
      } else {
        localMessages = [...chats];
      }
      if (localMessages.length) {
        while (localMessages.length > 10) {
          localMessages.shift();
        }
        localMessages.forEach((chat) => {
          displayChats({
            userId: chat.userId,
            message: chat.message,
            gpId: chat.groupchatId,
            userName: chat.user.userName,
          });
        });
        localStorage.setItem("messages", JSON.stringify(localMessages));
      } else {
        tableBody.innerHTML = `
    <tr><td><h3 style="text-align: center">No Messages</h3></td></tr>`;
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    tableBody.innerHTML = `
    <tr><td><h1 class='heading'>Welcome to Mchat App</h1></td></tr>
    <tr><td><h3 style="text-align: center">select a group to view messages</h3></td></tr>`;
  }
};

const onLoad = () => {
  const gpName = localStorage.getItem("currentGpName");
  profile.replaceChildren(gpName);
  header.style.display = "none";
  getMembers();
  getChats();
  getGroups();
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
  localStorage.setItem("messages", []);
  localStorage.removeItem("currentGpId");
  localStorage.removeItem("currentGpName");
  menuBtn.click();
  getChats();
  form.style.display = "none";
});

// SOCKET LOGIC

// const gpId = localStorage.getItem("currentGpId");

socket.on("message", (data) => {
  // console.log(data);
  displayChats(data);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

const baseUrl = "http://localhost:3000";
const token = localStorage.getItem("token");
const logout = document.getElementById("logout");
const form = document.getElementById("groupDetailsForm");
const userModal = document.getElementById("users-model");
const groupForm = document.getElementById("group-form");
const msg = document.getElementById("message");
const userList = document.getElementById("user-list");
const groupList = document.getElementById("group-list");
const menuBtn = document.getElementById("menu-btn");
const saveBtn = document.getElementById("save");
const groupName = document.getElementById("group-name");
const groupNameInput = document.getElementById("groupNameinput");
const brand = document.getElementById("brand");

if (!token) {
  window.location.href = "../login/login.html";
}

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./login/login.html";
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

const currentUser = parseJwt(token);

const messageHandler = (message, type) => {
  msg.innerText = message;
  msg.className = type;
  setTimeout(() => {
    msg.innerText = "";
    msg.className = "";
  }, 5000);
};

const openGroupChat = (e) => {
  const gpId = e.target.id;
  const gpName = e.target.innerText;
  localStorage.setItem("currentGpId", gpId);
  localStorage.setItem("currentGpName", gpName);
  localStorage.setItem("messages", JSON.stringify([]));
  // getChats();
  window.location.href = "../chat.html";
  // menuBtn.click();
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
  const gpName = localStorage.getItem("newGroupName");
  groupName.appendChild(document.createTextNode(gpName));
  try {
    const response = await axios.get(`${baseUrl}/groups`, {
      headers: { Authentication: token },
    });
    const groups = response.data.groups;
    groups.forEach((group) => {
      displayGroups(group);
    });
  } catch (error) {
    console.log(error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const gpName = localStorage.getItem("newGroupName");
  groupNameInput.value = gpName;
  getGroups();
  getUsers();
});

const deleteUserHandler = async (e) => {
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    await axios.delete(
      `${baseUrl}/new-group/delete-user?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    // console.log(e.target.innerText);
    console.log(e.target.previousSibling);
    if (
      e.target.innerText === "Exit Group" &&
      e.target.previousSibling.innerText === "Remove Admin"
    ) {
      await axios.get(
        `${baseUrl}/admin/remove-admin?gpId=${gpId}&userId=${userId}`,
        { headers: { Authentication: token } }
      );
    }
    if (currentUser.id === +userId) {
      alert("You have exited the group");
      localStorage.setItem("messages", []);
      localStorage.removeItem("currentGpId");
      localStorage.removeItem("currentGpName");
      window.location.href = "../chat.html";
    } else {
      getUsers();
    }
  } catch (error) {
    console.log(error);
  }
};

async function removeAdminHandler(e) {
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    const response = await axios.get(
      `${baseUrl}/admin/remove-admin?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    getUsers();
  } catch (error) {
    console.log(error);
  }
}

async function makeAdminHandler(e) {
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    const response = await axios.get(
      `${baseUrl}/admin/make-admin?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    getUsers();
  } catch (error) {
    console.log(error);
  }
}

const addUserHandler = async (e) => {
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    const response = await axios.get(
      `${baseUrl}/new-group/add-user?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    getUsers();
  } catch (error) {
    console.log(error);
  }
};

const displayUsers = (user, isMember) => {
  const li = document.createElement("li");
  const span = document.createElement("span");
  const button = document.createElement("button");
  li.id = user.id;
  li.className = "list-group-item";
  if (currentUser.id === user.id) {
    span.appendChild(document.createTextNode("You"));
  } else {
    span.appendChild(document.createTextNode(user.name));
  }
  button.className = "btn add";
  if (isMember) {
    const AdminButton = document.createElement("button");
    if (currentUser.id === user.id) {
      button.appendChild(document.createTextNode("Exit Group"));
    } else {
      button.appendChild(document.createTextNode("Remove"));
    }
    button.addEventListener("click", deleteUserHandler);
    AdminButton.className = "btn add btn-admin";

    if (user.isAdmin) {
      AdminButton.appendChild(document.createTextNode("Remove Admin"));
      AdminButton.addEventListener("click", removeAdminHandler);
    } else {
      AdminButton.appendChild(document.createTextNode("Make Admin"));
      AdminButton.addEventListener("click", makeAdminHandler);
    }
    li.appendChild(span);
    li.appendChild(button);
    li.appendChild(AdminButton);
    userList.appendChild(li);
  } else {
    button.appendChild(document.createTextNode("Add"));
    button.addEventListener("click", addUserHandler);
    li.appendChild(span);
    li.appendChild(button);
    userList.appendChild(li);
  }
};

const getUsers = async () => {
  userList.replaceChildren();
  // get members first
  const gpId = localStorage.getItem("newGroupId");
  try {
    const response = await axios.get(
      `${baseUrl}/groups/getMembers?gpId=${gpId}`,
      {
        headers: { Authentication: token },
      }
    );
    const { members: users } = response.data;
    // console.log(users);
    users.forEach((user) => {
      displayUsers(user, true);
    });
  } catch (error) {
    console.log(error);
  }

  //get non members
  try {
    const response = await axios.get(
      `${baseUrl}/groups/getNonMembers?gpId=${gpId}`,
      {
        headers: { Authentication: token },
      }
    );
    const { users } = response.data;
    // console.log(users);
    users.forEach((user) => {
      displayUsers(user, false);
    });
  } catch (error) {
    console.log(error);
  }
};

const submitHandler = async (e) => {
  e.preventDefault();
  const groupName = e.target.groupName;
  if (groupName.value === "") {
    messageHandler("Please Enter the name", "error");
  } else {
    const postDetails = {
      groupName: groupName.value,
    };
    try {
      const gpId = localStorage.getItem("newGroupId");
      const response = await axios.post(
        `${baseUrl}/new-group/edit-group?gpId=${gpId}`,
        postDetails,
        {
          headers: { Authentication: token },
        }
      );
      localStorage.setItem("newGroupId", gpId);
      localStorage.setItem("newGroupName", groupName.value);
      messageHandler("Updated Group Name", "success");
    } catch (error) {
      console.log(error);
    }
  }
};

saveBtn.addEventListener("click", () => {
  const gpId = localStorage.getItem("newGroupId");
  const gpName = localStorage.getItem("newGroupName");
  localStorage.setItem("currentGpId", gpId);
  localStorage.setItem("currentGpName", gpName);
  localStorage.setItem("messages", JSON.stringify([]));
  // getChats();
  window.location.href = "../chat.html";
});

form.addEventListener("submit", submitHandler);

brand.addEventListener("click", () => {
  // header.style.display = "none";
  localStorage.setItem("messages", []);
  localStorage.removeItem("currentGpId");
  localStorage.removeItem("currentGpName");
  window.location.href = "../chat.html";
  // getChats();
  // form.style.display = "none";
});

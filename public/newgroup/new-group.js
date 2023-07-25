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
const brand = document.getElementById("brand");

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./login/login.html";
});

if (!token) {
  window.location.href = "../login/login.html";
}

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

document.addEventListener("DOMContentLoaded", getGroups);

const deleteUserHandler = async (e) => {
  const btn = e.target;
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    const response = await axios.delete(
      `${baseUrl}/new-group/delete-user?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    btn.textContent = "Add";
    btn.removeEventListener("click", deleteUserHandler);
    btn.addEventListener("click", addUserHandler);
  } catch (error) {
    console.log(error);
  }
};

async function removeAdminHandler(e) {
  const btn = e.target;
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    const response = await axios.get(
      `${baseUrl}/admin/remove-admin?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    btn.innerText = "Make Admin";
    btn.removeEventListener("click", removeAdminHandler);
    btn.addEventListener("click", makeAdminHandler);
  } catch (error) {}
}

async function makeAdminHandler(e) {
  const btn = e.target;
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    const response = await axios.get(
      `${baseUrl}/admin/make-admin?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    btn.innerText = "Remove Admin";
    btn.removeEventListener("click", makeAdminHandler);
    btn.addEventListener("click", removeAdminHandler);
  } catch (error) {
    console.log(error);
  }
}

const addUserHandler = async (e) => {
  const btn = e.target;
  const li = e.target.parentElement;
  const gpId = localStorage.getItem("newGroupId");
  const userId = li.id;
  try {
    const response = await axios.get(
      `${baseUrl}/new-group/add-user?gpId=${gpId}&userId=${userId}`,
      { headers: { Authentication: token } }
    );
    const makeAdminBtn = document.createElement("button");
    makeAdminBtn.className = "btn btn-admin add";
    makeAdminBtn.appendChild(document.createTextNode("Make Admin"));
    makeAdminBtn.addEventListener("click", makeAdminHandler);
    li.appendChild(makeAdminBtn);
    btn.innerText = "Remove";
    btn.removeEventListener("click", addUserHandler);
    btn.addEventListener("click", deleteUserHandler);
  } catch (error) {
    console.log(error);
  }
};

const displayUsers = (user) => {
  if (currentUser.id !== user.id) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    const button = document.createElement("button");
    li.id = user.id;
    li.className = "list-group-item";
    span.appendChild(document.createTextNode(user.userName));
    button.className = "btn add";
    button.appendChild(document.createTextNode("Add"));
    button.addEventListener("click", addUserHandler);
    li.appendChild(span);
    li.appendChild(button);
    userList.appendChild(li);
  }
};

const getUsers = async () => {
  userList.replaceChildren();
  try {
    const response = await axios.get(`${baseUrl}/new-group/users`, {
      headers: { Authentication: token },
    });
    const { users } = response.data;
    users.forEach((user) => {
      displayUsers(user);
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
      const response = await axios.post(`${baseUrl}/new-group`, postDetails, {
        headers: { Authentication: token },
      });
      console.log(response);
      const gpId = response.data.gp.id;
      const gpName = response.data.gp.name;
      localStorage.setItem("newGroupId", gpId);
      localStorage.setItem("newGroupName", gpName);
      console.log(gpId);
      groupName.value = "";
      groupForm.style.display = "none";
      userModal.style.display = "block";
      getUsers();
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

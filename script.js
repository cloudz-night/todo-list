function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authStatus").textContent = "Signed up!";
    })
    .catch(error => {
      document.getElementById("authStatus").textContent = error.message;
    });
}

function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("authStatus").textContent = "Signed in!";
      loadTasksFromFirestore();
    })
    .catch(error => {
      document.getElementById("authStatus").textContent = error.message;
    });
}

function signOut() {
  auth.signOut().then(() => {
    document.getElementById("authStatus").textContent = "Signed out!";
    document.getElementById("tasks").innerHTML = "";
    document.getElementById("tasks").style.display = "none";
  });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      document.getElementById("authStatus").textContent = "Signed in with Google!";
      closePopup();
    })
    .catch((error) => {
      document.getElementById("authStatus").textContent = error.message;
    });
}

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    document.getElementById("authStatus").textContent = "Signed in!";
    loadTasksFromFirestore();

    // Update the account display
    const userPhoto = document.getElementById("userPhoto");
    const userEmail = document.getElementById("userEmail");
    const userName = document.getElementById("userName");
    const accountBtn = document.getElementById("account");

    if (user.photoURL) {
      // User has a Google profile photo
      userPhoto.src = user.photoURL;
      userPhoto.style.display = "block";
      userName.textContent = user.displayName;
      userName.style.display = "block";
      userEmail.style.display = "none";
      accountBtn.style.display = "none";
    } else {
      // User signed in with email
      userPhoto.style.display = "none";
      userEmail.textContent = user.email;
      userEmail.style.display = "block";
      accountBtn.style.display = "none";
    }
  } else {
    // User is signed out
    document.getElementById("tasks").innerHTML = "";
    document.getElementById("tasks").style.display = "none";

    // Reset account display
    const userPhoto = document.getElementById("userPhoto");
    const userEmail = document.getElementById("userEmail");
    const userName = document.getElementById("userName");
    const accountBtn = document.getElementById("account");
    const accountBtnMobile = document.getElementById("account-mobile");

    userPhoto.style.display = "none";
    userEmail.style.display = "none";
    userName.style.display = "none";
    accountBtn.style.display = "block";
    if (accountBtnMobile) accountBtnMobile.style.display = "block";
  }
});

function saveTaskToFirestore(text, completed) {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).collection("tasks").add({
    text: text,
    completed: completed || false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    // Get the task list ready
    const taskList = document.getElementById("tasks");
    taskList.style.display = "block";

    // Create new task element with animation
    const task = document.createElement("div");
    const taskP = document.createElement("p");
    const buttonDiv = document.createElement("div");
    const editBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");

    task.classList.add("task", "new-task"); // Add animation class for new tasks
    taskP.textContent = text;
    buttonDiv.className = "buttons";
    editBtn.textContent = "edit";
    deleteBtn.textContent = "delete";

    buttonDiv.appendChild(editBtn);
    buttonDiv.appendChild(deleteBtn);
    task.appendChild(taskP);
    task.appendChild(buttonDiv);

    // Add to DOM at the top of the list
    if (taskList.firstChild) {
      taskList.insertBefore(task, taskList.firstChild);
    } else {
      taskList.appendChild(task);
    }

    // Refresh the list after animation completes
    setTimeout(() => {
      loadTasksFromFirestore();
    }, 300); // Same duration as the animation
  });
}

let isComplete = false;
let isEditing = false;

document.addEventListener("keydown", function(event) {
    const taskPopup = document.getElementById("taskPopup");
    if (event.key === "Enter" && taskPopup.style.display === "block") {
        confirmTask();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "b") {
        addTask();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "m") {
        clearAll();
    }
});

document.addEventListener("keydown", function(event) {
    const editPopup = document.getElementById("editPopup");
    if (event.key === "Enter" && editPopup.style.display === "block") {
        confirmEdit();
    }
});

function openAuth() {
    const authSection = document.getElementById("authSection");
    if (authSection.style.display === "none" || authSection.style.display === "") {
        authSection.style.display = "grid";
    }
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskPopup = document.getElementById("taskPopup");
    taskPopup.style.display = "block";
    // Force a reflow to ensure the animation triggers
    void taskPopup.offsetWidth;
    taskInput.value = "";
    taskInput.focus();
}
function confirmTask() {
    const taskPopup = document.getElementById("taskPopup");
    taskPopup.style.display = "none";
    let taskText = document.getElementById("taskInput").value;
    document.getElementById("taskInput").value = "";
    let taskList = document.getElementById("tasks");

    if (taskText === "") {
        const popupDialogue = document.getElementById("popupDialogue")
        let popupDialogueText = document.getElementById("popupDialogueText")
        popupDialogueText.textContent = "enter task name"
        popupDialogue.style.display = "block"
        popupDialogueText.style.marginRight = "2em"
        // Force a reflow to ensure the animation triggers
        void popupDialogue.offsetWidth;
        return;
    }

    let task = document.createElement("div")
    let taskP = document.createElement("p")
    let buttonDiv = document.createElement("div")
    let editBtn = document.createElement("button")
    let deleteBtn = document.createElement("button")
    taskList.style.display = "block"

    task.classList.add("task", "incomplete")
    taskP.onclick = function() {completeTask(taskP, task);}
    taskP.textContent = taskText
    buttonDiv.className = "buttons"
    editBtn.textContent = "edit"
    editBtn.onclick = function() {editTask(task, taskP);}
    deleteBtn.textContent = "delete"
    deleteBtn.onclick = function(event) {deleteTask(event);}

    if (isEditing === true && isComplete === true) {
        taskP.style.textDecoration = "line-through"
        task.classList.add("complete")
        isComplete = false;
        isEditing = false;
    } else {
        task.classList.remove("incomplete")
    }
    saveTaskToFirestore(taskText, false);
}


function editTask(task) {
    isEditing = true;

    if (task.classList.contains("incomplete")) {
        task.classList.remove("complete")
        isComplete = true
    } else {
        task.classList.add("complete")
        isComplete = false;
    }

    addTask()
    deleteTask(event)
}

function isTaskListEmpty() {
    const taskList = document.getElementById('tasks')
    let istaskListEmpty = document.getElementById('tasks').innerHTML === "";

    if (istaskListEmpty === true) {
        taskList.style.display = "none"
    } else {
        taskList.style.display = "block"
    }
}

let currentEditingId = null;

function openEditPopup(docId, currentText) {
    const editPopup = document.getElementById("editPopup");
    const editInput = document.getElementById("editInput");
    editPopup.style.display = "block";
    editInput.value = currentText;
    editInput.focus();
    currentEditingId = docId;
}

function confirmEdit() {
    const editInput = document.getElementById("editInput");
    const newText = editInput.value.trim();

    if (newText === "") {
        const popupDialogue = document.getElementById("popupDialogue")
        let popupDialogueText = document.getElementById("popupDialogueText")
        popupDialogueText.textContent = "enter task name"
        popupDialogue.style.display = "flex"
        popupDialogue.style.justifyContent = "center"
        popupDialogue.style.alignItems = "center"
        popupDialogueText.style.marginRight = "2em"
        return;
    }

    if (currentEditingId) {
        updateTaskText(currentEditingId, newText);
        closePopup();
        currentEditingId = null;
    }
}

function closePopup() {
    const taskPopup = document.getElementById("taskPopup");
    taskPopup.style.display = "none";
    const popupDialogue = document.getElementById("popupDialogue")
    popupDialogue.style.display = "none";
    const editPopup = document.getElementById("editPopup");
    editPopup.style.display = "none";
    const authSection = document.getElementById("authSection");
    authSection.style.display = "none";

    const taskList = document.getElementById('tasks')
    let istaskListEmpty = document.getElementById('tasks').innerHTML === "";

    if (istaskListEmpty === true) {
        taskList.style.display = "none"
    } else {
        taskList.style.display = "block"
    }
}

function loadTasksFromFirestore() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).collection("tasks").get()
    .then(snapshot => {
      const taskList = document.getElementById("tasks");
      taskList.innerHTML = "";
      if (snapshot.empty) {
        taskList.style.display = "none";
        return;
      }
      taskList.style.display = "block";
      snapshot.forEach(doc => {
        const { text, completed } = doc.data();
        const docId = doc.id;
        let task = document.createElement("div");
        let taskP = document.createElement("p");
        let buttonDiv = document.createElement("div");
        let editBtn = document.createElement("button");
        let deleteBtn = document.createElement("button");
        task.classList.add("task"); // No animation on load
        taskP.textContent = text;
        if (completed) {
          taskP.style.textDecoration = "line-through";
          task.classList.add("complete");
        } else {
          task.classList.add("incomplete");
        }
        // Complete toggle
        taskP.onclick = function() { toggleComplete(docId, !completed); };
        buttonDiv.className = "buttons";
        editBtn.textContent = "edit";
        editBtn.onclick = function() { openEditPopup(docId, text); };
        deleteBtn.textContent = "delete";
        deleteBtn.onclick = function() { deleteTaskFromFirestore(docId); };
        task.appendChild(taskP);
        buttonDiv.appendChild(editBtn);
        buttonDiv.appendChild(deleteBtn);
        task.appendChild(buttonDiv);
        taskList.appendChild(task);
      });
    });
}

function toggleComplete(docId, completed) {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).collection("tasks").doc(docId).update({
    completed: completed
  }).then(() => {
    loadTasksFromFirestore();
  });
}

function deleteTaskFromFirestore(docId) {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).collection("tasks").doc(docId).delete()
    .then(() => {
      loadTasksFromFirestore();
    });
}

function clearComplete() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).collection("tasks").where("completed", "==", true).get()
    .then(snapshot => {
      if (snapshot.empty) return;
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    })
    .then(() => {
      loadTasksFromFirestore();
    });
}

function clearAll() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).collection("tasks").get()
    .then(snapshot => {
      if (snapshot.empty) return;
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    })
    .then(() => {
      loadTasksFromFirestore();
    });
}

function updateTaskText(docId, newText) {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).collection("tasks").doc(docId).update({
    text: newText
  }).then(() => {
    loadTasksFromFirestore();
  });
}

function menu() {
    let menu = document.getElementById("menuPanel")
    menu.classList.toggle("menu--visible");
}

// Track theme state
let isDarkMode = localStorage.getItem('isDarkMode') === 'true';

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = isDarkMode ? 'light theme' : 'dark theme';
    applyTheme(isDarkMode);
});

function darkTheme() {
    isDarkMode = !isDarkMode;
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = isDarkMode ? 'light theme' : 'dark theme';
    applyTheme(isDarkMode);
    // Save theme preference
    localStorage.setItem('isDarkMode', isDarkMode);
}

function closePopup() {
    document.querySelectorAll('#taskPopup, #editPopup, #popupDialogue, #authSection').forEach(popup => {
        popup.style.display = 'none';
    });
}

function applyTheme(isDark) {
    const root = document.documentElement;
    if (isDark) {
        // Switch to dark theme (rose-pine)
        root.style.setProperty('--primary', '#b197dd');
        root.style.setProperty('--secondary', '#493a61');
        root.style.setProperty('--accent', '#6bb4a8');
        root.style.setProperty('--background', '#1A1224');
        root.style.setProperty('--dark-bg', '#11091B');
        root.style.setProperty('--text', '#e8e0f5');
    } else {
        // Switch to light theme (theme 1)
        root.style.setProperty('--primary', '#474cca');
        root.style.setProperty('--secondary', '#bfb2b0');
        root.style.setProperty('--accent', '#a6a691');
        root.style.setProperty('--background', '#fcfcfd');
        root.style.setProperty('--dark-bg', '#D9D9DA');
        root.style.setProperty('--text', '#070709');
    }
}

function saveTasksToLocalStorage() {
    const taskList = document.getElementById("tasks");
    const tasks = [];

    taskList.querySelectorAll(".task").forEach(task => {
        const text = task.querySelector("p").textContent;
        // Save as completed if it has the 'complete' class
        const completed = task.classList.contains("complete");
        tasks.push({text, completed});
    });
    localStorage.setItem("tasks", JSON.stringify(tasks))
    console.log("saved")
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

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskPopup = document.getElementById("taskPopup");
    taskPopup.style.display = "block";
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
        popupDialogue.style.display = "flex"
        popupDialogue.style.justifyContent = "center"
        popupDialogue.style.alignItems = "center"
        popupDialogueText.style.marginRight = "2em"
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

    task.appendChild(taskP)
    buttonDiv.appendChild(editBtn)
    buttonDiv.appendChild(deleteBtn)
    task.appendChild(buttonDiv)
    taskList.appendChild(task);
    saveTasksToLocalStorage()
}

function completeTask(taskP, task) {
    if (task.classList.contains("complete")) {
        taskP.style.textDecoration = "none"
        task.classList.add("incomplete")
        task.classList.remove("complete")
    } else {
        taskP.style.textDecoration = "line-through"
        task.classList.add("complete")
        task.classList.remove("incomplete")
    }
    saveTasksToLocalStorage()
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

function deleteTask(event) {
    const task = event.target.closest('.task');
    if (task) {
        task.remove();
    }
    isTaskListEmpty();
    saveTasksToLocalStorage()
}

function clearComplete() {
    const tasks = document.getElementsByClassName("complete")
    Array.from(tasks).forEach(tasks => tasks.remove())
    isTaskListEmpty();
    saveTasksToLocalStorage()
}

function clearAll() {
    const taskList = document.getElementById("tasks")
    taskList.innerHTML = ""
    taskList.style.display = "none"
    saveTasksToLocalStorage()
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

function closePopup() {
    const taskPopup = document.getElementById("taskPopup");
    taskPopup.style.display = "none";
    const popupDialogue = document.getElementById("popupDialogue")
    popupDialogue.style.display = "none";

    const taskList = document.getElementById('tasks')
    let istaskListEmpty = document.getElementById('tasks').innerHTML === "";

    if (istaskListEmpty === true) {
        taskList.style.display = "none"
    } else {
        taskList.style.display = "block"
    }
}

function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    let taskList = document.getElementById("tasks");
    taskList.innerHTML = "";
    tasks.forEach(({text, completed}) => {
        let task = document.createElement("div");
        let taskP = document.createElement("p");
        let buttonDiv = document.createElement("div");
        let editBtn = document.createElement("button");
        let deleteBtn = document.createElement("button");
        task.classList.add("task");
        taskP.onclick = function() {completeTask(taskP, task);};
        taskP.textContent = text;
        buttonDiv.className = "buttons";
        editBtn.textContent = "edit";
        editBtn.onclick = function() {editTask(task, taskP);};
        deleteBtn.textContent = "delete";
        deleteBtn.onclick = function(event) {deleteTask(event);};
        if (completed) {
            taskP.style.textDecoration = "line-through";
            task.classList.add("complete");
        } else {
            task.classList.add("incomplete");
        }
        task.appendChild(taskP);
        buttonDiv.appendChild(editBtn);
        buttonDiv.appendChild(deleteBtn);
        task.appendChild(buttonDiv);
        taskList.appendChild(task);
    });
    if (tasks.length === 0) {
        taskList.style.display = "none";
    } else {
        taskList.style.display = "block";
    }
}

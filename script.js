let taskInput = document.getElementById("taskInput");
let taskList = document.getElementById("taskList");


window.onload = function () {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => createTask(task.text, task.completed));
};


function addTask() {
    let text = taskInput.value.trim();
    if (text === "") return;

    createTask(text, false);
    saveTasks();
    taskInput.value = "";
}

function createTask(text, completed) {
    let li = document.createElement("li");

    let span = document.createElement("span");
    span.innerText = text;

    if (completed) span.classList.add("completed");

    span.addEventListener("click", function () {
        span.classList.toggle("completed");
        saveTasks();
    });
    let delBtn = document.createElement("button");
    delBtn.innerText = "X";
    delBtn.className = "delete-btn";

    delBtn.onclick = function () {
        li.remove();
        saveTasks();
    };

    li.appendChild(span);
    li.appendChild(delBtn);
    taskList.appendChild(li);
}
function saveTasks() {
    let tasks = [];

    document.querySelectorAll("#taskList li").forEach(li => {
        let span = li.querySelector("span");

        tasks.push({
            text: span.innerText,
            completed: span.classList.contains("completed")
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const priorityInput = document.getElementById("priorityInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filter");
const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const emptyState = document.getElementById("emptyState");
const clearCompleted = document.getElementById("clearCompleted");
const themeBtn = document.getElementById("themeBtn");
const toast = document.getElementById("toast");

let tasks = JSON.parse(localStorage.getItem("glassTodos")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("glassTodos", JSON.stringify(tasks));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function createTask(text, date, priority) {
  return {
    id: Date.now(),
    text,
    date,
    priority,
    completed: false,
  };
}

function addTask() {
  const text = taskInput.value.trim();
  const date = dateInput.value;
  const priority = priorityInput.value;

  if (text === "") {
    showToast("Enter a task");
    return;
  }

  tasks.unshift(createTask(text, date, priority));

  taskInput.value = "";
  dateInput.value = "";
  priorityInput.value = "Low";

  saveTasks();
  render();
  showToast("Task added");
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  render();
  showToast("Task deleted");
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      task.completed = !task.completed;
    }
    return task;
  });

  saveTasks();
  render();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  const updated = prompt("Edit task", task.text);

  if (updated === null) return;
  if (updated.trim() === "") return;

  task.text = updated.trim();

  saveTasks();
  render();
  showToast("Task updated");
}

function getFilteredTasks() {
  const keyword = searchInput.value.toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(keyword);

    let matchesFilter = true;
    if (currentFilter === "active") {
      matchesFilter = !task.completed;
    }
    if (currentFilter === "completed") {
      matchesFilter = task.completed;
    }

    return matchesSearch && matchesFilter;
  });
}

function render() {
  const filtered = getFilteredTasks();

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  filtered.forEach((task) => {
    const card = document.createElement("div");

    card.className = `glass task-card ${task.completed ? "completed" : ""}`;

    card.innerHTML = `
      <div class="task-left">
        <input
          type="checkbox"
          ${task.completed ? "checked" : ""}
        />

        <div class="task-content">
          <h3>${task.text}</h3>

          <div class="task-meta">
            ${task.date ? `<span class="badge">📅 ${task.date}</span>` : ""}
            <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
          </div>
        </div>
      </div>

      <div class="task-actions">
        <button class="action-btn edit">✏️</button>
        <button class="action-btn delete">🗑️</button>
      </div>
    `;

    const checkbox = card.querySelector("input");
    const edit = card.querySelector(".edit");
    const del = card.querySelector(".delete");

    checkbox.addEventListener("change", () => toggleTask(task.id));
    edit.addEventListener("click", () => editTask(task.id));
    del.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(card);
  });

  updateAnalytics();
}

function updateAnalytics() {
  const total = tasks.length;

  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;

  totalTasks.textContent = total;
  activeTasks.textContent = active;
  completedTasks.textContent = completed;

  let progress = 0;
  if (total > 0) {
    progress = Math.round((completed / total) * 100);
  }

  progressPercent.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
}

function clearDone() {
  tasks = tasks.filter((task) => !task.completed);

  saveTasks();
  render();
  showToast("Completed tasks cleared");
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.textContent = "☀️";
  } else {
    themeBtn.textContent = "🌙";
  }
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

searchInput.addEventListener("input", render);

clearCompleted.addEventListener("click", clearDone);

themeBtn.addEventListener("click", toggleTheme);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");
    currentFilter = btn.dataset.filter;

    render();
  });
});

render();


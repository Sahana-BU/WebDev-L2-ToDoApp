// ================================
// To-Do App JavaScript
// ================================

// Get HTML elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const categoryInput = document.getElementById("category-input");
const dateInput = document.getElementById("date-input");
const taskList = document.getElementById("task-list");

const searchInput = document.getElementById("search-input");
const filterInput = document.getElementById("filter-input");
const sortInput = document.getElementById("sort-input");

const totalTasksDisplay = document.getElementById("total-tasks");
const completedTasksDisplay = document.getElementById("completed-tasks");
const pendingTasksDisplay = document.getElementById("pending-tasks");

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const emptyMessage = document.getElementById("empty-message");

const themeButton = document.getElementById("theme-btn");
const clearCompletedButton = document.getElementById(
    "clear-completed-btn"
);

// Load saved tasks
let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("todoTasks"));
    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

// Save tasks in browser storage
function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title: title,
        category: categoryInput.value,
        dueDate: dateInput.value,
        completed: false,
        createdAt: Date.now()
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
});

// Display tasks
function renderTasks() {
    taskList.innerHTML = "";

    const searchText = searchInput.value.trim().toLowerCase();
    const filterValue = filterInput.value;
    const sortValue = sortInput.value;

    let visibleTasks = tasks.filter(function (task) {
        const matchesSearch = task.title.toLowerCase().includes(searchText);

        const matchesFilter =
            filterValue === "all" ||
            (filterValue === "completed" && task.completed) ||
            (filterValue === "pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    // Sort tasks
    if (sortValue === "newest") {
        visibleTasks.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortValue === "oldest") {
        visibleTasks.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortValue === "alphabetical") {
        visibleTasks.sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    // Show empty message
    emptyMessage.style.display =
        visibleTasks.length === 0 ? "block" : "none";

    // Create each task
    visibleTasks.forEach(function (task) {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("p");
        meta.className = "task-meta";

        const dueDateText = task.dueDate
            ? " • Due: " + task.dueDate
            : "";

        meta.textContent = task.category + dueDateText;

        details.appendChild(title);
        details.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Edit button
        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "✏️ Edit";

        editButton.addEventListener("click", function () {
            const updatedTitle = prompt("Edit your task:", task.title);

            if (updatedTitle === null) {
                return;
            }

            if (updatedTitle.trim() === "") {
                alert("Task name cannot be empty!");
                return;
            }

            task.title = updatedTitle.trim();

            saveTasks();
            renderTasks();
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "🗑️ Delete";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Are you sure you want to delete this task?"
            );

            if (!confirmed) {
                return;
            }

            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        taskItem.appendChild(checkbox);
        taskItem.appendChild(details);
        taskItem.appendChild(actions);

        taskList.appendChild(taskItem);
    });

    updateStatistics();
}

// Update statistics and progress bar
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    const percentage =
        total === 0 ? 0 : Math.round((completed / total) * 100);

    totalTasksDisplay.textContent = total;
    completedTasksDisplay.textContent = completed;
    pendingTasksDisplay.textContent = pending;

    progressBar.style.width = percentage + "%";
    progressText.textContent = percentage + "% completed";
}

// Search tasks
searchInput.addEventListener("input", renderTasks);

// Filter tasks
filterInput.addEventListener("change", renderTasks);

// Sort tasks
sortInput.addEventListener("change", renderTasks);

// Clear completed tasks
clearCompletedButton.addEventListener("click", function () {
    const completedCount = tasks.filter(task => task.completed).length;

    if (completedCount === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmed = confirm(
        "Delete all " + completedCount + " completed task(s)?"
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

// Dark mode
if (localStorage.getItem("todoDarkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️ Light Mode";
}

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDarkMode =
        document.body.classList.contains("dark-mode");

    themeButton.textContent = isDarkMode
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

    localStorage.setItem(
        "todoDarkMode",
        isDarkMode ? "enabled" : "disabled"
    );
});

// Start the application
renderTasks();
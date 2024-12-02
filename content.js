// Create the main todo container
const todoContainer = document.createElement("div");
todoContainer.id = "todo-extension";
todoContainer.style.position = "absolute"; // Draggable position
todoContainer.style.cursor = "move"; // Dragging cursor

// Add a toggle button for visibility
const toggleButton = document.createElement("button");
toggleButton.id = "todo-toggle-btn";
toggleButton.textContent = "Hide Todo";
toggleButton.style.position = "fixed";
toggleButton.style.top = "10px";
toggleButton.style.right = "10px";
toggleButton.style.zIndex = "9999";

// Append the toggle button to the body
document.body.appendChild(toggleButton);

// Utility: Load data from storage
const loadFromStorage = (key, callback, defaultValue = null) => {
  chrome.storage.sync.get(key, (data) => {
    callback(data[key] || defaultValue);
  });
};

// Utility: Save data to storage
const saveToStorage = (key, value) => {
  chrome.storage.sync.set({ [key]: value });
};

// Load and render todos
const renderTodos = () => {
  loadFromStorage("todos", (todos) => {
    const list = document.querySelector("#todo-list");
    list.innerHTML = ""; // Clear previous todos

    todos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${todo.done ? "checked" : ""} data-index="${index}">
        <span class="todo-text ${todo.done ? "completed" : ""}">${todo.text}</span>
        <button class="delete-btn" data-index="${index}">X</button>
      `;
      list.appendChild(li);
    });
  }, []);
};

// Add a new todo
const addTodo = (text) => {
  loadFromStorage("todos", (todos) => {
    todos.push({ text, done: false });
    saveToStorage("todos", todos);
    renderTodos();
  });
};

// Delete a todo
const deleteTodo = (index) => {
  loadFromStorage("todos", (todos) => {
    todos.splice(index, 1);
    saveToStorage("todos", todos);
    renderTodos();
  });
};

// Toggle a todo's completion state
const toggleTodo = (index) => {
  loadFromStorage("todos", (todos) => {
    todos[index].done = !todos[index].done;
    saveToStorage("todos", todos);
    renderTodos();
  });
};

// Save the position of the todo container
const savePosition = (position) => {
  saveToStorage("todoPosition", position);
};

// Load the position of the todo container
const loadPosition = () => {
  loadFromStorage("todoPosition", (position) => {
    todoContainer.style.top = position.top || "20px";
    todoContainer.style.left = position.left || "20px";
  }, { top: "20px", left: "20px" });
};

// Save the visibility state of the todo container
const saveVisibility = (isVisible) => {
  saveToStorage("todoVisible", isVisible);
};

// Load the visibility state of the todo container
const loadVisibility = () => {
  loadFromStorage("todoVisible", (isVisible) => {
    todoContainer.style.display = isVisible ? "block" : "none";
    toggleButton.textContent = isVisible ? "Hide Todo" : "Show Todo";
  }, true);
};

// Add dragging functionality
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

todoContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.offsetX;
  offsetY = e.offsetY;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const top = `${e.clientY - offsetY}px`;
    const left = `${e.clientX - offsetX}px`;
    todoContainer.style.top = top;
    todoContainer.style.left = left;
    savePosition({ top, left });
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Toggle visibility functionality
toggleButton.addEventListener("click", () => {
  const isVisible = todoContainer.style.display !== "none";
  todoContainer.style.display = isVisible ? "none" : "block";
  toggleButton.textContent = isVisible ? "Show Todo" : "Hide Todo";
  saveVisibility(!isVisible);
});

// Inject HTML structure for the todo list
todoContainer.innerHTML = `
  <div id="todo-header">My Work Task</div>
  <div id="todo-body">
    <input type="text" id="todo-input" placeholder="Add a task..." />
    <button id="add-btn">Add</button>
    <ul id="todo-list"></ul>
  </div>
`;
document.body.appendChild(todoContainer);

// Initialize position and visibility
loadPosition();
loadVisibility();

// Attach event listeners
document.querySelector("#add-btn").addEventListener("click", () => {
  const input = document.querySelector("#todo-input");
  if (input.value.trim()) {
    addTodo(input.value.trim());
    input.value = "";
  }
});

document.querySelector("#todo-list").addEventListener("click", (event) => {
  const index = event.target.dataset.index;
  if (event.target.classList.contains("delete-btn")) {
    deleteTodo(index);
  } else if (event.target.classList.contains("todo-checkbox")) {
    toggleTodo(index);
  }
});

// Render todos initially
renderTodos();




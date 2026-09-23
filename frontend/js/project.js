const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("taskDiaryToken");
const user = JSON.parse(localStorage.getItem("taskDiaryUser"));

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

if (!token || !user) {
  window.location.href = "login.html";
}

if (!projectId) {
  window.location.href = "dashboard.html";
}

document.getElementById("userName").textContent = user.name;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

async function loadProject() {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      headers,
    });

    if (!response.ok) {
      window.location.href = "dashboard.html";
      return;
    }

    const project = await response.json();

    document.getElementById("projectName").textContent = project.name;
    document.getElementById("projectDescription").textContent =
      project.description || "No project description.";

    loadTasks();
    loadMembers();
  } catch (error) {
    document.getElementById("projectName").textContent =
      "Unable to load project";
  }
}

async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
      headers,
    });

    if (!response.ok) {
      return;
    }

    const tasks = await response.json();

    const todoTasks = tasks.filter((task) => task.status === "TODO");
    const progressTasks = tasks.filter((task) => task.status === "IN PROGRESS");
    const reviewTasks = tasks.filter((task) => task.status === "REVIEW");
    const doneTasks = tasks.filter((task) => task.status === "DONE");

    renderTaskColumn("todoTasks", todoTasks);
    renderTaskColumn("progressTasks", progressTasks);
    renderTaskColumn("reviewTasks", reviewTasks);
    renderTaskColumn("doneTasks", doneTasks);

    document.getElementById("todoCount").textContent =
      `${todoTasks.length} tasks`;

    document.getElementById("progressTaskCount").textContent =
      `${progressTasks.length} tasks`;

    document.getElementById("reviewCount").textContent =
      `${reviewTasks.length} tasks`;

    document.getElementById("doneCount").textContent =
      `${doneTasks.length} tasks`;
  } catch (error) {
    console.error(error);
  }
}

let draggedTaskId = null;

function renderTaskColumn(elementId, tasks) {
  const container = document.getElementById(elementId);

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="task-empty">
        No tasks here
      </div>
    `;
    return;
  }

  container.innerHTML = tasks
    .map((task) => {
      const priorityClass =
        task.priority === "HIGH"
          ? "priority-high"
          : task.priority === "LOW"
            ? "priority-low"
            : "priority-medium";

      const dueDate = task.due_date
        ? new Date(task.due_date).toLocaleDateString()
        : "";

      return `
        <div class="task-card" draggable="true" onclick="openTask(${task.id})" ondragstart="dragTask(${task.id})">
          <h4>${task.title}</h4>

          <p>
            ${task.description || "No description added."}
          </p>

          <div class="task-info">
            <span class="priority-badge ${priorityClass}">
              ${task.priority}
            </span>

            <span class="task-assignee">
              ${task.assigned_user_name || "Unassigned"}
            </span>
          </div>

          ${dueDate ? `<div class="task-due">Due ${dueDate}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

function dragTask(taskId) {
  draggedTaskId = taskId;
}

document.querySelectorAll(".board-column").forEach((column) => {
  column.addEventListener("dragover", (event) => {
    event.preventDefault();
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("drag-over");
  });

  column.addEventListener("drop", async (event) => {
    event.preventDefault();

    column.classList.remove("drag-over");

    if (!draggedTaskId) {
      return;
    }

    const statusMap = {
      todoTasks: "TODO",
      progressTasks: "IN PROGRESS",
      reviewTasks: "REVIEW",
      doneTasks: "DONE",
    };

    const taskList = column.querySelector(".task-list");

    if (!taskList) {
      draggedTaskId = null;
      return;
    }

    const newStatus = statusMap[taskList.id];

    if (!newStatus) {
      draggedTaskId = null;
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${draggedTaskId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        draggedTaskId = null;
        return;
      }

      draggedTaskId = null;

      await loadTasks();
    } catch (error) {
      console.error(error);
      draggedTaskId = null;
    }
  });
});

let selectedTaskId = null;
let selectedTask = null;

async function openTask(taskId) {
  selectedTaskId = taskId;

  try {
    const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
      headers,
    });

    const tasks = await response.json();

    selectedTask = tasks.find((task) => task.id === taskId);

    if (!selectedTask) {
      return;
    }

    document.getElementById("detailTaskTitle").textContent = selectedTask.title;

    document.getElementById("detailTaskDescription").textContent =
      selectedTask.description || "No description added.";

    document.getElementById("detailTaskPriority").textContent =
      selectedTask.priority;

    document.getElementById("detailTaskStatus").textContent =
      selectedTask.status;

    document.getElementById("detailTaskAssignee").textContent =
      selectedTask.assigned_user_name || "Unassigned";

    document.getElementById("detailTaskDueDate").textContent =
      selectedTask.due_date
        ? new Date(selectedTask.due_date).toLocaleDateString()
        : "No due date";

    document.getElementById("taskDetailsModal").classList.add("active");

    loadComments(taskId);
  } catch (error) {
    console.error(error);
  }
}

async function loadComments(taskId) {
  const commentsList = document.getElementById("commentsList");

  try {
    const response = await fetch(`${API_URL}/comments/${taskId}`, {
      headers,
    });

    const comments = await response.json();

    if (comments.length === 0) {
      commentsList.innerHTML = `
        <div class="task-empty">
          No comments yet.
        </div>
      `;
      return;
    }

    commentsList.innerHTML = comments
      .map(
        (comment) => `
          <div class="comment-item">
            <div class="comment-top">
              <strong>${comment.user_name}</strong>

              <span>
                ${new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>

            <p>${comment.comment}</p>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    commentsList.innerHTML = `
      <div class="task-empty">
        Unable to load comments.
      </div>
    `;
  }
}

document
  .getElementById("commentForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = document.getElementById("commentInput");
    const message = document.getElementById("commentMessage");

    const comment = input.value.trim();

    if (!comment) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/comments/${selectedTaskId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.textContent = data.message;
        return;
      }

      input.value = "";
      message.textContent = "";

      loadComments(selectedTaskId);
    } catch (error) {
      message.textContent = "Unable to add comment";
    }
  });

const taskDetailsModal = document.getElementById("taskDetailsModal");

document.getElementById("closeTaskDetails").addEventListener("click", () => {
  taskDetailsModal.classList.remove("active");
});

taskDetailsModal.addEventListener("click", (event) => {
  if (event.target === taskDetailsModal) {
    taskDetailsModal.classList.remove("active");
  }
});

async function loadMembers() {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      headers,
    });

    if (!response.ok) {
      return;
    }

    const project = await response.json();

    if (project.members) {
      populateMembers(project.members);
    }
  } catch (error) {
    console.error(error);
  }
}

function populateMembers(members) {
  const select = document.getElementById("taskAssignee");

  select.innerHTML = `<option value="">Unassigned</option>`;

  members.forEach((member) => {
    const option = document.createElement("option");

    option.value = member.id;
    option.textContent = member.name;

    select.appendChild(option);
  });
}

const taskModal = document.getElementById("taskModal");
const newTaskButton = document.getElementById("newTaskButton");
const closeTaskModal = document.getElementById("closeTaskModal");

newTaskButton.addEventListener("click", () => {
  taskModal.classList.add("active");
});

closeTaskModal.addEventListener("click", () => {
  taskModal.classList.remove("active");
});

taskModal.addEventListener("click", (event) => {
  if (event.target === taskModal) {
    taskModal.classList.remove("active");
  }
});

document
  .getElementById("taskForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    const status = document.getElementById("taskStatus").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const assignedTo = document.getElementById("taskAssignee").value;

    const message = document.getElementById("taskMessage");

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          project_id: Number(projectId),
          title,
          description,
          priority,
          status,
          due_date: dueDate || null,
          assigned_to: assignedTo ? Number(assignedTo) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.textContent = data.message;
        return;
      }

      document.getElementById("taskForm").reset();
      message.textContent = "";

      taskModal.classList.remove("active");

      loadTasks();
    } catch (error) {
      message.textContent = "Unable to create task";
    }
  });

const editTaskModal = document.getElementById("editTaskModal");
const editTaskForm = document.getElementById("editTaskForm");

document
  .getElementById("editTaskButton")
  .addEventListener("click", async () => {
    if (!selectedTask) {
      return;
    }

    document.getElementById("editTaskTitle").value = selectedTask.title;

    document.getElementById("editTaskDescription").value =
      selectedTask.description || "";

    document.getElementById("editTaskPriority").value = selectedTask.priority;

    document.getElementById("editTaskStatus").value = selectedTask.status;

    document.getElementById("editTaskDueDate").value = selectedTask.due_date
      ? selectedTask.due_date.split("T")[0]
      : "";

    const assigneeSelect = document.getElementById("editTaskAssignee");

    assigneeSelect.innerHTML = `<option value="">Unassigned</option>`;

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers,
      });

      const project = await response.json();

      if (project.members) {
        project.members.forEach((member) => {
          const option = document.createElement("option");

          option.value = member.id;
          option.textContent = member.name;

          if (
            selectedTask.assigned_to &&
            Number(selectedTask.assigned_to) === Number(member.id)
          ) {
            option.selected = true;
          }

          assigneeSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error(error);
    }

    document.getElementById("editTaskMessage").textContent = "";

    editTaskModal.classList.add("active");
  });

document.getElementById("closeEditTask").addEventListener("click", () => {
  editTaskModal.classList.remove("active");
});

editTaskModal.addEventListener("click", (event) => {
  if (event.target === editTaskModal) {
    editTaskModal.classList.remove("active");
  }
});

editTaskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = document.getElementById("editTaskMessage");

  const title = document.getElementById("editTaskTitle").value.trim();

  const description = document
    .getElementById("editTaskDescription")
    .value.trim();

  const priority = document.getElementById("editTaskPriority").value;

  const status = document.getElementById("editTaskStatus").value;

  const dueDate = document.getElementById("editTaskDueDate").value;

  const assignedTo = document.getElementById("editTaskAssignee").value;

  try {
    const response = await fetch(`${API_URL}/tasks/${selectedTaskId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        title,
        description,
        priority,
        status,
        due_date: dueDate || null,
        assigned_to: assignedTo ? Number(assignedTo) : null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message;
      return;
    }

    editTaskModal.classList.remove("active");
    taskDetailsModal.classList.remove("active");

    selectedTask = null;
    selectedTaskId = null;

    await loadTasks();
  } catch (error) {
    message.textContent = "Unable to update task";
  }
});

document
  .getElementById("deleteTaskButton")
  .addEventListener("click", async () => {
    if (!selectedTaskId) {
      return;
    }

    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${selectedTaskId}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      taskDetailsModal.classList.remove("active");

      selectedTask = null;
      selectedTaskId = null;

      await loadTasks();
    } catch (error) {
      alert("Unable to delete task");
    }
  });

const membersModal = document.getElementById("membersModal");
const memberForm = document.getElementById("memberForm");

async function showMembers() {
  const membersList = document.getElementById("membersList");

  membersList.innerHTML = `
    <div class="task-empty">
      Loading members...
    </div>
  `;

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      headers,
    });

    if (!response.ok) {
      membersList.innerHTML = `
        <div class="task-empty">
          Unable to load members.
        </div>
      `;
      return;
    }

    const project = await response.json();

    if (!project.members || project.members.length === 0) {
      membersList.innerHTML = `
        <div class="task-empty">
          No members found.
        </div>
      `;
      return;
    }

    membersList.innerHTML = project.members
      .map(
        (member) => `
          <div class="member-item">
            <div class="member-info">
              <strong>${member.name}</strong>
              <span>${member.email}</span>
            </div>

            <span class="member-role">
              ${
                Number(member.id) === Number(project.created_by)
                  ? "Owner"
                  : "Member"
              }
            </span>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    membersList.innerHTML = `
      <div class="task-empty">
        Unable to load members.
      </div>
    `;
  }
}

document.getElementById("membersButton").addEventListener("click", () => {
  document.getElementById("memberMessage").textContent = "";
  document.getElementById("memberEmail").value = "";

  membersModal.classList.add("active");

  showMembers();
});

document.getElementById("closeMembers").addEventListener("click", () => {
  membersModal.classList.remove("active");
});

membersModal.addEventListener("click", (event) => {
  if (event.target === membersModal) {
    membersModal.classList.remove("active");
  }
});

memberForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const emailInput = document.getElementById("memberEmail");
  const message = document.getElementById("memberMessage");

  const email = emailInput.value.trim();

  if (!email) {
    return;
  }

  message.textContent = "Adding member...";

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message;
      return;
    }

    message.textContent = "Member added successfully";

    emailInput.value = "";

    await showMembers();
    await loadMembers();
  } catch (error) {
    message.textContent = "Unable to add member";
  }
});

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("taskDiaryToken");
  localStorage.removeItem("taskDiaryUser");

  window.location.href = "login.html";
});

loadProject();
const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("taskDiaryToken");
const user = JSON.parse(localStorage.getItem("taskDiaryUser"));

if (!token || !user) {
    window.location.href = "login.html";
}

document.getElementById("userName").textContent = user.name;
document.getElementById("welcomeName").textContent = user.name;

const projectsGrid = document.getElementById("projectsGrid");

async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/projects`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem("taskDiaryToken");
            localStorage.removeItem("taskDiaryUser");
            window.location.href = "login.html";
            return;
        }

        const projects = await response.json();

        document.getElementById("projectCount").textContent = projects.length;

        let totalTasks = 0;
        let progressTasks = 0;
        let completedTasks = 0;

        for (const project of projects) {
            const taskResponse = await fetch(
                `${API_URL}/tasks/project/${project.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const tasks = await taskResponse.json();

            totalTasks += tasks.length;
            progressTasks += tasks.filter(
                task => task.status === "IN PROGRESS"
            ).length;
            completedTasks += tasks.filter(
                task => task.status === "DONE"
            ).length;
        }

        document.getElementById("taskCount").textContent = totalTasks;
        document.getElementById("progressCount").textContent = progressTasks;
        document.getElementById("completedCount").textContent = completedTasks;

        renderProjects(projects);
    } catch (error) {
        projectsGrid.innerHTML = `
            <div class="empty-projects">
                Unable to load your projects.
            </div>
        `;
    }
}

function renderProjects(projects) {
    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-projects">
                <h3>No projects yet</h3>
                <p>Create your first project to get started.</p>
            </div>
        `;
        return;
    }

    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card" onclick="openProject(${project.id})">
            <h3>${project.name}</h3>
            <p>${project.description || "No description added."}</p>
            <div class="project-meta">
                Created ${new Date(project.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join("");
}

function openProject(projectId) {
    window.location.href = `project.html?id=${projectId}`;
}

const modal = document.getElementById("projectModal");
const newProjectButton = document.getElementById("newProjectButton");
const closeModal = document.getElementById("closeModal");

newProjectButton.addEventListener("click", () => {
    modal.classList.add("active");
});

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
});

document.getElementById("projectForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("projectName").value;
    const description = document.getElementById("projectDescription").value;
    const message = document.getElementById("projectMessage");

    try {
        const response = await fetch(`${API_URL}/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        modal.classList.remove("active");
        document.getElementById("projectForm").reset();
        message.textContent = "";

        loadDashboard();
    } catch (error) {
        message.textContent = "Unable to create project";
    }
});

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("taskDiaryToken");
    localStorage.removeItem("taskDiaryUser");
    window.location.href = "login.html";
});

loadDashboard();
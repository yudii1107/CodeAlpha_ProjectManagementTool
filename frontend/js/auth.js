const API_URL = "http://localhost:5000/api";

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("registerMessage");

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message;
                return;
            }

            message.textContent = "Account created successfully";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        } catch (error) {
            message.textContent = "Unable to connect to server";
        }
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message;
                return;
            }

            localStorage.setItem("taskDiaryToken", data.token);
            localStorage.setItem("taskDiaryUser", JSON.stringify(data.user));

            window.location.href = "dashboard.html";
        } catch (error) {
            message.textContent = "Unable to connect to server";
        }
    });
}
# Task Diary

Task Diary is a full-stack project management tool built as part of the My CodeAlpha Full Stack Development Internship.

It allows users to create projects, manage team members, assign tasks, track task progress, and communicate through task comments. The application provides a simple project-board interface inspired by modern project management tools.

## Features

* User registration and login
* JWT-based authentication
* Create and manage projects
* Add members to projects
* Assign tasks to project members
* Task priorities
* Task due dates
* Task status tracking
* Drag-and-drop task management
* Task details and editing
* Task comments
* Project member management
* Dashboard with project and task statistics
* PostgreSQL database integration
* REST API based backend

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* bcryptjs

### Database

* PostgreSQL

### Tools

* Visual Studio Code
* Git
* GitHub
* Postman

## Project Structure

CodeAlpha_ProjectManagementTool
│
├── backend
│   ├── middleware
│   │   └── authMiddleware.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── comments.js
│   ├── .env
│   ├── db.js
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── css
│   │   └── style.css
│   ├── js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── project.js
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── project.html
│   └── register.html
│
├── .gitignore
└── README.md

## How It Works

### 1. Authentication

Users can register and log in to Task Diary. Authentication is handled using JWT tokens.

### 2. Projects

Authenticated users can create projects and add other registered users as project members.

### 3. Tasks

Project members can work with task cards containing:

* Title
* Description
* Priority
* Status
* Due date
* Assigned member

Tasks can be moved between project-board columns using drag and drop.

### 4. Comments

Users can open a task and communicate through comments directly inside the task details.

## Task Board

The project board contains four task statuses:

* To Do
* In Progress
* Review
* Done

## Database

Task Diary uses PostgreSQL with tables for:

* Users
* Projects
* Project Members
* Tasks
* Comments

## Running the Project Locally

### Backend

Open the backend folder in the terminal:

cd backend
npm install
npm run dev

The backend runs on:

http://localhost:5000

### Frontend

Open the `frontend` folder using VS Code Live Server.

The frontend communicates with the backend through REST APIs.

## Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

DB_USER=postgres
DB_HOST=localhost
DB_NAME=task_diary
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret
PORT=5000


Do not upload the `.env` file to GitHub.

## Screenshots

### Dashboard

<img width="1895" height="885" alt="Screenshot 2026-09-24 004201" src="https://github.com/user-attachments/assets/6c19b0ab-c08d-4614-b9fd-8ffd737cdeee" />

### Project Board

<img width="677" height="653" alt="Screenshot 2026-09-24 004240" src="https://github.com/user-attachments/assets/2cdccef9-9f5f-4b1e-8d93-c83ac316d855" />

### Task Details

<img width="1870" height="862" alt="Screenshot 2026-09-24 004220" src="https://github.com/user-attachments/assets/b80d7bf7-fa92-4fbf-8b9c-a8f819c13fda" />

<img width="827" height="793" alt="Screenshot 2026-09-24 004336" src="https://github.com/user-attachments/assets/68aeeedb-e6d0-4695-a6cc-78f3cadb70a1" />


## Future Improvements

* Real-time notifications
* WebSocket support
* Team activity updates
* Task filtering and search
* Improved responsive design
* More advanced project analytics

## Internship Project

This project was developed as part of the **CodeAlpha Full Stack Development Internship**.

## Author

**Yudhishthir**

GitHub: `https://github.com/yudii1107`

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authMiddleware = require("./middleware/authMiddleware");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const commentRoutes = require("./routes/comments");

app.use(cors());
app.use(express.json());
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Task Diary API is running" });
});

const PORT = process.env.PORT || 5000;

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  res.json({
    message: "Authenticated user",
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Task Diary server running on port ${PORT}`);
});

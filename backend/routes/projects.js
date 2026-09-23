const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const result = await pool.query(
      "INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
      [name, description || null, req.user.id]
    );

    const project = result.rows[0];

    await pool.query(
      "INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)",
      [project.id, req.user.id]
    );

    res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = $1 AND pm.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = result.rows[0];

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY u.name`,
      [req.params.id]
    );

    res.json({
      ...project,
      members: membersResult.rows
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Member email is required" });
    }

    const project = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND created_by = $2",
      [req.params.id, req.user.id]
    );

    if (project.rows.length === 0) {
      return res.status(403).json({ message: "Only the project owner can add members" });
    }

    const user = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query(
      "INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.params.id, user.rows[0].id]
    );

    res.json({
      message: "Member added successfully",
      user: user.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

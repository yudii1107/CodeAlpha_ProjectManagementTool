const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const checkProjectMember = async (projectId, userId) => {
  const result = await pool.query(
    "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId]
  );

  return result.rows.length > 0;
};

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      project_id,
      assigned_to,
      title,
      description,
      priority,
      status,
      due_date
    } = req.body;

    if (!project_id || !title) {
      return res.status(400).json({
        message: "Project ID and task title are required"
      });
    }

    const isMember = await checkProjectMember(project_id, req.user.id);

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project"
      });
    }

    if (assigned_to) {
      const assignedMember = await checkProjectMember(
        project_id,
        assigned_to
      );

      if (!assignedMember) {
        return res.status(400).json({
          message: "Assigned user is not a project member"
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks
      (project_id, assigned_to, title, description, priority, status, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        project_id,
        assigned_to || null,
        title,
        description || null,
        priority || "MEDIUM",
        status || "TODO",
        due_date || null
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      task: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    const isMember = await checkProjectMember(
      req.params.projectId,
      req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project"
      });
    }

    const result = await pool.query(
      `SELECT
        t.*,
        u.name AS assigned_user
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.projectId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, status, assigned_to, due_date } =
      req.body;

    const taskResult = await pool.query(
      "SELECT project_id FROM tasks WHERE id = $1",
      [req.params.id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const projectId = taskResult.rows[0].project_id;

    const isMember = await checkProjectMember(projectId, req.user.id);

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project"
      });
    }

    if (assigned_to) {
      const assignedMember = await checkProjectMember(
        projectId,
        assigned_to
      );

      if (!assignedMember) {
        return res.status(400).json({
          message: "Assigned user is not a project member"
        });
      }
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           status = COALESCE($4, status),
           assigned_to = $5,
           due_date = $6
       WHERE id = $7
       RETURNING *`,
      [
        title || null,
        description || null,
        priority || null,
        status || null,
        assigned_to || null,
        due_date || null,
        req.params.id
      ]
    );

    res.json({
      message: "Task updated successfully",
      task: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const taskResult = await pool.query(
      "SELECT project_id FROM tasks WHERE id = $1",
      [req.params.id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isMember = await checkProjectMember(
      taskResult.rows[0].project_id,
      req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project"
      });
    }

    await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [req.params.id]
    );

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
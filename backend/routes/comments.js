const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const checkTaskAccess = async (taskId, userId) => {
  const result = await pool.query(
    `SELECT t.id
     FROM tasks t
     JOIN project_members pm ON t.project_id = pm.project_id
     WHERE t.id = $1 AND pm.user_id = $2`,
    [taskId, userId]
  );

  return result.rows.length > 0;
};

router.post("/:taskId", authMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Comment is required"
      });
    }

    const hasAccess = await checkTaskAccess(
      req.params.taskId,
      req.user.id
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this task"
      });
    }

    const result = await pool.query(
      `INSERT INTO comments (task_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.taskId, req.user.id, comment.trim()]
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

router.get("/:taskId", authMiddleware, async (req, res) => {
  try {
    const hasAccess = await checkTaskAccess(
      req.params.taskId,
      req.user.id
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this task"
      });
    }

    const result = await pool.query(
      `SELECT
        c.id,
        c.comment,
        c.created_at,
        u.id AS user_id,
        u.name AS user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.taskId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM comments
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    res.json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;
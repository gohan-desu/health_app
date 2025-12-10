const pool = require('../config/db');

function normalizeDeadline(deadline){
  if (!deadline) return null;
  const d = new Date(deadline);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

//新規タスク作成
async function createTask(description, userId, deadline){
  const normalized = normalizeDeadline(deadline);

  const [result] = await pool.query(
    "INSERT INTO tasks (description, userId, deadline) VALUES (?, ?, ?)",
    [description, userId, normalized]
  );
  return result.insertId;
}

//各ユーザーの全タスク取得
async function getTasksByUserId(userId){
  const [rows] = await pool.query(
    "SELECT * FROM tasks WHERE userId = ? ORDER BY deadline DESC",
    [userId]
  );
  return rows;
}

//タスク削除
async function deleteTaskById(id){
  const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  return result.affectedRows;
}

module.exports = {createTask, getTasksByUserId, deleteTaskById};
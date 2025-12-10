const express = require('express');
const router = express.Router();
const{
    createTask,
    getTasksByUserId,
    deleteTaskById
} = require('../../models/task');
const pool = require('../../config/db');

// 日付を "YYYY-MM-DD" に統一する関数
function normalizeDate(dateValue) {
  if (!dateValue) return null;

  const d = new Date(dateValue);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

//ログインチェック
function isLoggedIn(req, res, next){
  if(req.session && req.session.userId) return next();
  res.status(401).json({ error: 'Unauthorized' });
}
router.use(isLoggedIn);

//新しいタスクを作成
router.post('/', isLoggedIn, async(req, res) =>{
    const{description, deadline} = req.body; //リクエストのボディからタスクの説明と期限を取得
    if(!description) {
        return res.status(400).json({ error: 'Missing description' });
    }

    try{
        const normalizeDeadline = normalizeDate(deadline);

        //既存タスクを削除
        await pool.query(
            "DELETE FROM tasks WHERE userId = ? AND deadline = ?",
            [req.session.userId, normalizeDeadline]
        );

        //新しいタスクを追加
        const id = await createTask(
            description,
            req.session.userId,
            normalizeDeadline
        );

        res.status(201).json({message: 'Task added', id});
    } catch(err){
        console.error(err);
        res.status(500).json({error: 'Failed to add task'});
    }
});

//ユーザーIDに基づきタスクを取得
router.get('/', isLoggedIn, async(req, res) =>{
    try{
        const tasks = await getTasksByUserId(req.session.userId); //ユーザーIDに基づいてタスクを取得

        const fixed = tasks.map(t => ({
            ...t,
            dateKey: normalizeDate(t.deadline)
        }));

        res.status(200).json({tasks: fixed});

        } catch(err){
        console.error(err);
        res.status(500).json({error: 'Failed to retrieve tasks'});
    }
});

// 日付ごとのタスク取得
router.get('/by-date/:date', isLoggedIn, async (req, res) => {
  try {
        const selectedDate = req.params.date; // "2025-12-15" など
        const tasks = await getTasksByUserId(req.session.userId);

        const fixed = tasks.map(t => ({
            ...t,
            dateKey: normalizeDate(t.deadline)
        }));

        const task = fixed.find(t => t.dateKey === selectedDate);
        res.status(200).json(task || null);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve task by date' });
    }
});

//指定されたIDのタスクを削除
router.delete('/:id', async(req, res) =>{
    try{
        await deleteTaskById(req.params.id); //パラメータからタスクIDを取得してタスクを削除
        res.status(200).json({message: 'Task deleted'}); //成功時にステータス２００と成功メッセージを返す
    }
    catch(err){
        res.status(500).json({error: 'Failed to delete task'});
    }
});

module.exports = router;
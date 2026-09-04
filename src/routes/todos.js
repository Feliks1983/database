const { Router } = require("express");

const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo,
  getTodoStats,
  toggleTodo,
} = require("../controllers/todoController");

const router = Router();
let todos = [];
router.get("/", getAllTodos, (req, res) => {
  let filtered = [...todos];

  if (req.query.completed !== undefined) {
    const completed = req.query.completed === "true";
    filtered = filtered.filter((todo) => todo.completed === completed);
  }

  res.json({
    todos: filtered,
    total: todos.length,
    filtered: filtered.length,
  });
});
router.get("/", (req, res) => {
  const { completed } = req.query;
  const total = todos.length;
  let filteredTodos = todos;

  if (completed !== undefined) {
    const completedValue = completed === "true";

    filteredTodos = todos.filter((todo) => {
      return todo.completed === completedValue;
    });
  }

  const filtered = filteredTodos.length;

  res.json({
    todos: filteredTodos,
    total,
    filtered,
  });
});
router.post("/", createTodo, (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      error: "Text is required",
    });
  }

  const newTodo = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    createdAt: new Date(),
  };

  res.status(201).json({
    message: "Todo created successfully",
    newTodo,
  });
});
router.get("/stats", getTodoStats);
router.get("/:id", getTodoById, (req, res) => {
  const { id } = req.params;

  res.json({
    message: "Todo by ID",
    id,
  });
});
router.put("/:id", updateTodo, (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  res.json({
    message: "Todo updated",
    todo: {
      id,
      text,
      completed,
    },
  });
});
router.patch("/:id", patchTodo);
router.patch("/:id/toggle", toggleTodo);
router.delete("/:id", deleteTodo, (req, res) => {
  const { id } = req.params;

  res.json({
    message: "Todo deleted successfully",
    id,
  });
});

module.exports = router;

const { Router} = require("express");
const { getTodos } = require("../models/todos");

const router = Router();
let todos = [];
router.get("/", (req, res) => {
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

router.get("/todos", (req, res) => {
  const result = getTodos({
    offset: Number(req.query.offset) || undefined,
    limit: Number(req.query.limit) || undefined,
    completed:
      req.query.completed === "true"
        ? true
        : req.query.completed === "false"
          ? false
          : undefined,
    priority: req.query.priority,
    search: req.query.search,
    category: req.query.category,
    sort: req.query.sort,
  });
  res.json(result);
});

router.post("/", (req, res) => {
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

module.exports = router;

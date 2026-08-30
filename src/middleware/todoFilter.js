const { Router } = require("express");

const router = Router();
let todos = [];
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

module.exports =  router;

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

router.get("/", getAllTodos);
router.post("/", createTodo);
router.get("/stats", getTodoStats);
router.get("/:id", getTodoById);
router.put("/:id", updateTodo);
router.patch("/:id", patchTodo);
router.patch("/:id/toggle", toggleTodo);
router.delete("/:id", deleteTodo);

module.exports = router;

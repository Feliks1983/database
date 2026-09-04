const {
  getTodos,
  getTodoById: findTodoById,
  createTodo: createTodoService,
  updateTodo: updateTodoService,
  deleteTodo: deleteTodoService,
  getStats,
} = require("../models/Todo");

const { ObjectId } = require("mongodb");

const getAllTodos = async (req, res, next) => {
  try {
    const offset = Number(req.query.offset) || 1;
    const limit = Number(req.query.limit) || 10;

    const completed =
      req.query.completed !== undefined
        ? req.query.completed === "true"
        : undefined;

    const priority =
      req.query.priority !== undefined ? req.query.priority : undefined;

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;

    const sort =
      typeof req.query.sort === "string" ? req.query.sort : undefined;

    const result = await getTodos({
      offset,
      limit,
      completed,
      priority,
      search,
      category,
      sort,
    });

    return res.status(200).json({
      todos: result.todos,
      total: result.total,
      filtered: result.filtered,
    });
  } catch (error) {
    next(error);
  }
};

const getTodoById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid todo ID" });
    }

    const todo = await findTodoById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found",
      });
    }

    return res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

const createTodo = async (req, res, next) => {
  try {
    if (
      !req.body.text ||
      typeof req.body.text !== "string" ||
      !req.body.text.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Title is required and must be a non-empty string",
      });
    }
    const todo = await createTodoService({
      text: req.body.text,
      description: req.body.description,
      priority: req.body.priority,
      category: req.body.category,
      dueDate: req.body.dueDate || undefined,
      tags: req.body.tags,
    });

    return res.status(201).json({
      success: true,
      data: todo,
      message: "Todo created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateTodo = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid todo ID" });
    }

    const todo = await updateTodoService(id, {
      text: req.body.text,
      description: req.body.description,
      completed: req.body.completed,
      priority: req.body.priority,
      category: req.body.category,
      dueDate: req.body.dueDate || undefined,
      tags: req.body.tags,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

const patchTodo = async (req, res, next) => {
  try {
    const fields = [
      "text",
      "description",
      "completed",
      "priority",
      "category",
      "dueDate",
      "tags",
    ];

    const hasFields = fields.some((field) => req.body[field] !== undefined);

    if (!hasFields) {
      return res.status(400).json({
        success: false,
        error: "At least one field is required",
      });
    }

    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid todo ID" });
    }

    const todo = await updateTodoService(id, {
      text: req.body.text,
      description: req.body.description,
      completed: req.body.completed,
      priority: req.body.priority,
      category: req.body.category,
      dueDate: req.body.dueDate || undefined,
      tags: req.body.tags,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid todo ID" });
    }

    const deleted = await deleteTodoService(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Todo not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getTodoStats = async (req, res, next) => {
  try {
    const stats = await getStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const toggleTodo = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid todo ID" });
    }

    const existing = await findTodoById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Todo not found",
      });
    }

    const todo = await updateTodoService(id, {
      completed: !existing.completed,
    });

    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo,
  getTodoStats,
  toggleTodo,
};

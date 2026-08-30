const { ObjectId } = require("mongodb");
const { getTodosCollection } = require("../config/database");

const Priority = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

const toApiTodo = (doc) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
};

const getTodos = async (options) => {
  const {
    offset = 1,
    limit = 10,
    completed,
    priority,
    search,
    category,
    sort,
  } = options;

  const collection = getTodosCollection();
  const filter = {};

  if (completed !== undefined) filter.completed = completed;
  if (priority !== undefined) filter.priority = priority;
  if (category !== undefined) {
    filter.category = { $regex: `${category.trim()}`, $options: "i" };
  }
  if (search) {
    filter.text = { $regex: search.trim(), $options: "i" };
  }

  const total = await collection.countDocuments({});
  const filteredCount = await collection.countDocuments(filter);

  let cursor = collection.find(filter);

  if (sort) {
    const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
    const sortDirection = sort.startsWith("-") ? -1 : 1;
    cursor = cursor.sort({ [sortField]: sortDirection });
  }

  const skip = (offset - 1) * limit;
  const docs = await cursor.skip(skip).limit(limit).toArray();

  return {
    todos: docs.map(toApiTodo),
    total,
    filtered: filteredCount,
  };
};

const getTodoById = async (id) => {
  if (!ObjectId.isValid(id)) return null;

  const collection = getTodosCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return toApiTodo(doc);
};

const createTodo = async (input) => {
  const collection = getTodosCollection();

  const todo = {
    text: input.text.trim(),
    description: input.description?.trim() || undefined,
    completed: false,
    priority: input.priority || Priority.Medium,
    category: input.category?.trim() || undefined,
    dueDate: input.dueDate || undefined,
    createdAt: new Date().toISOString(),
    tags: Array.isArray(input.tags)
      ? input.tags.map((tag) => tag.trim()).filter(Boolean)
      : [],
  };

  const result = await collection.insertOne(todo);
  return toApiTodo({ _id: result.insertedId, ...todo });
};

const updateTodo = async (id, input) => {
  if (!ObjectId.isValid(id)) return null;

  const collection = getTodosCollection();
  const updates = {};

  if (input.text !== undefined) updates.text = input.text.trim();
  if (input.completed !== undefined) updates.completed = input.completed;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.category !== undefined)
    updates.category = input.category.trim() || undefined;
  if (input.dueDate !== undefined) updates.dueDate = input.dueDate || undefined;
  if (input.tags !== undefined) {
    updates.tags = input.tags.map((tag) => tag.trim()).filter(Boolean);
  }

  updates.updatedAt = new Date().toISOString();

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );

  return toApiTodo(result);
};

const deleteTodo = async (id) => {
  if (!ObjectId.isValid(id)) return false;

  const collection = getTodosCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
};

const getStats = async () => {
  const collection = getTodosCollection();

  const total = await collection.countDocuments({});
  const completed = await collection.countDocuments({ completed: true });
  const pending = total - completed;
  const low = await collection.countDocuments({ priority: Priority.Low });
  const medium = await collection.countDocuments({ priority: Priority.Medium });
  const high = await collection.countDocuments({ priority: Priority.High });

  return {
    total,
    completed,
    pending,
    byPriority: { low, medium, high },
  };
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getStats,
};

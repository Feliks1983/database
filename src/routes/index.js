const { Router } = require("express");
const todosRouter = require("./todos");

const router = Router();

router.use("/todos", todosRouter);

module.exports = router;

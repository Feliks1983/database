const { Router} = require("express");

const router = Router();

router.put("/:id", (req, res) => {
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

module.exports = router;

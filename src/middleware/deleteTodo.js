const { Router } = require("express");

const router = Router();

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    message: "Todo deleted successfully",
    id,
  });
});

module.exports = router;

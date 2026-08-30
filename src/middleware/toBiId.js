const { Router } = ("express");

const router = Router();

router.get("/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    message: "Todo by ID",
    id,
  });
});

module.exports = router;

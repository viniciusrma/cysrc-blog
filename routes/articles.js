const express = require("express");
const router = express.Router();

router.get("/blog", (req, res) => {
  res.render("In articles");
});

module.exports = router;

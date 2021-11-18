const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('In articles')
})

module.exports = router;

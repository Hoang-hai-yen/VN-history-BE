const express = require("express");

const router = express.Router();

router.use("/auth",       require("./auth.routes"));
router.use("/articles",   require("./article.routes"));
router.use("/dynasties",  require("./dynasty.routes"));
router.use("/categories", require("./category.routes"));
router.use("/reports",    require("./report.routes"));

module.exports = router;

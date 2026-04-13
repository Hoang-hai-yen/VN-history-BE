const express = require("express");

const router = express.Router();

router.use("/auth",       require("./auth.routes"));
router.use("/articles",   require("./article.routes"));
router.use("/dynasties",  require("./dynasty.routes"));
router.use("/categories", require("./category.routes"));
router.use("/reports",    require("./report.routes"));
router.use("/timeline",   require("./timeline.routes"));

// Admin sub-routers (paths are /admin/admins, /admin/logs, /admin/settings, /admin/permissions)
router.use("/admin/admins",       require("./admin.routes"));
router.use("/admin/logs",         require("./log.routes"));
router.use("/admin/settings",     require("./settings.routes"));
router.use("/admin/permissions",  require("./permission.routes"));

module.exports = router;

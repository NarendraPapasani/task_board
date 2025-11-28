const { RegisterAuth, LoginAuth } = require("../controllers/auth.controller");

const router = require("express").Router();

router.post("/register", RegisterAuth);
router.post("/login", LoginAuth);

module.exports = router;

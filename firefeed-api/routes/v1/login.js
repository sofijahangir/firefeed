const express           = require("express");
const router            = express.Router();

const loginController   = require('../../controllers/v1/login');
 
// ================= BACKOFFICE ===================== //
// POST calls
router.post("/adminlogin", loginController.adminLogin);

// ================= CLIENT ===================== //
// GET calls

// POST calls
router.post("/login", loginController.login);
router.post("/register", loginController.register);

module.exports  =   router; 
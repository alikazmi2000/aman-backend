const menuCtrl = require('../../controllers/menu');
const express = require('express');
const router = express.Router();




/*
 * Get active menuu route
 */
router.get(
  '/',
  menuCtrl.getAllItems
);


module.exports = router;

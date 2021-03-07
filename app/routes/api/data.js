const dataCtrl = require('../../controllers/data');
const express = require('express');
const router = express.Router();




/*
 * Get active menuu route
 */
router.get(
  '/country',
  dataCtrl.getCountryList
);

router.get(
  '/state',
  dataCtrl.getStateList
);




module.exports = router;

const brandCtrl = require('../../controllers/brand');
const express = require('express');
const router = express.Router();




/*
 * Get active menuu route
 */
router.get(
  '/',
  brandCtrl.getAllItems
);


/*
 * Get active menuu route
 */
router.get(
  '/images',
  brandCtrl.getAllItemsWithImage
);

router.get(
  '/have-images',
  brandCtrl.getAllItemHaveImage
);



module.exports = router;

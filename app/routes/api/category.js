const categoryCtrl = require('../../controllers/category');
const categoryValidate = require('../../validations/category.validate');

const express = require('express');
const router = express.Router();

/*
 * Get active menuu route
 */
router.get(
  '/',
  categoryCtrl.getAllItems
);



/*
 * Get active menuu route
 */
router.get(
  '/tree',
  categoryCtrl.getAllItemsWithParents
);



router.get(
  '/drop-down',
  categoryCtrl.getAllItemsDropDown
);




// /*
//  * Get items route
//  */
// router.get(
//   '/',
//   //requireAuth,
//   //userCtrl.roleAuthorization([Roles.Admin]),
//   trimRequest.all,
//   menuCtrl.getItems
// );


// Add Category
// List Single category
// Update Category
// Delete Category

module.exports = router;

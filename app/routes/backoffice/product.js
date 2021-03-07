const productCtrl = require('../../controllers/product');
const productValidate = require('../../validations/products.validate');
const express = require('express');
const router = express.Router();

require('../../../config/passport');
const passport = require('passport');
const { authorized } = require('../../middleware/utils');
const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user) => {
    return await authorized(req, res, next, err, user);
  })(req, res, next);
};
const trimRequest = require('trim-request');
/*
 * Post product route
 */
router.get(
  '/',
  requireAuth,
  //productValidate.getAllItems,
  productCtrl.getAllItemsBO
);

router.get(
  '/search-autocomplete',
  requireAuth,
  productCtrl.getAutoCompleteSearch
);

router.get(
  '/:id',
  requireAuth,
  productValidate.getItem,
  productCtrl.getItemBO
);

router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  productValidate.deleteItem,
  productCtrl.deleteItem
);





// /*
//  * Get item route
//  */
// router.get(
//   '/:id',
//   //requireAuth,
//   //userCtrl.roleAuthorization([Roles.Admin]),
//   brandValidate.getItem,
//   trimRequest.all,
//   brandCtrl.getItem
// );

/*
 * Create new item route
 */
router.post(
  '/',
  // '/create-product',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  productValidate.createItem,
  productCtrl.createItem
);


/*
 * inventory item route
 */
// router.post(
//   '/inventory',
//   trimRequest.all,
//   productValidate.inventoryUpdate,
//   productCtrl.inventoryUpdate
// );


/*
 * Update item route
 */
router.put(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  productValidate.updateItem,
  productCtrl.updateItem
);





/*
 * Get item route
 */
router.get(
  '/sku-exists/:sku',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  productValidate.getSkuExists,
  productCtrl.getSkuExists
);



module.exports = router;

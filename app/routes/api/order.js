const orderCtrl = require('../../controllers/order');
const orderValidate = require('../../validations/order.validate');
const userCtrl = require('../../controllers/users');
const { Roles } = require('../../enums');
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
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  orderCtrl.getItems
);

/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  orderValidate.getItem,
  trimRequest.all,
  orderCtrl.getItem
);

/*
 * Create new item route
 */
router.post(
  '/',
  //requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  orderValidate.createItem,
  orderCtrl.createItem
);

router.post(
  '/confirm-order',
  //requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  //orderValidate.createItem,
  orderCtrl.confirmOrder
);


router.post(
  '/delete-order',
  //requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
 // orderValidate.createItem,
  orderCtrl.deleteOrder
);


/*
 * Update item route
 */
router.put(
  '/:id',
  //requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  orderValidate.updateItem,
  orderCtrl.updateItem
);

/*
 * Delete item route
 */
router.delete(
  '/:id',
  //requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  orderValidate.deleteItem,
  orderCtrl.deleteItem
);





/*
 * Get item availability route
 */
router.get(
  '/details/:order_no',
  //requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  orderValidate.getItemDetails,
  orderCtrl.getItemDetails
);


module.exports = router;

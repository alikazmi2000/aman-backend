const shippingCtrl = require('../../controllers/shipping');
const shippingValidate = require('../../validations/shipping.validate');

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
 * Post category route
 */
router.get(
  '/',
  requireAuth,
  //productValidate.getAllItems,
  shippingCtrl.getAllItemsBO
);




/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  shippingValidate.getItem,
  trimRequest.all,
  shippingCtrl.getItem
);

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  shippingValidate.createItem,
  shippingCtrl.createItem
);


/*
 * Update item route
 */
router.put(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  shippingValidate.updateItem,
  shippingCtrl.updateItem
);

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  shippingValidate.deleteItem,
  shippingCtrl.deleteItem
);




module.exports = router;

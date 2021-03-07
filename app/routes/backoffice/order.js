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
 * Post product route
 */
router.get(
  '/',
  requireAuth,
  //productValidate.getAllItems,
  orderCtrl.getAllItemsBO
);

// router.get(
//   '/search-autocomplete',
//   productCtrl.getAutoCompleteSearch
// );

// router.get(
//   '/:id',
//   productValidate.getItem,
//   productCtrl.getItem
// );


/*
 * Get item availability route
 */
router.get(
  '/details/:order_no',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  orderValidate.getItemDetails,
  orderCtrl.getItemDetails
);



/*
 * Get item availability route
 */
router.post(
  '/change-status/:order_no',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  orderValidate.changeStatus,
  orderCtrl.changeStatus
);



module.exports = router;

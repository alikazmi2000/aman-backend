const customerCtrl = require('../../controllers/customers');
const customerValidate = require('../../validations/customers.validate');
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
 * Post customer route
 */
router.get(
  '/all',
  requireAuth,
  //customerValidate.getAllItems,
  customerCtrl.getAllItemsBO
);

router.get(
    '/details/:id',
    requireAuth,
    //userCtrl.roleAuthorization([Roles.Admin]),
    trimRequest.all,
    customerValidate.getItem,
    customerCtrl.getItemDetails
  );

// router.get(
//   '/:id',
//   customerValidate.getItem,
//   customerCtrl.getItemBO
// );

router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  customerValidate.deleteItem,
  customerCtrl.deleteItem
);

router.delete(
    '/blocked/:id',
    requireAuth,
    //userCtrl.roleAuthorization([Roles.Admin]),
    trimRequest.all,
    customerValidate.deleteItem,
    customerCtrl.blockedItem
  );
  
  router.delete(
    '/unblocked/:id',
    requireAuth,
    //userCtrl.roleAuthorization([Roles.Admin]),
    trimRequest.all,
    customerValidate.deleteItem,
    customerCtrl.unBlockedItem
  );




module.exports = router;

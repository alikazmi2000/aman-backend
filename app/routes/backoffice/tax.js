const taxCtrl = require('../../controllers/tax');
const taxValidate = require('../../validations/tax.validate');

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
  taxCtrl.getAllItemsBO
);




/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  taxValidate.getItem,
  trimRequest.all,
  taxCtrl.getItem
);

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  taxValidate.createItem,
  taxCtrl.createItem
);


/*
 * Update item route
 */
router.put(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  taxValidate.updateItem,
  taxCtrl.updateItem
);

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  taxValidate.deleteItem,
  taxCtrl.deleteItem
);




module.exports = router;

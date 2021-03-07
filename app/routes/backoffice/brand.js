const brandCtrl = require('../../controllers/brand');
const brandValidate = require('../../validations/brand.validate');

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
  brandCtrl.getAllItemsBO
);


router.get(
  '/all',
   requireAuth,
  brandCtrl.getAllItems
);



/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  brandValidate.getItem,
  trimRequest.all,
  brandCtrl.getItem
);

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  brandValidate.createItem,
  brandCtrl.createItem
);


/*
 * Update item route
 */
router.put(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  brandValidate.updateItem,
  brandCtrl.updateItem
);

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  brandValidate.deleteItem,
  brandCtrl.deleteItem
);




module.exports = router;

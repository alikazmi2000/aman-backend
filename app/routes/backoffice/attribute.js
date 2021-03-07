const attributeCtrl = require('../../controllers/attribute');
const attributeValidate = require('../../validations/attribute.validate');

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
  '/all',
  requireAuth,
  //productValidate.getAllItems,
  attributeCtrl.getAllItems
);


router.get(
  '/',
  requireAuth,
  //productValidate.getAllItems,
  attributeCtrl.getAllItemsBO
);



/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  attributeValidate.getItem,
  trimRequest.all,
  attributeCtrl.getItem
);

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  attributeValidate.createItem,
  attributeCtrl.createItem
);


/*
 * Update item route
 */
router.put(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  attributeValidate.updateItem,
  attributeCtrl.updateItem
);

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  attributeValidate.deleteItem,
  attributeCtrl.deleteItem
);




module.exports = router;

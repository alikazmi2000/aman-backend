const countryController = require('../../controllers/country');
const countryValidator = require('../../validations/country.validate');

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
  countryController.getAllItemsBO
);




/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  countryValidator.getItem,
  trimRequest.all,
  countryController.getItem
);

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  countryValidator.createItem,
  countryController.createItem
);


/*
 * Update item route
 */
router.put(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  countryValidator.updateItem,
  countryController.updateItem
);

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  countryValidator.deleteItem,
  countryController.deleteItem
);




module.exports = router;

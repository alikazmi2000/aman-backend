const categoryCtrl = require('../../controllers/category');
const categoryValidate = require('../../validations/category.validate');


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
  categoryCtrl.getAllItemsBO
);

// router.get(
//   '/search-autocomplete',
//   productCtrl.getAutoCompleteSearch
// );

router.get(
  '/drop-down',
  requireAuth,
  categoryCtrl.getAllItemsDropDown
);

/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  categoryValidate.getItem,
  trimRequest.all,
  categoryCtrl.getItem
);

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  categoryValidate.createItem,
  categoryCtrl.createItem
);


/*
 * Update item route
 */
router.put(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  categoryValidate.updateItem,
  categoryCtrl.updateItem
);

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  //userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  categoryValidate.deleteItem,
  categoryCtrl.deleteItem
);



module.exports = router;

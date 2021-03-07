const contactCtrl = require('../../controllers/contact');
const contactValidate = require('../../validations/contact.validate');
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
  contactCtrl.getAllItemsBO
);



router.get(
    '/:id',
    requireAuth,
    contactValidate.getItem,
    contactCtrl.getItemDetails
  );






module.exports = router;

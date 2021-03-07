const customerCtrl = require('../../controllers/customers');
const customerValidate = require('../../validations/customers.validate');

const { Roles } = require('../../enums');
const express = require('express');
const router = express.Router();
require('../../../config/passport');
const passport = require('passport');
const { authorizedCustomer } = require('../../middleware/utils');
const requireAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user) => {
        return await authorizedCustomer(req, res, next, err, user);
    })(req, res, next);
};
const trimRequest = require('trim-request');
/*
 *******************
 * customer routes
 *******************
 */


router.get(
    '/customer-validate_token',
    requireAuth,
    customerCtrl.roleAuthorization([Roles.Customer]),
    trimRequest.all,
    customerCtrl.validateTokenAndReturnCustomer
);

/*
 * Customer login route
 */
router.post(
    // '/customer-login',
    '/login',
    trimRequest.all,
    customerValidate.login,
    customerCtrl.login
);

/*
 * Signup route
 */
router.post(
    '/signup',
    customerValidate.signup,
    customerCtrl.signUp
);


/*
 * Customer forgot password route
 */
router.post(
    '/forgot-password',
    trimRequest.all,
    customerValidate.forgotPassword,
    customerCtrl.forgotPassword
);


/*
 * Verify Phone route
 */
router.post(
    '/customer-verify-phone',
    trimRequest.all,
    customerValidate.verifyPhone,
    customerCtrl.verifyPhone
);


/*
 * Verify OTP code route
 */
router.post(
    '/customer-verify-otp-code',
    trimRequest.all,
    customerValidate.verifyOTPCode,
    customerCtrl.verifyOTPCode
);





/*
* Logout route
*/
router.get(
    '/logout',
    requireAuth,
    trimRequest.all,
    customerCtrl.logout
);

/*
 * add address route
 */
router.post(
    '/address',
    requireAuth,
    customerValidate.addAddress,
    customerCtrl.addAddress
);

/*
 * add address route
 */
router.get(
    '/address',
    requireAuth,
    customerCtrl.getAdressList
);


/*
 * add address route
 */
router.put(
    '/default-address/:id',
    requireAuth,
    customerValidate.updateDefaultAddress,
    customerCtrl.updateDefaultAddress
);

/*
 * add address route
 */
router.delete(
    '/address/:id',
    requireAuth,
    customerValidate.deleteAddress,
    customerCtrl.deleteAddress
);



/*
 * Get nearby Merchants
 */
router.get(
    '/profile',
    requireAuth,
    customerCtrl.getProfile
);

/*
 * update profile route
 */
router.put(
    '/profile',
    requireAuth,
    customerValidate.updateProfile,
    customerCtrl.updateProfile
);


/*
 * Change Password route
 */
router.put(
    '/change_password',
    requireAuth,
    trimRequest.all,
    customerValidate.changePassword,
    customerCtrl.changePassword
);




/*
 ************************
 * User cards routes
 ************************
 */

/*
 * Get cards route
 */
router.get(
    '/cards',
    requireAuth,
    trimRequest.all,
    customerCtrl.getCards
);

/*
 * Create new card route
 */
router.post(
    '/cards',
    requireAuth,
    trimRequest.all,
    customerValidate.createCard,
    customerCtrl.createCard
);

// customerValidate
// customerCtrl


/*
 * Get card route
 */
router.get(
    '/cards/:id',
    requireAuth,
    trimRequest.all,
    customerValidate.getCard,
    customerCtrl.getCard
);

/*
 * Update card route
 */
router.put(
    '/cards/:id',
    requireAuth,
    trimRequest.all,
    customerValidate.updateCard,
    customerCtrl.updateCard
);

/*
 * Delete card route
 */
router.delete(
    '/cards/:id',
    requireAuth,
    trimRequest.all,
    customerValidate.deleteCard,
    customerCtrl.deleteCard
);




// /*
//  * Send verification code route
//  */
// router.post('/verify_email', requireAuth, trimRequest.all, customerCtrl.sendVerificationCode);

// /*
//  * Verify email code route
//  */
// router.post(
//   '/verify_email_code',
//   requireAuth,
//   trimRequest.all,
//   customerValidate.verifyEmailCode,
//   customerCtrl.verifyEmail
// );

module.exports = router;

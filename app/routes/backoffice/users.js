const userCtrl = require('../../controllers/users');
const userValidate = require('../../validations/users.validate');
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
 ******************
 * User Auth routes
 ******************
 */

router.get(
  '/validate_token',
  requireAuth,
  userCtrl.roleAuthorization([Roles.Admin]),
  trimRequest.all,
  userCtrl.validateTokenAndReturnUser
);

/*
 * SignUp route
 */
router.post(
  '/signup',
  trimRequest.all,
  userValidate.signup,
  userCtrl.signUp
);

/*
 * Verify Phone route
 */
router.post(
  '/verify_phone',
  trimRequest.all,
  userValidate.verifyPhone,
  userCtrl.verifyPhone
);


/*
 * Verify OTP code route
 */
router.post(
  '/verify_otp_code',
  trimRequest.all,
  userValidate.verifyOTPCode,
  userCtrl.verifyOTPCode
);


/*
 * Send verification code route
 */
router.post(
  '/verify_email',
  requireAuth,
  trimRequest.all,
  userCtrl.sendVerificationCode
);

/*
* Verify email code route
*/
router.post(
  '/verify_email_code',
  requireAuth,
  trimRequest.all,
  userValidate.verifyEmailCode,
  userCtrl.verifyEmail
);

// /*
//  * Login with phone route
//  */
// router.post(
//   '/login_with_phone',
//   trimRequest.all,
//   userValidate.loginPhone,
//   userCtrl.login
// );

/*
 * Login with phone route
 */
router.post(
  '/login',
  trimRequest.all,
  userValidate.login,
  userCtrl.login
);





/*
 * Logout route
 */
router.get(
  '/logout',
  requireAuth,
  // userCtrl.roleAuthorization(Object.values(Roles)),
  trimRequest.all,
  userCtrl.logout
);





/*
 * Login with phone route
 */
router.post(
  '/login_with_phone',
  trimRequest.all,
  userValidate.loginPhone,
  userCtrl.login
);

// /*
//  * Update user route
//  */
// router.post(
//   '/update_user',
//   requireAuth,
//   userCtrl.roleAuthorization([Roles.Admin, Roles.Manager, Roles.Requester, Roles.Provider]),
//   trimRequest.all,
//   userValidate.updateUser,
//   userCtrl.updateUser
// );

// /*
//  * Updating user status
//  */
// router.post(
//   '/update_status',
//   requireAuth,
//   // userCtrl.roleAuthorization([Roles.Admin]),
//   trimRequest.all,
//   userValidate.updateUserStatus,
//   userCtrl.updateUserStatus
// );

// /*
//  * Forget Password with email route
//  */
// router.post(
//   '/forgot_password_by_email',
//   trimRequest.all,
//   userValidate.forgetPasswordEmail,
//   userCtrl.forgotPassword
// );

// /*
//  * Forget Password with phone number route
//  */
// router.post(
//   '/forgot_password',
//   trimRequest.all,
//   userValidate.forgetPassword,
//   userCtrl.forgotPassword
// );

/*
 * Change Password route
 */
router.post(
  '/change_password',
  requireAuth,
  trimRequest.all,
  userValidate.changePassword,
  userCtrl.changePassword
);

// /*
//  * Verify Phone route
//  */
// // router.post('/verify_phone', trimRequest.all, userValidate.verifyPhone, userCtrl.verifyPhone);

// /*
//  * Verify OTP code route
//  */
// router.post(
//   '/verify_otp_code',
//   trimRequest.all,
//   userValidate.verifyOTPCode,
//   userCtrl.verifyOTPCode
// );



/*
 * Get nearby Merchants
 */
router.get(
  '/profile',
  requireAuth,
  userCtrl.getProfile
);

/*
 * update profile route
 */
router.put(
  '/profile',
  requireAuth,
  userValidate.updateProfile,
  userCtrl.updateProfile
);





module.exports = router;

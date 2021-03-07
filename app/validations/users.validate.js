const {
  validationResult,
  isValidDateAndTime,
  isFileExistsOnAWSValidator,
  joiValidation
} = require('../middleware/utils');
const commonValidation = require('./common.validate');
const { check, oneOf } = require('express-validator');
const { Roles, Status } = require('../enums');
const PASSWORD_MIN_LENGTH = process.env.PASSWORD_MIN_LENGTH;

const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

exports.signup = [
  ...commonValidation.user,
  check('password')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isLength({
      min: PASSWORD_MIN_LENGTH
    })
    .withMessage('PASSWORD_TOO_SHORT_MIN_5'),
  // check('role')
  //   .exists()
  //   .withMessage('MISSING')
  //   .not()
  //   .isEmpty()
  //   .withMessage('IS_EMPTY')
  //   .isIn([Roles.Seeker, Roles.Giver])
  //   .withMessage('ERROR.INCORRECT_ROLE'),
  check('profile_picture')
    .optional()
    .custom(async value => {
      return await isFileExistsOnAWSValidator(value);
    }),
  check('otp_token')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
check('phone')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
check('country_code')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];

/**
 * Validates verify Phone request
 */
exports.verifyPhone = [
  check('phone')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('country_code')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];


/**
 * Validates verify OTP code request
 */
exports.verifyOTPCode = [
  check('phone')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('country_code')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('code')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];


/**
 * Email verification code
 */
exports.verifyEmailCode = [
  check('verification_code')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];

/**
 * Validates login with phone request
 */
exports.login = [
  // check('phone_number')
  //   .exists()
  //   .withMessage('MISSING')
  //   .not()
  //   .isEmpty()
  //   .withMessage('IS_EMPTY'),
  check('email')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('password')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isLength({
      min: 5
    }),
  // check('role')
  //   .exists()
  //   .withMessage('MISSING')
  //   .not()
  //   .isEmpty()
  //   .withMessage('IS_EMPTY')
  //   .isIn(Object.values(Roles))
  //   .withMessage('ERROR.INCORRECT_ROLE'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];




/**
 * Validates login with phone request
 */
exports.loginPhone = [
  check('phone_number')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('password')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isLength({
      min: 5
    }),
  check('role')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isIn(Object.values(Roles))
    .withMessage('ERROR.INCORRECT_ROLE'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];





/**
 * Update user status e.g. block or active
 */
exports.updateUserStatus = [
  check('user_id')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('status')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isIn([Status.Active, Status.Blocked])
    .withMessage('ERROR.INCORRECT_STATUS'),
  check('role')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isIn([Roles.Requester, Roles.Provider, Roles.Manager])
    .withMessage('ERROR.INCORRECT_ROLE'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];




/**
 * Forget Password with email
 */
exports.forgetPasswordEmail = [
  check('email')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isEmail()
    .withMessage('EMAIL_IS_NOT_VALID'),
  check('role')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isIn([Roles.Requester, Roles.Provider, Roles.Manager])
    .withMessage('ERROR.INCORRECT_ROLE'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];




/**
 * Forget Password with phone number
 */
exports.forgetPassword = [
  check('phone_number')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('role')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isIn([Roles.Requester, Roles.Provider, Roles.Manager])
    .withMessage('ERROR.INCORRECT_ROLE'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];

/**
 * Change Password
 */
exports.changePassword = [
  check('old_password')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('password')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isLength({
      min: PASSWORD_MIN_LENGTH
    })
    .withMessage('PASSWORD_TOO_SHORT_MIN_5'),
  (req, res, next) => {
    validationResult(req, res, next);
  }
];




let updateProfileFields = {
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  phone: Joi.string().optional(),
  country_code: Joi.string().optional(),
  email: Joi.string().email().lowercase().optional(),
  img: Joi.string().optional(),
}

exports.updateProfile = (req, res, next) => {
  try {
    const schema = Joi.object(updateProfileFields);
    const { value, meta } = joiValidation(req.body, schema, 'updateProfile');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    console.log(error)
    return res.status(400).send({ meta: error });
  }
}



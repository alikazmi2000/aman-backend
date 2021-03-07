const moment = require('moment');
const zipcodes = require('zipcodes');
const utils = require('../middleware/utils');
const { Roles, ErrorCodes, Status } = require('../enums/index')
const { matchedData } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../middleware/db');
const usersService = require('../services/Users');
const User = require('../models/user')
const Otp = require('../models/otp')

exports.signUp = async (req, res) => {
    try {
        let data = matchedData(req);
        // Check if email already exists
        if (typeof data.email !== 'undefined')
            await usersService.emailExists(data.email);
        let phoneObj;
        console.log(data)
        // if (typeof data.phone_number !== 'undefined') {
        //     data = await utils.splitPhoneNumber(data);
        //     phoneObj = {
        //         country_code: data.country_code,
        //         phone_number: data.phone_number
        //     };
        //     await usersService.phoneExists(phoneObj);
        // }
        phoneObj = {
            country_code: data.country_code,
            phone: data.phone_number
        };
        await usersService.phoneExists(phoneObj);
        
        // Check if otp token is valid
        // await usersService.OTPTokenIsValid(data);

        // Creating a new User
        const userObj = usersService.setSignUpRequest(data);
        const item = await db.createItem(userObj, User);
        console.log(item);
        // Getting User's data for the response
        // const user = await db.getItem(item._id, User);
        const info = utils.setInfo(item, usersService.resUser);
        const token = await usersService.returnSignupToken(item, data.role);
        if (typeof data.phone !== 'undefined') {
            // Removing Otp Token
            await db.deleteItemsByQuery(
                {
                    ...phoneObj,
                    token: data.otp_token
                },
                Otp
            );
        }
        let successMsg = 'USER.SIGNUP_SUCCESS';
        utils.handleSuccess(res, successMsg, info, token);
    } catch (error) {
        console.log(error)
        utils.handleError(req, res, error, 'USER.SIGNUP_ERROR');
    }
};
/**
 * Verify Phone function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verifyPhone = async (req, res) => {
    try {
        let data = matchedData(req);
        // data = await utils.splitPhoneNumber(data);
        const phoneObj = {
            country_code: data.country_code,
            phone: data.phone
        };
        // const phoneObj = {
        //     country_code: data.country_code,
        //     phone_number: data.phone_number
        // };
        // await usersService.phoneExists(phoneObj);
        data.code = utils.randomNum();
        const body = utils.localeMsg('USER.OTP_SMS_MESSAGE_BODY', { code: data.code });
        data.expiry = moment()
            .add(process.env.OTP_EXPIRATION_IN_MINUTES, 'minutes')
            .toISOString();
        const query = phoneObj;
        const optExists = await db.getItemByQuery(query, Otp, false);
        // Delete all previous OTPs against this number
        if (optExists) {
            await db.deleteItemsByQuery(query, Otp);
        }
        const otp = usersService.setOTPItem(data);
        await db.createItem(otp, Otp);
        // Sending message to user with code
        //   await utils.sendSMS(phoneObj, 'OTP Code', body);

        const info = {};
        if (process.env.NODE_ENV === 'test') {
            info.code = data.code;
        }

        utils.handleSuccess(res, 'USER.OTP_SENT', info);
    } catch (error) {
        utils.handleError(req, res, error);
    }
};


/**
 * Verify OTP Code function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verifyOTPCode = async (req, res) => {
    try {
        let data = matchedData(req);
        // data = await utils.splitPhoneNumber(data);
        // const phoneObj = {
        //     country_code: data.country_code,
        //     phone_number: data.phone_number
        // };
        const phoneObj = {
            country_code: data.country_code,
            phone: data.phone
        };
        const query = { ...phoneObj, code: data.code };
        const token = utils.randomCharacters();

        // TODO: Remove It after some time
        if (
            (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'local') &&
            data.code === '101010'
        ) {
            await db.updateItemsByQuery({ ...phoneObj }, Otp, { token });
        } else {
            const doesCodeExists = await db.getItemByQuery(query, Otp, false);
            if (!doesCodeExists) {
                utils.handleError(
                    req,
                    res,
                    utils.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'USER.OTP_EXPIRED' })
                );
                return;
            }
            await usersService.OTPIsExpired(doesCodeExists);
        }

        await db.updateItemByQuery(query, Otp, { token });
        utils.handleSuccess(res, 'USER.OTP_VERIFIED', {}, token);
    } catch (error) {
        // Setting actual message for the api consumer
        if (error.message === 'ERROR.ITEM_NOT_FOUND') {
            error.message = 'USER.OTP_FAILED_TO_MATCH';
        }
        utils.handleError(req, res, error);
    }
};

/**
 * Sending verification code
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.sendVerificationCode = async (req, res) => {
    try {
        const userId = utils.getAuthUserId(req);
        req.code = utils.randomNum();
        req.expiry = moment().add(process.env.EMAIL_EXPIRATION_IN_MINUTES, 'minutes');
        req.userId = userId;
        const query = {
            $set: {
                email_confirmation_code: req.code,
                email_confirmation_code_expiry: req.expiry,
                is_email_verified: false
            }
        };
        const item = await db.updateItem(userId, User, query);
        if (typeof item.email === 'undefined')
            utils.handleError(req, res, {}, 'USER.EMAIL_NOT_EXIST');
        else {
            usersService.sendSignUpEmail({
                email: item.email,
                first_name: item.first_name,
                verification_code: req.code
            });
            let info;
            if (process.env.NODE_ENV === 'test') {
                info = { code: req.code };
            } else {
                info = utils.setInfo(item, usersService.resUserBasic);
            }
            utils.handleSuccess(res, 'USER.VERIFICATION_CODE_SUCCESS', info);

        }
    } catch (error) {
        utils.handleError(req, res, error, 'USER.VERIFICATION_CODE_ERROR');
    }
};

/**
 * Verify email code
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verifyEmail = async (req, res) => {
    try {
        const userId = utils.getAuthUserId(req);
        const data = matchedData(req);
        const user = await db.getItem(userId, User);
        const currentTime = moment();

        if (user.is_email_verified) {
            utils.handleSuccess(res, 'USER.EMAIL_ALREADY_VERIFIED', {});
            return;
        }
        if (
            !(
                data.verification_code === user.email_confirmation_code &&
                user.email_confirmation_code_expiry > currentTime
            )
        ) {
            utils.handleError(
                req,
                res,
                utils.buildErrObject({
                    ...ErrorCodes.INTERNAL_SERVER_ERROR,
                    message: 'USER.VERIFICATION_CODE_EXPIRED_INVALID'
                })
            );
            return;
        }

        // Setting email to verified
        await db.updateItem(userId, User, {
            is_email_verified: true,
            email_confirmation_code: '',
            email_confirmation_code_expiry: ''
        });

        utils.handleSuccess(res, 'USER.EMAIL_VERIFIED_SUCCESSFULLY', {});
    } catch (error) {
        utils.handleError(req, res, error);
    }
};

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
// eslint-disable-next-line complexity
exports.login = async (req, res) => {
    try {
        let data = matchedData(req);
        console.log(data)
        data.role = 'admin'
        let user;
        if (typeof data.phone !== 'undefined') {
            // data = await utils.splitPhoneNumber(data);
            const query = {
                country_code: data.country_code,
                phone: data.phone,
                role: data.role
            };
            user = await db.getItemByQuery(query, User, false);
        } else {
            // const query = { email: data.email };
            const query = { email: data.email, role: data.role };
            user = await db.getItemByQuery(query, User, false);
        }
        await usersService.userIsExists(user);
        await usersService.userIsBlocked(user, data.role);
        // await usersService.checkLoginAttemptsAndBlockExpires(user);
        const isPasswordMatch = await auth.checkPassword(data.password, user);
        if (!isPasswordMatch) {
            utils.handleError(req, res, await usersService.passwordsDoNotMatch(user));
        } else {
            // all ok, save access and return token
            user.login_attempts = 0;
            await usersService.saveLoginAttemptsToDB(user);
            const userInfo = await usersService.saveUserAccessAndReturnToken(req, user, data.role);
            utils.handleSuccess(res, 'USER.LOGIN_SUCCESS', userInfo.user, userInfo.token);
        }
    } catch (error) {
        // Setting actual message for the api consumer
        if (error.message === 'USER.NOT_EXIST') {
            error.message = 'ERROR.INVALID_CREDENTIALS';
        }
        utils.handleError(req, res, error, 'USER.LOGIN_ERROR');
    }
};





/**
 * Updating user account status function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateUserStatus = async (req, res) => {
    try {
      const data = matchedData(req);
      data.user = await db.getItem(data.user_id, User);
      const user = await db.updateItem(data.user_id, User, { status: data.status });
      utils.handleSuccess(
        res,
        'USER.STATUS_UPDATE_SUCCESS',
        utils.setInfo(user, usersService.resUserBasic)
      );
    } catch (error) {
      utils.handleError(req, res, error);
    }
  };

  





/**
 * Forgot password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.forgotPassword = async (req, res) => {
    try {
      const data = matchedData(req);
      const role = data.role;
      let query;
      let msg;
      if (typeof data.phone_number !== 'undefined') {
        const phoneObj = await utils.splitPhoneNumber(data);
        query = {
          countryCode: phoneObj.country_code,
          phoneNumber: phoneObj.phone_number,
          role
        };
        msg = 'USER.TEMPORARY_PASSWORD_BY_PHONE_SUCCESS';
      } else {
        query = {
          email: data.email,
          role
        };
        msg = 'USER.TEMPORARY_PASSWORD_SUCCESS';
      }
      const numberExist = await db.getItemByQuery(query, User, false);
      if (numberExist !== null && numberExist !== undefined) {
        console.log(numberExist);
        const password = utils.randomPassword(8);
        const isUserUpdated = await db.updateItemByQuery(query, User, {
          password: await utils.hashedPassword(password)
        });
        if (isUserUpdated) {
          const body = utils.localeMsg('USER.OTP_TEMP_PASSWORD_BODY', { password });
          if (typeof data.phone_number !== 'undefined') {
            // Sending message to user with code
            await utils.sendSMS(query, 'EMAIL.FORGOT_PASSWORD', body);
          } else {
            usersService.sendEmailForgotPassword(data.email, { firstName: data.email, password });
          }
        }
        utils.handleSuccess(res, msg, {});
      } else {
        utils.handleError(
          req,
          res,
          utils.buildErrObject({
            ...ErrorCodes.UNPROCESSABLE_ENTITY,
            message: 'USER.INVALID_NUMBER'
          }),
          false,
          true
        );
      }
    } catch (error) {
      utils.handleError(req, res, error);
    }
  };
  

  /**
   * Change password function called by route
   * @param {Object} req - request object
   * @param {Object} res - response object
   */
  exports.changePassword = async (req, res) => {
    try {
      const userId = utils.getAuthUserId(req);
      const data = matchedData(req);
      data.userId = userId;
      const user = await db.getItem(userId, User);
      const isPasswordMatch = await auth.checkPassword(data.old_password, user);
      if (!isPasswordMatch) {
        return utils.handleError(req, res, await usersService.passwordsDoNotMatch(user));
      }
      const item = await db.updateItem(userId, User, {
        password: await utils.hashedPassword(data.password)
      });
      const info = utils.setInfo(item, usersService.resUserBasic);
      utils.handleSuccess(res, 'USER.PASSWORD_UPDATE_SUCCESS', info);
    } catch (error) {
      utils.handleError(req, res, error);
    }
  };
  
  


/**
 * Logout function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.logout = async (req, res) => {
    try {
      const userId = utils.getAuthUserId(req);
      // Updating Token to DB
      await db.updateItem(userId, User, { accessToken: '', accessTokenExpiration: '' });
      // Unsubscribe from push notificationUserPushToken
    //   await db.deleteItemsByQuery({ userId }, UserPushToken);
      utils.handleSuccess(res, 'USER.LOGOUT_SUCCESS', {});
    } catch (error) {
      utils.handleError(req, res, error, 'USER.LOGOUT_ERROR');
    }
  };
  



/**
 * Get profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getProfile = async (req, res) => {
    try {
        const data = req.user;
        const item = await db.getItem(data._id, User);
        const info = utils.setInfo(item, usersService.getProfile);

        utils.handleSuccess(res, 'USER.GET_SINGLE_SUCCESS', info);
    } catch (error) {
        utils.handleError(req, res, error, 'USER.GET_SINGLE_ERROR');
    }
};



/**
 * Update profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateProfile = async (req, res) => {
    try {
        let data = req.value;
        // if (typeof data.phone !== 'undefined') {
        //     const phoneObj = await utils.splitPhoneNumber(data, 'phone');
        //     data = {
        //         ...data,
        //         country_code: phoneObj.country_code,
        //         phone: phoneObj.phone
        //     };
        // }
        const item = await db.updateItem(req.user._id, User, data);
        const info = utils.setInfo(item, usersService.getProfile);
        utils.handleSuccess(res, 'USER.UPDATE_SUCCESS', info);
    } catch (error) {
        console.log(error)
        utils.handleError(req, res, error, 'USER.UPDATE_ERROR');
    }
};


exports.validateTokenAndReturnUser = async (req, res) => {
    try {
      const userId = await utils.getAuthUserId(req);
      const user = await db.getItem(userId, User);
      let info = utils.setInfo(user, usersService.resUser);
      utils.handleSuccess(res, 'USER.AUTH_SUCCESS', info);
    } catch (error) {
      utils.handleError(req, res, error, 'USER.AUTH_ERROR');
    }
  };


  exports.roleAuthorization = roles => async (req, res, next) => {
    try {
      const data = {
        id: utils.getAuthUserId(req),
        role: utils.getAuthUserRole(req),
        roles
      };
      console.log(data);
      await usersService.checkPermissions(data, next);
    } catch (error) {
      utils.handleError(req, res, error);
    }
  };
  
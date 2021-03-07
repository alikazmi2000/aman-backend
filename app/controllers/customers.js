const Customers = require('../models/customers');
const Users = require('../models/user');
const Otp = require('../models/otp');
const UserCard = require('../models/userCard');

const stripe = require('../../config/stripe');
const { matchedData } = require('express-validator');
const auth = require('../middleware/auth');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status, ErrorCodes } = require('../enums');

const { getSettingsObject } = require('../services/Others');
const customerServices = require('../services/Customers');
const usersService = require('../services/Users');

const _ = require('lodash');
const moment = require('moment');

/*
 ***************************
 * customer functions
 ***************************
 */

/**
 * Customer signup function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.signUp = async (req, res) => {
  try {
    let data = req.value;
    // Check if email already exists
    await customerServices.emailExists(data.email, data.role);
    let phoneObj;
    if (typeof data.phone !== 'undefined') {
      // data = await utils.splitPhoneNumber(data, 'phone');
      phoneObj = {
        // country_code: data.country_code,
        phone: data.phone
      };
      await customerServices.phoneExists(phoneObj, data.role);
    }
    // Check if otp token is valid
    // await customerServices.OTPTokenIsValid(data);

    // Creating a new User
    // const userObj = customerServices.setSignUpRequest(data);
    const item = await db.createItem(data, Customers);

    // Getting User's data for the response
    const user = await db.getItem(item._id, Customers);
    // , customerServices.userPopulate);
    const token = await customerServices.returnSignupToken(item, data.role);
    if (typeof data.phone !== 'undefined') {
      // // Removing Otp Token
      // await db.deleteItemsByQuery(
      //   {
      //     ...phoneObj,
      //     token: data.otp_token
      //   },
      //   Otp
      // );
    }
    let successMsg = 'CUSTOMER.SIGNUP_SUCCESS';
    if (process.env.NODE_ENV !== 'test') {
      // customerServices.sendEmailNewSignup(data.email, { first_name: user.first_name });
    }
    utils.handleSuccess(res, successMsg, user, token);
    // utils.handleSuccess(res, 'CUSTOMER.SIGNUP_SUCCESS', item);
    // }
  } catch (error) {
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
    const item = await db.updateItem(userId, Customers, query);
    customerServices.sendSignUpEmail({
      email: item.email,
      first_name: item.first_name,
      verification_code: req.code
    });
    let info;
    if (process.env.NODE_ENV === 'test') {
      info = { code: req.code };
    } else {
      info = utils.setInfo(item, customerServices.resUserBasic);
    }
    utils.handleSuccess(res, 'USER.VERIFICATION_CODE_SUCCESS', info);
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
    // const data = matchedData(req);
    const data = req.value;
    const user = await db.getItem(userId, Customers);
    const currentTime = moment();

    if (user.isEmailVerified) {
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
    await db.updateItem(userId, Customers, {
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
 * Validate token function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.validateTokenAndReturnCustomer = async (req, res) => {
  try {
    const userId = await utils.getAuthUserId(req);
    const user = await db.getItem(userId, Customers);
    let info = utils.setInfo(user, usersService.resUser);
    utils.handleSuccess(res, 'CUSTOMER.AUTH_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.AUTH_ERROR');
  }
};


/**
 * Roles authorization function called by route
 * @param {Array} roles - roles specified on the route
 */
exports.roleAuthorization = roles => async (req, res, next) => {
  try {
    const data = {
      id: utils.getAuthUserId(req),
      role: utils.getAuthUserRole(req),
      roles
    };
    await customerServices.checkPermissions(data, next);
  } catch (error) {
    utils.handleError(req, res, error);
  }
};



/**
 * update customer address function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateDefaultAddress = async (req, res) => {
  try {
    let data = req.value;
    let { address } = await db.getItem(req.user._id, Customers);
    address = address.map(item => {
      if (item._id.toString() === data.id)
        item.is_selected = true

      else
        item.is_selected = false
      return item
    });

    // address[data.index].is_selected = true;

    const item = await db.updateItem(req.user._id, Customers, { $set: { address } });
    utils.handleSuccess(res, 'CUSTOMER.ADDRESS_DEFAULT_SUCCESS', item.address);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.ADDRESS_DEFAULT_ERROR');
  }
};



/**
 * delete customer address function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteAddress = async (req, res) => {
  try {
    let data = req.value;
    let { address } = await db.getItem(req.user._id, Customers);

    if (address.length <= 1) {
      if (address[0]._id.toString() === data.id);
      address = [];
    } else {

      let index = 0, flag = false;
      address = address.filter((item, i) => {
        if (item._id.toString() === data.id) {
          index = i;
          if (item.is_selected === true) flag = true;
        } else
           return item;
      });

      if (flag) {
        if (index === 0) index = 0;
        else index--;

        address[index].is_selected = true;
      }

    }

    const item = await db.updateItem(req.user._id, Customers, { $set: { address } });
    utils.handleSuccess(res, 'CUSTOMER.ADDRESS_DELETE_SUCCESS', item.address);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.ADDRESS_DELETE_ERROR');
  }
};

/**
 * add customer address function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.addAddress = async (req, res) => {
  try {
    let data = req.value;
    let { address } = await db.getItem(req.user._id, Customers);
    if (address.length === 0) data.is_selected = true;

    const item = await db.updateItem(req.user._id, Customers, { $push: { address: data } });

    utils.handleSuccess(res, 'CUSTOMER.ADDRESS_ADD_SUCCESS', item.address);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.ADDRESS_ADD_ERROR');
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
    console.log('login')
    let data = req.value;
    let user;
    if (typeof data.phone !== 'undefined') {
      // data = await utils.splitPhoneNumber(data, 'phone');
      const query = {
        // country_code: data.country_code,
        phone: data.phone,
        //   role: data.role
      };
      user = await db.getItemByQuery(query, Customers, false);
      // user = await db.getItemByQuery(query, User, false, customerServices.userPopulate);
    } else {
      const query = { email: data.email };
      user = await db.getItemByQuery(query, Customers, false);
      // user = await db.getItemByQuery(query, Customers, false, customerServices.userPopulate);
    }
    await customerServices.userIsExists(user);
    await customerServices.userIsBlocked(user);
    // await customerServices.checkLoginAttemptsAndBlockExpires(user);
    const isPasswordMatch = await auth.checkPassword(data.password, user);
    if (!isPasswordMatch) {
      utils.handleError(req, res, utils.buildErrObject({ ...ErrorCodes.INVALID_CREDENTIALS }));
      // utils.handleError(req, res, await customerServices.passwordsDoNotMatch(user));
    } else {
      // all ok, save access and return token
      // user.loginAttempts = 0;
      // await customerServices.saveLoginAttemptsToDB(user);
      console.log('this is user A',user)
      const userInfo = await customerServices.saveUserAccessAndReturnToken(req, user);
      const userForInfo = await db.getItem(user._id, Customers);
      // Unsubscribe from push notification
      // await db.deleteItemsByQuery({ userId: user._id }, UserPushToken);
      let info = utils.setInfo(userForInfo, customerServices.resUser);
      //info = await customerServices.putUserAdditionalInfo(info, data.role);
      utils.handleSuccess(res, 'CUSTOMER.LOGIN_SUCCESS', info, userInfo.token);
    }
  } catch (error) {
    // Setting actual message for the api consumer
    if (error.message === 'CUSTOMER.NOT_EXIST') {
      error.message = 'ERROR.INVALID_CREDENTIALS';
    }
    utils.handleError(req, res, error, 'CUSTOMER.LOGIN_ERROR');
  }
};



/**
 * getAdress function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAdressList = async (req, res) => {
  try {
    const item = await db.getItem(req.user._id, Customers);

    utils.handleSuccess(res, 'CUSTOMER.ADDRESS_GET_SUCCESS', item.address);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.ADDRESS_GET_ERROR');
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
    const item = await db.getItem(data._id, Customers);
    const info = utils.setInfo(item, customerServices.getProfile);

    utils.handleSuccess(res, 'CUSTOMER.GET_SINGLE_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.GET_SINGLE_ERROR');
  }
};


exports.getAllItemsBO = async (req, res) => {
	try {
		// validation
		let query = await db.checkQueryString(req.query);
		let items = await db.getItems(req, Customers, query);
		// console.log(items)
		items.docs = customerServices.boItemConversion(items.docs);
		// const info = utils.setInfo(items, serviceCategoriesService.resDocument, true);
		utils.handleSuccess(res, 'CUSTOMER.LIST_SUCCESS', items);
	
		// const orders_data = await services.Crud.get(Orders, {});
		// utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', {message:'', orders_data });
	  } catch (error) {
		utils.handleError(req, res, error, 'CUSTOMER.LIST_ERROR');
	  }
};

exports.getItemDetails = async (req, res) => {
  try {
    // let query = await db.checkQueryString(req.query);
    let data = {_id : req.value.id};
    console.log(data);
    let item = await db.getItemByQuery(data, Customers);
    // console.log(items)
    // items.docs = orderService.boItemConversion(items.docs);
    // const info = utils.setInfo(items, serviceCategoriesService.resDocument, true);
    utils.handleSuccess(res, 'CUSTOMER.GET_SINGLE_SUCCESS', item);

    // const orders_data = await services.Crud.get(Orders, {});
    // utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', {message:'', orders_data });
  } catch (error) {
    console.log(error)
    utils.handleError(req, res, error, 'CUSTOMER.GET_SINGLE_ERROR');
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
    console.log('asdasdasadas',req.user)
    await customerServices.emailExists(data.email,false,req.user._id);
    console.log('asdasdasadas',req.user)
 
    if (typeof data.phone !== 'undefined') {
      // const phoneObj = await utils.splitPhoneNumber(data, 'phone');
      data = {
        ...data,
        // country_code: phoneObj.country_code,
        phone: phoneObj.phone
      };
    }
    const item = await db.updateItem(req.user._id, Customers, data);
    const info = utils.setInfo(item, customerServices.getProfile);
    utils.handleSuccess(res, 'CUSTOMER.UPDATE_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.UPDATE_ERROR');
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
    let data = req.value;
    data.userId = userId;
    const user = await db.getItem(userId, Customers);
    const isPasswordMatch = await auth.checkPassword(data.old_password, user);
    if (!isPasswordMatch) {
      utils.handleError(req, res, await customerServices.passwordsDoNotMatch(user));
    }
    const item = await db.updateItem(userId, Customers, {
      password: await utils.hashedPassword(data.password)
    });
    // const info = utils.setInfo(item, usersService.resUserBasic);
    utils.handleSuccess(res, 'CUSTOMER.PASSWORD_UPDATE_SUCCESS');
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
    const data = req.value;
    let query;
    let msg;
    // if (typeof data.phone !== 'undefined') {
    //   // const phoneObj = await utils.splitPhoneNumber(data, 'phone');
    //   // query = {
    //   //   country_code: phoneObj.country_code,
    //   //   phone: phoneObj.phone
    //   // };
    //   query = {
    //     phone: data.phone
    //   };
    //   msg = 'CUSTOMER.TEMPORARY_PASSWORD_BY_PHONE_SUCCESS';
    // } else {
    //   query = {
    //     email: data.email,
    //   };
    //   msg = 'CUSTOMER.TEMPORARY_PASSWORD_SUCCESS';
    // }
    query = {
      email: data.email,
    };
    msg = 'CUSTOMER.TEMPORARY_PASSWORD_SUCCESS';
    const numberExist = await db.getItemByQuery(query, Customers, false);
    if (numberExist !== null && numberExist !== undefined) {
      const password = utils.randomPassword(8);
      const isUserUpdated = await db.updateItemByQuery(query, Customers, {
        password: await utils.hashedPassword(password)
      });
      if (isUserUpdated) {
        const body = utils.localeMsg('CUSTOMER.OTP_TEMP_PASSWORD_BODY', { password });
        if (typeof data.phone !== 'undefined') {
          // Sending message to user with code
          // await utils.sendSMS(query, 'EMAIL.FORGOT_PASSWORD', body);
        } else {
        }
        customerServices.sendEmailForgotPassword(data.email, { firstName: data.email, password });
        // return utils.handleSuccess(res, msg, body);
      }
      // return utils.handleSuccess(res, msg, body);
      utils.handleSuccess(res, msg, {});
    } else {
      utils.handleError(
        req,
        res,
        utils.buildErrObject({
          ...ErrorCodes.UNPROCESSABLE_ENTITY,
          message: 'CUSTOMER.INVALID_EMAIL'
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
 * Verify Phone function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verifyPhone = async (req, res) => {
  try {
    let data = req.value;
    // data = await utils.splitPhoneNumber(data, 'phone');
    const phoneObj = {
      // countryCode: data.country_code,
      phone: data.phone
    };
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
    const otp = customerServices.setOTPItem(data);
    await db.createItem(otp, Otp);
    // Sending message to user with code
    await utils.sendSMS(phoneObj, 'OTP Code', body);
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
    // let data = matchedData(req);
    let data = req.value;
    // data = await utils.splitPhoneNumber(data, 'phone');
    const phoneObj = {
      // countryCode: data.country_code,
      phone: data.phone
    };

    const query = { ...phoneObj, code: data.code };
    const token = utils.randomCharacters();

    // TODO: Remove It after some time
    if (
      (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') &&
      data.code === '1010'
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
 * Logout function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.logout = async (req, res) => {
  try {
    const userId = utils.getAuthUserId(req);
    // Updating Token to DB
    await db.updateItem(userId, Customers, { access_token: '', access_token_expiration: '' });
    // Unsubscribe from push notification
    // await db.deleteItemsByQuery({ userId }, UserPushToken);
    utils.handleSuccess(res, 'CUSTOMER.LOGOUT_SUCCESS', {});
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.LOGOUT_ERROR');
  }
};




/*
 ***************************
 * user cards functions
 ***************************
 */

/**
 * Get cards function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getCards = async (req, res) => {
  try {
    const items = await db.getAllItems({ userId: utils.getAuthUserId(req) }, UserCard);
    const info = utils.setInfo(items, usersService.resUserCard, true, false);
    utils.handleSuccess(res, 'USER.CARDS_LIST_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'USER.CARDS_LIST_ERROR');
  }
};

/**
 * Get card function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getCard = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.getItem(data.id, UserCard);
    const info = utils.setInfo(item, customerServices.resUserCard);
    utils.handleSuccess(res, 'USER.CARD_SINGLE_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'USER.CARD_SINGLE_ERROR');
  }
};

/**
 * Update card function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateCard = async (req, res) => {
  try {
    const userId = utils.getAuthUserId(req);
    // const data = matchedData(req);
    const data = req.value;
    await db.updateItemsByQuery({ userId }, UserCard, { isDefault: false, userId });
    const userCard = usersService.setUserCard(data, true);
    if (process.env.NODE_ENV !== 'test') {
      // Updating Default Card on Stripe
      const user = await db.getItem(userId, Customers);
      const card = await db.getItem(data.id, UserCard);
      await stripe.updateDefaultSource(card.stripe_card, user.stripe_customer_id);
    }
    const item = await db.updateItem(data.id, UserCard, userCard);
    const info = utils.setInfo(item, usersService.resUserCard);
    utils.handleSuccess(res, 'USER.CARD_UPDATE_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'USER.CARD_UPDATE_ERROR');
  }
};

/**
 * Create card function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createCard = async (req, res) => {
  try {
    const userId = utils.getAuthUserId(req);
    // const data = matchedData(req);
    const data = req.value;
    const user = await db.getItem(userId, Customers);

    // Validation against cards limit
    const totalCards = await db.countItems({ userId }, UserCard);
    const settings = await getSettingsObject();
    if (totalCards >= settings.cardsLimit && process.env.NODE_ENV !== 'test') {
      utils.handleError(
        req,
        res,
        utils.buildErrObject({
          ...ErrorCodes.BAD_REQUEST,
          message: utils.localeMsg('USER.CARDS_LIMIT_EXCEEDED', {
            number: settings.cardsLimit
          })
        })
      );
      return;
    }

    const item = await customerServices.saveCreditCard(data, user);
    const info = utils.setInfo(item, customerServices.resUserCard);
    utils.handleSuccess(res, 'USER.CARD_CREATE_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'USER.CARD_CREATE_ERROR');
  }
};

/**
 * Delete card function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteCard = async (req, res) => {
  try {
    const userId = utils.getAuthUserId(req);
    const data = req.value;
    const user = await db.getItem(userId, Customers);
    const card = await db.getItem(data.id, UserCard);
    if (card.isDefault === true) {
      utils.handleError(
        req,
        res,
        utils.buildErrObject({
          ...ErrorCodes.BAD_REQUEST,
          message: 'USER.CARD_DEFAULT_DELETE_ERROR'
        })
      );
    } else {
      const item = await db.deleteItem(data.id, UserCard);
      if (process.env.NODE_ENV !== 'test') {
        // Deleting Card on Stripe
        await stripe.deleteSource(card.stripeCard, user.stripe_customer_id);
      }
      const info = utils.setInfo(item, customerServices.resUserCard);
      utils.handleSuccess(res, 'USER.CARD_DELETE_SUCCESS', info);
    }
  } catch (error) {
    utils.handleError(req, res, error, 'USER.CARD_DELETE_ERROR');
  }
};


exports.deleteItem = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.deleteItem(data.id, Customers);
    utils.handleSuccess(res, 'USER.DELETE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'USER.DELETE_ERROR');
  }
};

exports.blockedItem = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.updateItem(data.id, Customers,{is_blocked: true});
    utils.handleSuccess(res, 'CUSTOMER.BLOCKED', item);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.BLOCKED_ERROR');
  }
};


exports.unBlockedItem = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.updateItem(data.id, Customers,{is_blocked: false});
    utils.handleSuccess(res, 'CUSTOMER.UNBLOCKED', item);
  } catch (error) {
    utils.handleError(req, res, error, 'CUSTOMER.UNBLOCKED_ERROR');
  }
};




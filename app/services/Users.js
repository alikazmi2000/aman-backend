const moment = require('moment');
const jwt = require('jsonwebtoken');
const mustache = require('mustache');
const User = require('../models/user');
const Otp = require('../models/otp');

const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { addMinutes } = require('date-fns');
const auth = require('../middleware/auth');
const { ErrorCodes, Roles, Status } = require('../enums');
const MINUTES_TO_BLOCK = process.env.LOGIN_ATTEMTS_MINUTES_TO_BLOCK;
const LOGIN_ATTEMPTS = process.env.ALLOWED_LOGIN_ATTEMPTS;

/*
 * ****************
 * Public Functions
 * ****************
 */
exports.emailExists = async (email, role = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user;
            if (role !== false) {
                user = await db.getItemByQuery({ email, role }, User, false);
            } else {
                user = await db.getItemByQuery({ email }, User, false);
            }
            if (user) {
                reject(
                    utils.buildErrObject({
                        ...ErrorCodes.ITEM_ALREADY_EXISTS,
                        message: 'USER.EMAIL_ALREADY_EXISTS'
                    })
                );
            } else {
                resolve(true);
            }
        } catch (err) {
            reject(
                utils.buildErrObject({
                    ...ErrorCodes.INTERNAL_SERVER_ERROR,
                    info: err.message
                })
            );
        }
    });
};

/**
* Checks if otp token valid or expired
* @param {Object} req - req object
*/
exports.OTPTokenIsValid = async req => {
    return new Promise(async (resolve, reject) => {
        if (
            (req.role === Roles.Seeker || req.role === Roles.Giver) &&
            process.env.NODE_ENV !== 'test'
        ) {
            const otp = await db.getItemByQuery(
                { country_code: req.country_code, phone: req.phone, token: req.otp_token },
                Otp,
                false
            );
            if (!otp) {
                reject(
                    utils.buildErrObject({
                        ...ErrorCodes.INVALID_TOKEN,
                        message: 'USER.OTP_TOKEN_EXPIRED_OR_INVALID'
                    })
                );
            }
            const minutes = moment(otp.expiry).diff(moment(), 'minutes');
            if (minutes <= 0) {
                reject(
                    utils.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'USER.OTP_EXPIRED' })
                );
            }
            resolve(true);
        } else {
            resolve(true);
        }
    });
};

/**
 * Setting Request of signUp
 * @param {Object} req - request object
 */
exports.setSignUpRequest = req => {
    const response = {
        country_code: req.country_code,
        // phone_number: req.phone_number,
        phone: req.phone,
        first_name: req.first_name,
        last_name: req.last_name,
        email: req.email,
        password: req.password,
        role: req.role || 'admin',
        status: Status.Active,
        profile_picture: req.profile_picture ? req.profile_picture : undefined,
        is_email_verified: false
    };

    return response;
};

/**
 * Checks User model if user with an specific email exists
 * @param {Object} phoneObj - user phone Number object
 * @param {string} role - user role
 */
exports.phoneExists = async (phoneObj, role = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user;
            if (role !== false) {
                user = await db.getItemByQuery({ ...phoneObj, role }, User, false);
            } else {
                user = await db.getItemByQuery({ ...phoneObj }, User, false);
            }
            if (user) {
                reject(
                    utils.buildErrObject({
                        ...ErrorCodes.ITEM_ALREADY_EXISTS,
                        message: 'USER.PHONE_ALREADY_EXISTS'
                    })
                );
            } else {
                resolve(true);
            }
        } catch (err) {
            reject(
                utils.buildErrObject({
                    ...ErrorCodes.INTERNAL_SERVER_ERROR,
                    info: err.message
                })
            );
        }
    });
};


exports.resUser = req => {
    let response = {
        id: req._id,
        first_name: req.first_name,
        last_name: req.last_name,
        role: req.role,
        phone: req.phone,
        // phone_number: `${req.country_code}-${req.phone_number}`,
        // phone_obj: {
        //     country_code: req.country_code,
        //     phone_number: req.phone_number
        // },
        country_code:req.country_code,
        email: req.email,
        profile_picture: utils.fileFullUrl(req.profile_picture),
        profile_picture_base: req.profile_picture,
        enable_notifications: req.enable_notifications,
        status: req.status,
        is_email_verified: req.is_email_verified,
        token_expiration: req.access_token_expiration,
        created_at: req.createdAt
    };
    return response;
};

/**
* Builds the registration token
* @param {Object} item - user object that contains created id
* @param {string} role - user role
*/
exports.returnSignupToken = async (item, role) => {
    return this.generateToken(item, role);
};



/**
 * Generates a token
 * @param {Object} user - user object
 * @param {string} role - user role
 */
exports.generateToken = async (user, role) => {
    if (typeof user.access_token !== 'undefined') {
        if (process.env.NODE_ENV === 'test' || role === Roles.Admin) {
            if (await utils.isAccessTokenValid(user.access_token)) {
                return user.access_token;
            }
        }
    }

    // Gets expiration time
    const expiration = Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES;

    const userObj = { _id: user._id, role };

    console.log(userObj)
    // create signed and encrypted token
    const token = auth.encrypt(
        jwt.sign(
            {
                data: userObj,
                exp: expiration
            },
            process.env.JWT_SECRET
        )
    );

    // Updating Token to DB
    await db.updateItem(user._id, User, { access_token: token, access_token_expiration: expiration });

    return token;
};


/**
 * Make otp request object according to the API
 */
exports.setOTPItem = req => {
    return {
        country_code: req.country_code,
        phone: req.phone,
        // phone_number: req.phone_number,
        code: req.code,
        expiry: req.expiry,
        token: req.token
    };
};



/**
 * Checks if otp expired
 * @param {Object} otp - otp object
 */
exports.OTPIsExpired = async otp => {
    return new Promise((resolve, reject) => {
        const minutes = moment(otp.expiry).diff(moment(), 'minutes');
        console.log(minutes, 'adasdadsad', otp)
        if (minutes <= 0) {
            reject(
                utils.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'USER.OTP_EXPIRED' })
            );
        }

        resolve(true);
    });
};


/**
* Send Signup Email
* @param {Object} param - parameters to send in email template
*/
exports.sendSignUpEmail = async param => {
    const template = await utils.emailTemplate('signup');
    mustache.parse(template);
    utils.sendEmail(param.email, 'EMAIL.ACCOUNT_SIGNUP', mustache.render(template, param));
};

exports.resUserBasic = req => {
    return {
        id: req._id,
        first_name: req.first_name,
        last_name: req.last_name,
        role: req.role,
        // phone_number: `${req.country_code}-${req.phone_number}`,
        phone: req.phone,
        country_code: req.country_code,
        email: req.email,
        profile_picture: utils.fileFullUrl(req.profile_picture),
        profile_picture_base: req.profile_picture,
        is_email_verified: req.is_email_verified,
        status: req.status,
        created_at: req.createdAt,
        country_code:req.country_code,
    };
};
/**
 * Is User Exists
 * @param {Object} user - user object
 */
exports.userIsExists = user => {
    return new Promise((resolve, reject) => {
        if (!user) {
            reject(utils.buildErrObject({ ...ErrorCodes.INVALID_CREDENTIALS }));
        } else {
            resolve(true);
        }
    });
};


/**
 * Checks if block_expires from user is greater than now
 * @param {Object} user - user object
 * @param {string} role - user role
 */
exports.userIsBlocked = async (user, role = Roles.Admin) => {
    return new Promise((resolve, reject) => {
      if ((user.status === Status.Blocked || user.status === Status.InActive) && user.role === role) {
        if (user.block_expires > new Date()) {
          reject(utils.buildErrObject({ ...ErrorCodes.FORBIDDEN, message: 'USER.BLOCKED_TEMP' }));
        } else {
          reject(utils.buildErrObject({ ...ErrorCodes.FORBIDDEN, message: 'USER.BLOCKED' }));
        }
      } else {
        resolve(true);
      }
    });
  };

/**
 * Blocks a user by setting block_expires to the specified date based on constant HOURS_TO_BLOCK
 * @param {Object} user - user object
 */
exports.blockUser = async user => {
    return new Promise((resolve, reject) => {
      user.block_expires = addMinutes(new Date(), MINUTES_TO_BLOCK);
      user.save((err, result) => {
        if (err) {
          reject(utils.buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
        }
        if (result) {
          resolve(utils.buildErrObject({ ...ErrorCodes.FORBIDDEN, message: 'USER.BLOCKED_TEMP' }));
        }
      });
    });
  };
  
/**
 * Saves login attempts to database
 * @param {Object} user - user object
 */
exports.saveLoginAttemptsToDB = async user => {
    return new Promise((resolve, reject) => {
      user.save((err, result) => {
        if (err) {
          reject(utils.buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
        }
        if (result) {
          resolve(true);
        }
      });
    });
  };
  

/**
 * Adds one attempt to login_attempts, then compares login_attempts with the constant LOGIN_ATTEMPTS, if is less returns wrong password, else returns blockUser function
 * @param {Object} user - user object
 */
exports.passwordsDoNotMatch = async user => {
    user.login_attempts += 1;
    await this.saveLoginAttemptsToDB(user);
    return new Promise((resolve, reject) => {
      if (user.login_attempts <= LOGIN_ATTEMPTS) {
        resolve(utils.buildErrObject({ ...ErrorCodes.INVALID_CREDENTIALS }));
      } else {
        resolve(this.blockUser(user));
      }
      reject(utils.buildErrObject({ ...ErrorCodes.INVALID_CREDENTIALS }));
    });
  };


/**
 * Saves a new user access and then returns token
 * @param {Object} req - request object (it should have "req.role" property)
 * @param {Object} user - user object
 * @param {string} role - user role
 */
exports.saveUserAccessAndReturnToken = async (req, user, role) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userInfo = utils.setInfo(user, this.resUserBasic);
        userInfo.role = role;
        // Returns data with access token
        resolve({
          token: await this.generateToken(user, role),
          user: userInfo
        });
      } catch (err) {
        reject(utils.buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
      }
    });
  };
  
  exports.checkPermissions = async (data, next) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await db.getItemByQuery({ _id: data.id, role: data.role }, User, false);
        if (user) {
          if (data.roles.indexOf(data.role) > -1) {
            return resolve(next());
          }
        }
        return reject(utils.buildErrObject({ ...ErrorCodes.METHOD_NOT_ALLOWED }));
      } catch (err) {
        return reject(utils.buildErrObject({ ...ErrorCodes.METHOD_NOT_ALLOWED, info: err.message }));
      }
    });
  };



  
exports.getProfile = req => {
    return {
      _id: req._id,
      first_name: req.first_name,
      last_name: req.last_name,
    //   phoneObj: `${req.country_code}-${req.phone}`,
      country_code: req.country_code,
      phone: req.phone,
      email: req.email,
      img: req.img,
    //   reg_id: req.reg_id,
    //   device_type: req.device_type,
    }
  }
// const { Status } = require('../enums');
const Customers = require('../models/customers');
// const Merchants = require('../models/merchant');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const mustache = require('mustache');
const stripe = require('../../config/stripe');
const UserAccess = require('../models/userAccess');
const UserPushToken = require('../models/userPushToken');
const Otp = require('../models/otp');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { addMinutes } = require('date-fns');
const auth = require('../middleware/auth');
const { ErrorCodes, Roles, Status } = require('../enums');
const UserCard = require('../models/userCard');
const MINUTES_TO_BLOCK = process.env.LOGIN_ATTEMTS_MINUTES_TO_BLOCK;
const LOGIN_ATTEMPTS = process.env.ALLOWED_LOGIN_ATTEMPTS;

const _ = require('lodash');


/**
 ***********************************************************
 * Populate Arrays for mongoose
 ***********************************************************
 */

exports.serviceAndcategoryPopulate = [
  {
    path: 'Service'
  },
  {
    path: 'serviceCategory'
  }
];

/*
 * ****************
 * Public Functions
 * ****************
 */

/**
 * Generates a token
 * @param {Object} user - user object
 * @param {string} role - user role
 */
exports.generateToken = async (user, role) => {

  // Gets expiration time
  const expiration = Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES;
  let userObj;
  // if (role == Roles.Merchant) {
  //   userObj = { _id: user._id, merchant_id: user.merchant_id, role };
  // } else {
  //   userObj = { _id: user._id, role };
  // }
  userObj = { _id: user._id, role: 'customer' }
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
  await db.updateItem(user._id, Customers, { token: token,  
    access_token: token,
    access_token_expiration: expiration
  });
  
  // await db.updateItem(user._id, User, { accessToken: token, accessTokenExpiration: expiration });

  return token;
};


/**
 * Checks against user if has quested role
 * @param {Object} data - data object
 * @param {*} next - next callback
 */
exports.checkPermissions = async (data, next) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.getItemByQuery({ _id: data.id, role: data.role }, Customers, false);
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


/**
 * Checks User model if user with an specific email exists
 * @param {string} email - user email
 * @param {string} role - user role
 */
exports.emailExists = async (email, role = false,id=false) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user;
      let obj = {
        email
      }
      if (role !== false) {
        obj['role'] = role
      }
      if( id !== false)
      {
        obj['_id'] = {$ne:id}
      }
      console.log('asdasdasd',obj)
      user = await db.getItemByQuery(obj, Customers, false);

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
 * Checks User model if user with an specific email exists
 * @param {Object} phoneObj - user phone Number object
 * @param {string} role - user role
 */
exports.phoneExists = async (phoneObj, role = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user;
      if (role !== false) {
        user = await db.getItemByQuery({ ...phoneObj, role }, Customers, false);
      } else {
        user = await db.getItemByQuery({ ...phoneObj }, Customers, false);
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

/**
 * Checks if otp token valid or expired
 * @param {Object} req - req object
 */
exports.OTPTokenIsValid = async req => {
  return new Promise(async (resolve, reject) => {
    if (
      // (req.role === Roles.Requester || req.role === Roles.Provider) &&
      process.env.NODE_ENV !== 'test'
    ) {
      const otp = await db.getItemByQuery(
        { countryCode: req.country_code, phoneNumber: req.phone, token: req.otp_token },
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

exports.userIsBlocked = async (user) => {
  return new Promise((resolve, reject) => {
    if (user.is_blocked) {
      reject(utils.buildErrObject({ ...ErrorCodes.FORBIDDEN, message: 'USER.BLOCKED' }));
    } else {
      resolve(true);
    }
  });
};

/**
 ***********************************************************
 * Request Objects
 ***********************************************************
 */

/**
 * Make request object according to the API
 */
exports.setMerchantItem = (req, forUpdate = false) => {
    const response = {
        name: req.name,
        description: req.description,
        service_id: req.service_id,
        category_id: req.category_id,
        img: req.img,
        rating: req.rating,
        address: req.address,
        logo: req.logo,
        banner: req.banner,
        start_time: req.start_time,
        end_time: req.end_time,
        // bankInfo: req.bank_Info
    };

    // if (req.bank_Info) {
    //     response.bankInfo = {
    //         title: req.bank_Info.title,
    //         accountNo: req.bank_Info.accountNo,
    //         iban: req.bank_Info.iban,
    //         routingNo: req.bank_Info.routingNo
    //     }
    // }
    // if (req.address) {
    //     response.address = {
    //         street: req.address.street,
    //         state: req.address.state,
    //         city: req.address.city,
    //         zip: req.address.zip,
    //         loc: req.address.loc
    //     }
    // }

    if (forUpdate === false) {
        response.status = Status.Active;
    } else {
        response.status = req.status;
    }
    return response;
};


/**
 ******************
 * Filter Models
 ******************
 */
/* eslint camelcase: "off" */
exports.filterCategoryQuestion = query => {
  const obj = {
    question: 'question',
    category_id: 'categoryId',
    status: 'status'
  };

  return utils.setSearchParamsFilter(obj, query);
};

/* eslint camelcase: "off" */
exports.filterCategoryContract = query => {
  const obj = {
    title: 'title',
    category_id: 'categoryId',
    status: 'status'
  };

  return utils.setSearchParamsFilter(obj, query);
};

/**
 ******************
 * Set sort values
 ******************
 */

exports.sortCategoryQuestion = query => {
  switch (query.sort) {
    case 'id':
    case 'created_at':
      query.sort = 'createdAt';
      break;
    case 'question':
      query.sort = 'question';
      break;
    case 'status':
      query.sort = 'status';
      break;
    default:
      query.sort = '';
      break;
  }
  return query;
};

exports.sortCategoryContract = query => {
  switch (query.sort) {
    case 'id':
    case 'created_at':
      query.sort = 'createdAt';
      break;
    case 'title':
      query.sort = 'title';
      break;
    case 'status':
      query.sort = 'status';
      break;
    default:
      query.sort = '';
      break;
  }
  return query;
};

/**
 ***********************************************************
 * Response Models
 ***********************************************************
 */

/* eslint camelcase: "off" */

exports.resMerchantPublic = req => {
  return {
    name: req.name,
    id: req._id,
    description: req.description,
    serviceId: req.service_id,
    categoryId: req.category_id,
    img: req.img,
    // img: utils.fileFullUrl(req.image),
    rating: req.rating,
    address: req.address,
    logo: req.logo,
    banner: req.banner,
    startTime: req.start_time,
    endTime: req.end_time,

    // id: req._id,
    // title: req.title,
    // description: req.description,
    // image: utils.fileFullUrl(req.image),
    // image_base: req.image,
    // parent_id: req.parentId,
    // hourly_rate: req.hourlyRate,
    // status: req.status
  };
};

exports.resMerchant = req => {
  if(req.createdAt) {
    req.created_at = req.createdAt;
    delete req.createdAt;
  }
  if(req.updatedAt) {
    req.updated_at = req.updatedAt;
    delete req.updatedAt;
  }
  return req;
  // let response = {
  //   id: req._id,
  //   name: req.name,
  //   description: req.description,
  //   service_id: req.service_id,
  //   category_id: req.category_id,
  //   img: utils.fileFullUrl(req.img),
  //   rating: req.rating,
  //   address: req.address,
  //   logo: req.logo,
  //   banner: req.banner,
  //   start_time: req.start_time,
  //   end_time: req.end_time,
  //   bank_info: req.bank_info
  // };

  // response = utils.settingUpChild(response, 'job_type_id', 'job_type', jobTypesService.resJobType);

  // return response;
};

exports.resCategoryQuestion = req => {
  let response = {
    id: req._id,
    category_id: req.categoryId,
    question: req.question,
    question_type: req.questionType,
    question_values: req.questionValues,
    is_required: req.isRequired,
    min_value_slider: req.minValueSlider,
    max_value_slider: req.maxValueSlider,
    created_at: req.createdAt,
    status: req.status
  };

  response = utils.settingUpChild(
    response,
    'category_id',
    'category',
    categoriesService.resCategoryPublic
  );

  return response;
};

exports.resCategoryContract = req => {
  let response = {
    id: req._id,
    category_id: req.categoryId,
    title: req.title,
    content: req.content,
    email: req.email,
    created_at: req.createdAt,
    status: req.status
  };

  response = utils.settingUpChild(
    response,
    'category_id',
    'category',
    categoriesService.resCategoryPublic
  );

  return response;
};


/**
 * Saves a new user access and then returns token
 * @param {Object} req - request object (it should have "req.role" property)
 * @param {Object} user - user object
 */
exports.saveUserAccessAndReturnToken = async (req, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      // await db.createItem(
      //   {
      //     email: user.email,
      //     ip: utils.getIP(req),
      //     browser: utils.getBrowserInfo(req),
      //     country: utils.getCountry(req)
      //   },
      //   UserAccess
      // );
      const userInfo = utils.setInfo(user, this.resUserBasic);
      // userInfo.role = user.role;
      // Returns data with access token
      resolve({
        token: await this.generateToken(user),
        // token: await this.generateToken(user, user.role),
        user: userInfo
      });
    } catch (err) {
      console.log(err)
      reject(utils.buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
    }
  });
};


/**
 * Builds the registration token
 * @param {Object} item - user object that contains created id
 * @param {string} role - user role
 */
exports.returnSignupToken = async (item, role) => {
  return this.generateToken(item, role);
};


exports.resUserBasic = req => {
  return {
    id: req._id,
    first_name: req.first_name,
    last_name: req.last_name,
    phoneObj: `${req.country_code}-${req.phone}`,
    country_code: req.country_code,
    phone: req.phone,
    email: req.email,
  };
};



exports.getProfile = req => {
  return {
    _id: req._id,
    first_name: req.first_name,
    last_name: req.last_name,
    phoneObj: `${req.country_code}-${req.phone}`,
    country_code: req.country_code,
    phone: req.phone,
    email: req.email,
    img: req.img,
    reg_id: req.reg_id,
    device_type: req.device_type,
    shipping:req.shipping,
    billing:req.billing
  }
}

exports.boItemConversion = data => {

  return data;
  return {
    countryCode: req.country_code,
    phoneNumber: req.phone,
    code: req.code,
    expiry: req.expiry,
    token: req.token
  };
};


/**
 * Make otp request object according to the API
 */
exports.setOTPItem = req => {
  return {
    countryCode: req.country_code,
    phoneNumber: req.phone,
    code: req.code,
    expiry: req.expiry,
    token: req.token
  };
};


exports.resUser = req => {
  return {
    id: req._id,
    first_name: req.first_name,
    last_name: req.last_name,
    phoneObj: `${req.country_code}-${req.phone}`,
    country_code: req.country_code,
    phone: req.phone,
    email: req.email,
    img: req.img,
    reg_id: req.reg_id,
    device_type: req.device_type,

  };
};



/**
 * Adds one attempt to loginAttempts, then compares loginAttempts with the constant LOGIN_ATTEMPTS, if is less returns wrong password, else returns blockUser function
 * @param {Object} user - user object
 */
exports.passwordsDoNotMatch = async user => {
  // user.loginAttempts += 1;
  // await this.saveLoginAttemptsToDB(user);
  return new Promise((resolve, reject) => {
    resolve(utils.buildErrObject({ ...ErrorCodes.INVALID_CREDENTIALS }));
    // if (user.loginAttempts <= LOGIN_ATTEMPTS) {
    //   resolve(utils.buildErrObject({ ...ErrorCodes.INVALID_CREDENTIALS }));
    // } else {
    //   resolve(this.blockUser(user));
    // }
    reject(utils.buildErrObject({ ...ErrorCodes.INVALID_CREDENTIALS }));
  });
};


/**
 * Send Email User for Reset Password
 * @param {string} to - to email
 * @param {Object} param - parameters to send in email template
 */
exports.sendEmailForgotPassword = async (to, param) => {
  const template = await utils.emailTemplate('forgotPassword');
  mustache.parse(template);
  utils.sendEmail(to, 'EMAIL.FORGOT_PASSWORD', mustache.render(template, param));
};


// const makeListWithMerchant = async (data, coordinates) => {
//   try {
//     let result = await Merchants.aggregate([
//       {
//         $geoNear: {
//           near: { type: "Point", coordinates: coordinates },
//           key: "loc",
//           distanceField: "dist.calculated",
//           maxDistance: 10000000000
//         }
//       },
//       { $lookup: { "from": "servicecategories", "localField": "category_id", "foreignField": "_id", "as": "c_services" } },
//       { $unwind: "$c_services" },
//       { $project: { name: 1, c_service_name: "$c_services.name", c_service_id: "$c_services._id", } },
//       {
//         $group: {
//           _id: { c_service_name: "$c_service_name", c_service_id: "$c_service_id" },
//           merchants: { $push: { id: "$_id", name: "$name" } }
//         }
//       },
//       {
//         $project: {
//           c_service_name: "$_id.c_service_name", id: "$_id.c_service_id", _id: 0,
//           merchants: 1
//         }
//       }
//     ])
//     return result;


//     // let result = [];
//     // data.map(item => {
//     //   item.category_id.map(x => {
//     //     result.push({ ...x, merchant_id: item._id, merchant_name: item.name });
//     //   });
//     // });

//     // let result_ = [];
//     // result.map(item => {
//     //   let obj = {
//     //     _id: item._id,
//     //     name: item.name,
        
//     //   };
//     //   let index = result_.indexOf(item._id);
//     //   console.log(index)
//     //   console.log(result_[index]['merchants'].includes(item.merchant_id))
//     //   if (result_[index]['merchants'].includes(item.merchant_id)
//     //   // && result_.includes(item.merchant_id)
//     //   ) {
//     //     console.log(true)
//     //   } else {
//     //     // obj['merchants'] = [{
//     //     //   merchant_id: item.merchant_id,
//     //     //   merchant_name: item.merchant_name
//     //     // }]
//     //     let obj = {
//     //       _id: item._id,
//     //       name: item.name,
//     //       merchants: [{
//     //         merchant_id: item.merchant_id,
//     //         merchant_name: item.merchant_name
//     //       }]
//     //     };

//     //     result_.push(obj)
//     //   }
//     // });

//     // console.log(result)
//     // return result
//   } catch (error) {
//     console.log(error)
//   }
// }
// exports.makeListWithMerchant = makeListWithMerchant;


/**
 * Checks if otp expired
 * @param {Object} otp - otp object
 */
exports.OTPIsExpired = async otp => {
  return new Promise((resolve, reject) => {
    const minutes = moment(otp.expiry).diff(moment(), 'minutes');
    if (minutes <= 0) {
      reject(
        utils.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'USER.OTP_EXPIRED' })
      );
    }

    resolve(true);
  });
};





/**
 * Save Credit/Debit using Stripe
 * @param {Object} req - req object
 * @param {Object} user - user object
 */
exports.saveCreditCard = async (req, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const paymentMethod = 'STRIPE'; // For Future Reference
      if (paymentMethod === 'STRIPE') {
        const stripe_customer_id = await this.stripeCreateCustomerIfNotExists(req, user);
        // Creating Credit Card
        const stripeCard = await this.stripeCreateCreditCard(
          req.stripe_card_token,
          stripe_customer_id
        );
        // Setting Extra requests params
        req.stripeCard = stripeCard.id;
        req.cardLastFour = stripeCard.last4;
        req.cardBrand = stripeCard.brand;
        req.userId = user._id;
        req.onModel = 'Customers';

        // If Card Not Exists then make first one default
        const cardExists = await db.getItemByQuery({ userId: user._id }, UserCard, false);
        req.is_default = !cardExists;

        const userCard = this.setUserCard(req);
        const card = await db.createItem(userCard, UserCard);
        resolve(card);
      }
    } catch (error) {
      reject(error);
    }
  });
};





/**
 * Create Credit/Debit Card on Stripe
 * @param {string} stripe_card_token - stripe card token
 * @param {string} stripe_customer_id - stripe customer id
 */
exports.stripeCreateCreditCard = async (stripe_card_token, stripe_customer_id) => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'test') {
      resolve({ id: 'FAKE_ID', last4: '1234', brand: 'VISA' });
    } else {
      stripe
        .createSource(stripe_card_token, stripe_customer_id)
        .then(async card => {
          resolve(card);
        })
        .catch(err => {
          reject(
            utils.buildErrObject({
              ...ErrorCodes.STRIPE_ERROR,
              message: err.message
            })
          );
        });
    }
  });
};



/**
 * Create Customer on Stripe
 * @param {Object} req - req object
 * @param {Object} user - user object
 */
exports.stripeCreateCustomerIfNotExists = async (req, user) => {
  return new Promise((resolve, reject) => {
    try {
      if (process.env.NODE_ENV === 'test') {
        // For test cases we are sending fake id without utilizing stripe
        resolve('FAKE_ID');
      } else if (!user.stripe_customer_id) {
        // Create a customer on stripe
        stripe
          .createCustomer({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email
          })
          .then(async customer => {
            // Update Customer stripe Id
            await db.updateItem(user._id, Customers, { stripe_customer_id: customer.id });
            resolve(customer.id);
          })
          .catch(err => {
            reject(
              utils.buildErrObject({
                ...ErrorCodes.STRIPE_ERROR,
                message: err.message
              })
            );
          });
      } else {
        // Send Customer Id that already present in our database
        resolve(user.stripe_customer_id);
      }
    } catch (err) {
      reject(
        utils.buildErrObject({
          ...ErrorCodes.STRIPE_ERROR,
          message: err.message
        })
      );
    }
  });
};


/**
 * Make user card request object according to the API
 */
exports.setUserCard = (req, forUpdate = false) => {
  const response = {
    isDefault: req.is_default
  };
  if (forUpdate === false) {
    response.userId = req.userId;
    response.stripeCard = req.stripeCard;
    response.cardBrand = req.cardBrand;
    response.cardLastFour = req.cardLastFour;
    response.status = Status.Active;
    response.onModel = req.onModel;
  }

  return response;
};


exports.resUserCard = req => {
  return {
    id: req._id,
    user_id: req.userId,
    card_brand: req.cardBrand,
    card_last_four: req.cardLastFour,
    is_default: req.isDefault,
    created_at: req.createdAt,
    status: req.status
  };
};

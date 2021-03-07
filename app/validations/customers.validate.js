const { validationResult, joiValidation, paramIdValidate } = require('../middleware/utils');
const { Status } = require('../enums');
const _ = require('lodash');
const { check, oneOf } = require('express-validator');
const PASSWORD_MIN_LENGTH = process.env.PASSWORD_MIN_LENGTH;
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
/*
 ************************
 * Customer validations
 ************************
 */


let commonFields = {
  // if(req.body.pLat) req.body.pLat = Number(req.body.pLat).toFixed(8);
  // if(req.body.pLng) req.body.pLng = Number(req.body.pLng).toFixed(8);

  first_name: Joi.string().required().messages({
    'any.required': 'MISSING',
    'string.empty': 'IS_EMPTY',
  }),
  last_name: Joi.string().required().messages({
    'any.required': 'MISSING',
    'string.empty': 'IS_EMPTY',
  }),
  phone: Joi.string().required(),
  // country_code: Joi.string().optional(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
  img: Joi.string().optional(),
  // otp_token: Joi.string().required(),
  device_type: Joi.string().optional(),
  loc: Joi.array().items(
    Joi.number().precision(8).min(-180).max(180).required(),
    Joi.number().precision(8).min(-90).max(90).required()
  ).optional(),
  address: Joi.object({
    address: Joi.string().min(2).max(25).optional(),
    // title: Joi.string().min(2).max(25).optional(),
    // floor: Joi.string().min(2).max(25).optional(),
    description: Joi.string().min(2).max(25).optional(),
    loc: Joi.array().items(
      Joi.number().precision(8).min(-180).max(180).required(),
      Joi.number().precision(8).min(-90).max(90).required()
    ).optional(),
    is_selected: Joi.boolean().optional()
  })
}

let updateProfileFields = {

  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  phone: Joi.string().optional(),
  // country_code: Joi.string().optional(),
  email: Joi.string().email().lowercase().optional(),
  img: Joi.string().optional(),

  shipping: Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    company: Joi.string().required(),
    address_1: Joi.string().required(),
    address_2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().required(),
    country: Joi.object({
      code:  Joi.string().required(),
      name:  Joi.string().required(),
  }),
  }),

  billing: Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    company: Joi.string().required(),
    address_1: Joi.string().required(),
    address_2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().required(),
    country: Joi.object({
      code:  Joi.string().required(),
      name:  Joi.string().required(),
  }),
    email: Joi.string().email().required(),
    phone: Joi.string().required()
  }),
  // // password:Joi.string().optional(),
  // shipping : Joi.object().optional(),
  // billing : Joi.object().optional()

}


// const nearbyMerchants = (req, res, next) => {

//   let reqData = {
//     lat: Joi.number().precision(8).min(-90).max(90).required(),
//     lng: Joi.number().precision(8).min(-180).max(180).required(),
//     radius: Joi.number().integer().max(500).required(),
//     service_id: Joi.objectId().optional(),
//     category_ids: Joi.array().items(
//       Joi.objectId().optional()
//     ).optional()
//   };

//   const schema = Joi.object(reqData);
//   const { value, meta } = joiValidation(req.query, schema, 'nearbyMerchants');
//   if (!_.isNil(meta)) {
//     return res.status(400).send({ meta });
//   }
//   req.value = value;
//   next();
// }

// const nearbyMerchantsAll = (req, res, next) => {

//   let reqData = {
//     lat: Joi.number().precision(8).min(-90).max(90).required(),
//     lng: Joi.number().precision(8).min(-180).max(180).required(),
//     radius: Joi.number().integer().max(500).required(),
//     service_id: Joi.objectId().required(),
//     // category_ids: Joi.array().items(
//     //   Joi.objectId().optional()
//     // ).optional()
//   };

//   const schema = Joi.object(reqData);
//   const { value, meta } = joiValidation(req.query, schema, 'nearbyMerchants');
//   if (!_.isNil(meta)) {
//     return res.status(400).send({ meta });
//   }
//   req.value = value;
//   next();
// }


const getServiceCategories = (req, res, next) => {
console.log('getServiceCategories')
  let reqData = {
    id: Joi.objectId().optional(),
    service_id: Joi.objectId().optional()
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.query, schema, 'getCategories');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }

  req.value = {};
  if (!_.isNil(value.id)) {
    req.value.category = { _id: value.id }
  }

  if (!_.isNil(value.service_id)) {
    req.value.service = { _id: value.service_id }
  }
  // else
  //   req.value = {};
  next();
}

const getServiceCategoriesWithLocation = (req, res, next) => {

  let reqData = {
    lat: Joi.number().precision(8).min(-90).max(90).optional(),
    lng: Joi.number().precision(8).min(-180).max(180).optional(),
    radius: Joi.number().integer().max(500)
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.query, schema, 'getServiceCategories');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}


const signup = (req, res, next) => {
  console.log(req.body)
  let reqData = commonFields;
  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'signUp');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}


const login = (req, res, next) => {

  let reqData = {
    // country_code: Joi.string().optional(),
    // phone: Joi.string().optional(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
  };
  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'login');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}

const addAddress = (req, res, next) => {

  let reqData = {
    address: Joi.string().required(),
    // title: Joi.string().required(),
    // floor: Joi.string().optional(),
    description: Joi.string().optional(),
    loc: Joi.array().items(
      Joi.number().precision(8).min(-180).max(180).required(),
      Joi.number().precision(8).min(-90).max(90).required()
    ).required()
  };
  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'addAddress');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}

/**
 * update default address request
 */
const updateDefaultAddress = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'updateDefaultAddress');
    next()
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}


/**
 * delete address request
 */
const deleteAddress = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'deleteAddress');
    next()
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}


const updateProfile = (req, res, next) => {
  try {
    const schema = Joi.object(updateProfileFields);
    const { value, meta } = joiValidation(req.body, schema, 'updateProfile');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}

const changePassword = (req, res, next) => {
  try {
    const schema = Joi.object({
      old_password: Joi.string().required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
      }),
      password: Joi.string().min(parseInt(PASSWORD_MIN_LENGTH)).required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
        "string.min" : 'PASSWORD_TOO_SHORT_MIN_5'
      }),
    });
    const { value, meta } = joiValidation(req.body, schema, 'changePassword');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}

/**
 * Validates verify Phone request
 */
const verifyPhone = (req, res, next) => {
  try {
    const schema = Joi.object({
      phone: Joi.string().required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
      })
    });
    const { value, meta } = joiValidation(req.body, schema, 'verifyPhone');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}

const forgotPassword = (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().lowercase().required()
      // phone: Joi.string().required().messages({
      //   'any.required': 'MISSING',
      //   'string.empty': 'IS_EMPTY',
      // })
    });
    const { value, meta } = joiValidation(req.body, schema, 'forgotPassword');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}



/**
 * Validates verify OTP code request
 */
const verifyOTPCode = (req, res, next) => {
  try {
    const schema = Joi.object({
      phone: Joi.string().required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
      }),
      code: Joi.string().required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
      })
    });
    const { value, meta } = joiValidation(req.body, schema, 'verifyOTPCode');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}





/*
 ************************
 * user cards validations
 ************************
 */

/**
 * Validates create a new card request
 */


const createCard = (req, res, next) => {
  console.log('createCard')
  try {
    const schema = Joi.object({
      stripe_card_token: Joi.string().required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
      })
    });
    const { value, meta } = joiValidation(req.body, schema, 'createCard');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}


/**
 * Validates update card request
 */
const updateCard = (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
      }),
      is_default: Joi.boolean().required().messages({
        'any.required': 'MISSING',
        'string.empty': 'IS_EMPTY',
      })
    });
    const { value, meta } = joiValidation({ ...req.body, ...req.params }, schema, 'createCard');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}



/**
 * Validates get card request
 */
const getCard = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'getCard');
    next()
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}



/**
 * Validates delete card request
 */
const deleteCard = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'deleteCard');
    next()
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}


/**
 * Add Shipping Address
 */
const addShipping = (req, res, next) => {

  let reqData = {
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    company: Joi.string().required(),
    address_1: Joi.string().required(),
    address_2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().required(),
    country: Joi.string().required(),
  };
  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'addShipping');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}


const getItem = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'getItem');
    // if(req.user.role == Roles.Merchant){
    //   req.value.merchant_id = req.user.merchant_id
    // }
    next();
  } catch (error) {
    console.log(error)
    return res.status(400).send({ meta: error });
  }
}


const deleteItem = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'deleteItem');
    // if (req.user.role == Roles.Merchant) {
    //   req.value.merchant_id = req.user.merchant_id
    // }
    next()
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}



module.exports = {
  // createItem,
  // // getAllItems,
  // updateItem,
  deleteItem,
   getItem,
  signup,
  // nearbyMerchants,
  // nearbyMerchantsAll,
  getServiceCategories,
  login,
  addAddress,
  updateDefaultAddress,
  deleteAddress,
  getServiceCategoriesWithLocation,

  // getProfile,
  updateProfile,
  changePassword,
  forgotPassword,

  verifyPhone,
  verifyOTPCode,



  createCard,
  getCard,
  updateCard,
  deleteCard,


  // addShipping,

}

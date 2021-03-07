const { validationResult, joiValidation, paramIdValidate } = require('../middleware/utils');
const { Status } = require('../enums');
const _ = require('lodash');
const { check, oneOf } = require('express-validator');
const PASSWORD_MIN_LENGTH = process.env.PASSWORD_MIN_LENGTH;
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
/*
 ************************
 * Paypal validations
 ************************
 */

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
      paypal_card_token: Joi.string().required()
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


const createPayment = (req, res, next) => {
  console.log('createPayment')
  try {
    const schema = Joi.object({
      paypal_card_token: Joi.string().required()
    });
    const { value, meta } = joiValidation(req.body, schema, 'createPayment');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }
    req.value = value;
    next();
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}



module.exports = {
  createCard,
  getCard,
  updateCard,
  deleteCard,

  createPayment
  // addShipping,

}

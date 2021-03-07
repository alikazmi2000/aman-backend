const { joiValidation, paramIdValidate } = require('../middleware/utils'); const { Status, Roles } = require('../enums');
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
/**
 * Validates create new item request
 */


const createItem = (req, res, next) => {

  let reqData = {
    name: Joi.string().allow(''),
    value: Joi.string().allow(''),
    rates: Joi.array().items({
      country: Joi.string().allow(''),
      state: Joi.string().allow(''),
      zip_code: Joi.array().items(Joi.string()), // if empty then for apply all under state else only on mentioned
      city: Joi.array().items(Joi.string()),
      rate: Joi.number(),
      name: Joi.string().allow(''), // tax name
      priority: Joi.number(),
      compound: Joi.boolean(), // ignore for now
      shipping: Joi.boolean()
    })
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'createItem');
  if (!_.isNil(meta)) {
    console.log(meta)
    return res.status(400).send({ meta });
  }

  req.value = value;
  next();
}


const updateItem = (req, res, next) => {

  let reqData = {

    id: Joi.objectId().required(),
    name: Joi.string().allow(''),
    value: Joi.string().allow(''),
    rates: Joi.array().items({
      country: Joi.string().allow(''),
      state: Joi.string().allow(''),
      zip_code: Joi.array().items(Joi.string()), // if empty then for apply all under state else only on mentioned
      city: Joi.array().items(Joi.string()),
      rate: Joi.number(),
      name: Joi.string().allow(''), // tax name
      priority: Joi.number(),
      compound: Joi.boolean(), // ignore for now
      shipping: Joi.boolean()
    })
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation({ ...req.body, ...req.params }, schema, 'updateItem');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }

  req.value = value;
  next();
}

const deleteItem = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'deleteItem');
    next()
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
}

const getItem = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'getItem');
    next();
  } catch (error) {
    console.log(error)
    return res.status(400).send({ meta: error });
  }
}


module.exports = {
  createItem,
  updateItem,
  getItem,
  deleteItem

}
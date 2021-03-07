const { joiValidation, paramIdValidate } = require('../middleware/utils');
const { Status, Roles } = require('../enums');
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
/**
 * Validates create new item request
 */


const createItem = (req, res, next) => {

  


  let reqData = {

    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    message: Joi.string().required(),
    
  }
  

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'createItem');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
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
  getItem
  
}



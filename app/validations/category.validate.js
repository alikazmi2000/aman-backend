const { joiValidation, paramIdValidate } = require('../middleware/utils'); const { Status, Roles } = require('../enums');
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
/**
 * Validates create new item request
 */


const createItem = (req, res, next) => {

  let reqData = {

    name: Joi.string().required(),
    //slug: Joi.string().allow('').default(''),
    //description: Joi.string().allow('').default(''),
    // image: {
    //     src: Joi.string().allow('').default(''),
    //     name: Joi.string().allow('').default(''),
    //     alt: Joi.string().allow('').default(''),
    // },
    parent: Joi.objectId().optional(),
    status : Joi.string().allow(Status),
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'createItem');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }


  req.value = value;
  next();
}


const updateItem = (req, res, next) => {

  let reqData = {
    id: Joi.objectId().required(),
    name: Joi.string().required(),
    // slug: Joi.string().allow('').optional(),
    // description: Joi.string().allow('').optional(),
    // image: {
    //     src: Joi.string().allow('').optional(),
    //     name: Joi.string().allow('').optional(),
    //     alt: Joi.string().allow('').optional()
    // },
    parent: Joi.objectId().optional(),
    status : Joi.string().allow(Status)

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
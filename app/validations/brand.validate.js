const { joiValidation, paramIdValidate } = require('../middleware/utils'); const { Status, Roles } = require('../enums');
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
/**
 * Validates create new item request
 */


const createItem = (req, res, next) => {

  let reqData = {
    name: Joi.string().allow('').optional(),
    slug: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    brand_image: {
      src: Joi.string().allow('').optional(),
      name: Joi.string().allow('').optional(),
      alt: Joi.string().allow('').optional(),
    },
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
    name: Joi.string().allow('').optional(),
    slug: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    status : Joi.string().allow(Status),
    brand_image: {
      src: Joi.string().allow('').optional(),
      name: Joi.string().allow('').optional(),
      alt: Joi.string().allow('').optional(),
    }
    // name: Joi.string().allow('').optional(),
    // slug: Joi.string().allow('').optional(),
    // description: Joi.string().allow('').optional(),
    // image: {
    //     src: Joi.string().allow('').optional(),
    //     name: Joi.string().allow('').optional(),
    //     alt: Joi.string().allow('').optional()
    // },
    // parent: Joi.objectId().optional()
    // merchant_id: (req.user.role == Roles.Admin) ? Joi.objectId().required() : Joi.forbidden()

  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation({ ...req.body, ...req.params }, schema, 'updateItem');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }

  // if (req.user.role == Roles.Merchant) {
  //   value.merchant_id = req.user.merchant_id
  // }

  req.value = value;
  next();
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

const getItem = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'getItem');
    // if (req.user.role == Roles.Merchant) {
    //   req.value.merchant_id = req.user.merchant_id
    // }
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



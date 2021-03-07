const { validationResult, joiValidation, paramIdValidate } = require('../middleware/utils');
const { Status } = require('../enums');
const _ = require('lodash');
const { check, oneOf } = require('express-validator');
const PASSWORD_MIN_LENGTH = process.env.PASSWORD_MIN_LENGTH;
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const mongoose = require('mongoose');
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
  img: Joi.string().required(),
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


// let updateProfileFields = {
//   first_name: Joi.string().optional(),
//   last_name: Joi.string().optional(),
//   phone: Joi.string().optional(),
//   country_code: Joi.string().optional(),
//   email: Joi.string().email().lowercase().optional(),
//   img: Joi.string().optional(),
// }

// http://54.159.180.203:3000/v1/api/product/?page=1&limit=12

// Search By Category ID
// Serrch By BRand ID

// Search BY NAME
// Srarch BY NAME&Category ID

const getAllItems = (req, res, next) => {
console.log('getAllItems')
  let reqData = {
    category_id: Joi.objectId().optional(),
    brand_id: Joi.objectId().optional(),
    name: Joi.string().trim().optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.query, schema, 'getCategories');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }

  req.value = {
    query: {}
    // , pagination: {} 
  };
  // if (!_.isNil(value.page)) {
  //   req.value.pagination.page = value.page;
  // }

  // if (!_.isNil(value.limit)) {
  //   req.value.pagination.limit = value.limit;
  // }


  console.log(value)
  console.log(typeof value.category_id)

  if (!_.isNil(value.category_id)) {
    // req.value.query.categories = mongoose.Types.ObjectId(value.category_id);
    req.value.query.categories = value.category_id;
  }
  if (!_.isNil(value.name))
    req.value.query.name = { $regex: value.name, $options: 'i' };

  if (!_.isNil(value.brand_id))
    req.value.query.brands = value.brand_id;
    // req.value.query.brands = value.brand_id;

  next();
}

const getItemsByParams = (req, res, next) => {
console.log('getItemsByParams')
  let reqData = {
    category_id: Joi.objectId().optional(),
    brand_id: Joi.objectId().optional(),
    name: Joi.string().trim().optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.query, schema, 'getItemsByParams');
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

const relatedItems = (req, res, next) => {
  let reqData = {
    id: Joi.objectId().optional(),
    type: Joi.string().valid('brand', 'category').optional()
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation({ ...req.query, ...req.params }, schema, 'relatedItems', true);
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





const getProductAvailability = (req, res, next) => {
  console.log('getProductAvailability')
  let reqData = {
    line_items: Joi.array().items(
      Joi.object({
        product_id: Joi.objectId().required(),
        variation_id: Joi.objectId().optional(),
        // wp_product_id: Joi.string().optional(),
        quantity: Joi.number().required()
      })
    )
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'getProductAvailability');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}


const getVariationAvailability = (req, res, next) => {
  console.log('getVariationAvailability')
  let reqData = {
    line_items: Joi.array().items(
      Joi.object({
        variation_id: Joi.objectId().optional(),
        quantity: Joi.number().required()
      })
    )
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'getVariationAvailability');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}




const getTaxVerification = (req, res, next) => {
  console.log('getTaxVerification')
  let reqData = {

  //   {
  //     "line_items": [
  //         {
  //             "product_id": "5ed261bcbab97c421cdf6107",
  //             "variation_id": "5ed261bcbab97c421cdf6107"
  //         },
  //         {
  //             "product_id": "5ed261bcbab97c421cdf6107"
  //         }
  //     ],
  //     "address": {
  //         "country": "US",
  //         "state": "VA",
  //         "zip_code": "23220"
  //     }
  // }


    line_items: Joi.array().items(
      Joi.object({
        variation_id: Joi.objectId().allow('').optional(),
        product_id: Joi.objectId().optional()
      })
    ),
    address: Joi.object({
      country: Joi.string().optional(),
      state: Joi.string().optional(),
      zip_code: Joi.string().allow('').optional()
    })
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'getTaxVerification');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}

const getShippingInfo = (req, res, next) => {
  console.log('getShippingInfo')
  let reqData = {
    country: Joi.string().optional(),
    state: Joi.string().optional(),
    zip_code: Joi.string().allow('').optional(),
    coupon: Joi.string().allow('').optional(),
    total_amount: Joi.string().allow('').optional()
    // line_items: Joi.array().items(

    //   // -----------------------
    //   // FOR SHIPPING 
    //   // country,zip_code
    //   // exact match than
    //   // shiiping method return method_id: flat_rate

    //   Joi.object({
    //     // variation_id: Joi.objectId().optional(),
    //     // production_id: Joi.objectId().optional(),
    //     // quantity: Joi.number().required(),
    //     // zone_id: Joi.objectId().optional(),
    //     country: Joi.string().optional(),
    //     state: Joi.string().optional(),
    //     zip_code: Joi.string().optional(),
    //   })
    // )
  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.body, schema, 'getShippingInfo');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }
  req.value = value;
  next();
}




const createItem = (req, res, next) => {

  let reqData = {
    name: Joi.string().required(),
    status: Joi.string().valid('publish', 'private', 'draft').default('publish'),
    description: Joi.string().allow('').required(),
    short_description: Joi.string().allow('').required(),
    type: Joi.string().valid('simple', 'variable').default('simple'),
    sku: Joi.string().required(),
    price: Joi.number().required(),
    tax_status: Joi.string().allow('').default('taxable'),
    tax_class: Joi.string().allow('').default(''),
    stock_quantity: Joi.number().required(),
    manage_stock: Joi.boolean().default(true),
    categories: Joi.array().items(Joi.objectId()),
    images: Joi.array().items(
      Joi.object({
          name: Joi.string().allow('').default(''),
          src: Joi.string().allow('').default(''),
          alt: Joi.string().allow('').default('')
        }).required(),
    ).required(),
    brands: Joi.array().items(Joi.objectId()),
    attributes: Joi.array().items(Joi.object({
      id:Joi.objectId().required(),
      name:Joi.string().required(),
      options: Joi.array().empty(),
      variation:Joi.boolean().default(true),
      visible:Joi.boolean().default(true),
    })).optional(),
    variations: Joi.array().items(Joi.object({
      attribute: Joi.array().required(),
      price:Joi.number().required(),
      manage_stock:Joi.boolean().default(true),
      stock_quantity:Joi.number().required(),
    })).optional(),
    sync_square: Joi.boolean().default(false)

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
    name: Joi.string().required(),
    status: Joi.string().valid('publish', 'private', 'draft').default('publish'),
    description: Joi.string().allow('').required(),
    short_description: Joi.string().allow('').required(),
    type: Joi.string().valid('simple', 'variable').default('simple'),
    //sku: Joi.string().required(),
    price: Joi.number().required(),
    //tax_status: Joi.string().allow('').default('taxable'),
    //tax_class: Joi.string().allow('').default(''),
    stock_quantity: Joi.number().required(),
    manage_stock: Joi.boolean().default(true),
    categories: Joi.array().items(Joi.objectId()),
    images: Joi.array().items(
      Joi.object({
          name: Joi.string().allow('').default(''),
          src: Joi.string().allow('').default(''),
          alt: Joi.string().allow('').default('')
        }).required(),
    ).required(),
    brands: Joi.array().items(Joi.objectId()),
    attributes: Joi.array().items(Joi.object({
      id:Joi.objectId().required(),
      name:Joi.string().required(),
      options: Joi.array().empty(),
      variation:Joi.boolean().default(true),
      visible:Joi.boolean().default(true),
    })).optional(),
    variations: Joi.array().items(Joi.object({
      attribute: Joi.array().required(),
      price:Joi.number().required(),
      manage_stock:Joi.boolean().default(true),
      stock_quantity:Joi.number().required(),
    })).optional(),
    sync_square: Joi.boolean().default(false)

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




const getSkuExists = (req, res, next) => {
  console.log('getSkuExists')
  try {

    let reqData = {
      sku: Joi.string().required()
    };

    const schema = Joi.object(reqData);
    const { value, meta } = joiValidation(req.params, schema, 'getSkuExists');
    if (!_.isNil(meta)) {
      return res.status(400).send({ meta });
    }

    req.value = value;
    next();
  } catch (error) {
    console.log(error)
    return res.status(400).send({ meta: error });
  }
}




module.exports = {
  getAllItems,
  getItemsByParams,
  getItem,


  getProductAvailability,
  getVariationAvailability,
  getTaxVerification,
  getShippingInfo,


  createItem,
  updateItem,
  getItem,
  deleteItem,




  getSkuExists,
  relatedItems

}
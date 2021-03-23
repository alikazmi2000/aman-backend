const { joiValidation, paramIdValidate } = require('../middleware/utils');
const { Status, Roles } = require('../enums');
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
/**
 * Validates create new item request
 */


const createItem = (req, res, next) => {

  const billing = Joi.object({


    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    address:  Joi.string().required(),
    city:  Joi.string().required(),
    shippment_weight:  Joi.number().required(),
    state: Joi.object({
        code:  Joi.string().required(),
        name:  Joi.string().required(),
    }),
    zip_code:  Joi.string().allow('').required(),
    country: Joi.object({
        code:  Joi.string().required(),
        name:  Joi.string().required(),
        charges:  Joi.number().required(),
    }),
    email: Joi.string().email().required(),
    phone:  Joi.string().required(),



    // first_name: Joi.string().required(),
    // last_name: Joi.string().required(),
    // company: Joi.string().allow('').required(),
    // address_1: Joi.string().allow('').required(),
    // address_2: Joi.string().allow('').required(),
    // city: Joi.string().required(),
    // state: Joi.string().required(),
    // zip_code: Joi.string().required(),
    // country: Joi.string().required(),
    // email: Joi.string().email().required(),
    // phone: Joi.string().required(),
  });
  
  const shipping = Joi.object({

    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    address:  Joi.string().required(),
    shippment_weight:  Joi.number().required(),
    city:  Joi.string().required(),
    state: Joi.object({
        code:  Joi.string().required(),
        name:  Joi.string().required(),
    }),
    zip_code:  Joi.string().allow('').required(),
    country: Joi.object({
        code:  Joi.string().required(),
        name:  Joi.string().required(),
        charges:  Joi.number().required(),
    })
    // first_name: Joi.string().required(),
    // last_name: Joi.string().required(),
    // company: Joi.string().allow('').required(),
    // address_1: Joi.string().required(),
    // address_2: Joi.string().allow('').required(),
    // city: Joi.string().required(),
    // state: Joi.string().required(),
    // zip_code: Joi.string().required(),
    // country: Joi.string().required(),
  });


  const line_items = Joi.array().items(Joi.object({
    product_id: Joi.objectId().required(),
    variation_id: Joi.objectId().optional(),
    quantity: Joi.number().required(),
    weight:Joi.number().required(),
    price:Joi.number().required(),
    subtotal:Joi.number().required(),
    name: Joi.string().optional()
  }));


const shipping_lines =  Joi.object({
  value: Joi.string().required(),
  name: Joi.string().required(),
  desc: Joi.string().allow('').required(),
  cost: Joi.required()
})

  let reqData = {

    payment_method: Joi.string().required(),
    paypal_id: Joi.string().allow('').required(),
    invoice:Joi.object().required(),
    shipping,
    billing,
    shipping_lines,
    line_items,
    customer_id: Joi.objectId().optional(),
    // status: Joi.string().required(),
    // invoice: total shipping tax grand total
  
    // wp_id: Joi.string().required(),
    // parent_id: Joi.string().required(),
    // number: Joi.string().required(),
    // order_key: Joi.string().required(),
    // created_via: Joi.string().required(),
    // version: Joi.string().required(),
    // status: Joi.string().required(),
    // currency: Joi.string().required(),
  
    // // date_created: Joi.date().iso().required(),
    // // date_created_gmt: Joi.date().iso().required(),
    // // date_modified: Joi.date().iso().required(),
    // // date_modified_gmt: Joi.date().iso().required(),
    // discount_total: Joi.string().required(),
    // discount_tax: Joi.string().required(),
    // shipping_total: Joi.string().required(),
    // shipping_tax: Joi.string().required(),
    // cart_tax: Joi.string().required(),
    // total: Joi.string().required(),
    // total_tax: Joi.string().required(),
    // prices_include_tax: Joi.boolean().optional(),
    // wp_customer_id: Joi.string().required(),
    // customer_id: Joi.objectId().required(),
    // customer_ip_address: Joi.string().required(),
    // customer_user_agent: Joi.string().required(),
    // customer_note: Joi.string().allow('').required(),
    // billing,
    // shipping,
    // paypal_id: Joi.string().allow('').required(),
    // payment_method: Joi.string().required(),
    // payment_method_title: Joi.string().required(),
    // transaction_id: Joi.string().required(),
    // date_paid: Joi.date().iso().required(),
    // date_paid_gmt: Joi.date().iso().required(),
    // date_completed: Joi.date().iso().required(),
    // date_completed_gmt: Joi.date().iso().required(),
    // cart_hash: Joi.string().required(),
  
    // meta_data: Joi.array().optional(),
    // line_items: Joi.array().optional(),
    // tax_lines: Joi.array().optional(),
    // shipping_lines: Joi.array().optional(),
    // fee_lines: Joi.array().optional(),
    // coupon_lines: Joi.array().optional(),
    // refunds: Joi.array().optional(),
  
    // _links: {
    //   self: Joi.array().optional(),
    //   collection: Joi.array().optional(),
    //   customer: Joi.array().optional()
    // },
  
    // currency_symbol: Joi.string().required()
  }
  

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
    description: Joi.string().optional().empty(''),
    img: Joi.string().optional().empty(''),
    status: Joi.string().optional(),
    merchant_id: (req.user.role == Roles.Admin) ? Joi.objectId().required() : Joi.forbidden()

  };

  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation({ ...req.body, ...req.params }, schema, 'updateItem');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }

  if (req.user.role == Roles.Merchant) {
    value.merchant_id = req.user.merchant_id
  }

  req.value = value;
  next();
}

const deleteItem = (req, res, next) => {
  try {
    req.value = paramIdValidate(req, 'deleteItem');
    if(req.user.role == Roles.Merchant){
      req.value.merchant_id = req.user.merchant_id
    }
    next()
  } catch (error) {
    return res.status(400).send({ meta: error });
  }
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

const getItemDetails = (req, res, next) => {
  
  let reqData = {
    order_no: Joi.string().required(),
  }
  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation(req.params, schema, 'getItemDetails');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }

  req.value = value;
  next();
}

const changeStatus = (req, res, next) => {
  
  let reqData = {
    order_no: Joi.string().required(),
    status: Joi.string().required()
  }
  const schema = Joi.object(reqData);
  const { value, meta } = joiValidation({ ...req.body, ...req.params }, schema, 'changeStatus');
  if (!_.isNil(meta)) {
    return res.status(400).send({ meta });
  }

  req.value = value;
  next();
}



module.exports = {
  createItem,
  updateItem,
  getItem,
  deleteItem,

  getItemDetails,
  changeStatus

  
}



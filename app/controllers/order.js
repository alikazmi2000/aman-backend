const Orders = require('../models/order');
const Products = require('../models/products');
const Variations = require('../models/variations');

const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status } = require('../enums');
const orderService = require('../services/Orders'); 
const squareService = require('../services/Squares'); 
const productService = require('../services/Products'); 
const CrudService = require('../services/Crud');
const UtilService = require('../services/Utils');
const paypal = require('../services/paypal');
const sgMail = require('@sendgrid/mail');
const emailTemplate = require('../templates/order');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
console.log(process.env.SENDGRID_API_KEY)
const _ = require('lodash');
/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {

    const items = await db.get(Orders, {});
    utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'ORDER.LIST_ERROR');
  }
};



/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    
    const query = await db.checkQueryString(req.query);
    query.customer_id = req.user._id;
    let select = 'order_no billing.first_name billing.last_name status invoice.grand_total date_created date_created';
    const items = await db.getItems(req, Orders, query, false, select);
    // const items = await db.getItems(req, Orders, query, orderService.servicesPopulate);
    // const info = utils.setInfo(items, orderService.resDocument, true);
    items.docs = orderService.boItemConversion(items.docs);
    utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', items);
    // utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'ORDER.LIST_ERROR');
  }
};


/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItem = async (req, res) => {
  try {
    const data = matchedData(req);
    const doesDocumentExists = await db.itemCompositeExists(
      {name:data.name,service_id:data.service_id,_id: {
        $ne: data.id
      }},
      Orders,
      'ORDER.ALREADY_EXISTS'
    );
    if (!doesDocumentExists) {
      const item = await db.updateItem(data.id, Orders, data);
      utils.handleSuccess(res, 'ORDER.UPDATE_SUCCESS', item);
    }
  } catch (error) {
    utils.handleError(req, res, error);
  }
};

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
  try {

    // Steps to follow
    // 1 - first of all verify the stock.
    // 2 - make queries to update the stock
    // 3 - create the order
    // 4 - update step 2 items
    // 5 - calculation of tax and shipping
    // 6 - update the order if needed


    const data = req.value;
    // console.log(data)
    // Products
    // Variations
    //get line items
    let products = [];
    let variations = [];
    // stock_quantity
    let flag = true;
    let queries = {
      products: [],
      variations: []
    };
    data.line_items = await Promise.all(data.line_items.map(async item => {
      // console.log('value of items => ', item)
      return await productService.purchaseStock(item, queries);
    }));


    let resp = null
    // if (data.payment_method === "paypal") {
    //   data.status === "pending payment";
    //   console.log('calling purchase item method')
    //   const _paypal = await paypal.purchase(data)
    //   console.log(_paypal)
    //   if (_paypal) {
    //     data.paypal_id = _paypal.result.id
    //     resp = _paypal.result
    //   }
    //   else {
    //     resp = false
    //     console.log('payment failed')
    //   }
    // }

    data.currency = 'USD';
    let orders = await db.createItem(data, Orders);
    if (resp===null) resp = orders
    
    let stocks;
    // console.log(queries);
    if(!_.isNil(orders)) {
      stocks = await productService.updateStock(queries);
    }
    // create invoice


    
    // return res.send({
    //   data,
    //   total_tax,
    //   total,
    //   shipping_lines,
    //   tax,
    //   // orders,
    //   // stocks,
    //   // queries
    // });
    // let payload = orderService.convertToOrder(data, orders._id);
    // // console.log(orders)
    // // creating order
    // let resp = await squareService.createOrder(payload)
    // // console.log('outside of the goal')
    
    // return res.send({ queries, orders, stocks });
    // return res.send({ payload, orders, resp });

    // return res.send({ products })

    // const variation = await db.getItem()

    


    // if(orders.payment_method == "paypal"){

    //   let response = await paypal.purchase();

    //   utils.handleSuccess(res, 'ORDER.CREATE_SUCCESS', {
    //     orderId : orders.order_no,
    //     resourceId : response.result.id,
    //   });
     
    
    // }else {

    //   utils.handleSuccess(res, 'ORDER.CREATE_SUCCESS', orders);
    // }
    
    const msg = {
      to: orders.billing.email, // Change to your recipient
      from: 'sales@amanstyles.com', // Change to your verified sender
      subject: 'Order Email',
      html: emailTemplate.invitationTemplate(orders,''),
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })



      const msg = {
        to: 'sales@amanstyles.com', // Change to your recipient
        from: 'sales@amanstyles.com', // Change to your verified sender
        subject: 'Order Email',
        html: emailTemplate.invitationTemplate(orders,''),
      }
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
          console.error(error)
        })
    utils.handleSuccess(res, 'ORDER.CREATE_SUCCESS', resp);

  } catch (error) {
    console.log(error)
    utils.handleError(req, res, error);

  }
};


exports.confirmOrder = async (req,res) => {

  try {
    //how I will get the order Id?? should it be handled with order no

    let response = await paypal.captureOrder(req.body.order_id);

    return res.send(response);


  }catch (error) {
    console.log(error)
    utils.handleError(req, res, error);

  }


}


exports.deleteOrder = async (req,res) => {

try {

    


  }catch (error) {
    console.log(error)
    utils.handleError(req, res, error);

  }

}




/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteItem = async (req, res) => {
  try {
    const data = matchedData(req);
    const item = await db.deleteItem(data.id, Orders);
    utils.handleSuccess(res, 'ORDER.DELETE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'ORDER.DELETE_ERROR');
  }
};


/**
 * Get One item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItem = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.getItem(data.id, Orders);

    utils.handleSuccess(res, 'ORDER.GET_SINGLE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'ORDER.GET_SINGLE_ERROR');
  }
};





exports.getAllItemsBO = async (req, res) => {
	try {
		// validation
		let query = await db.checkQueryString(req.query);
    let select = 'order_no billing.first_name billing.last_name status invoice.grand_total date_created date_created'
    let items = await db.getItems(req, Orders, query, false, select);
		items.docs = orderService.boItemConversion(items.docs);
		utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', items);
	
	  } catch (error) {
      console.log(error)
		utils.handleError(req, res, error, 'ORDER.LIST_ERROR');
	  }
};



exports.getItemDetails = async (req, res) => {
  try {
    // let query = await db.checkQueryString(req.query);
    let data = req.value;
    let item = await db.getItemByQuery(data, Orders,true,'line_items.variation_id');
    // items.docs = orderService.boItemConversion(items.docs);
    // const info = utils.setInfo(items, serviceCategoriesService.resDocument, true);
    utils.handleSuccess(res, 'ORDER.GET_SINGLE_SUCCESS', item);

    // const orders_data = await services.Crud.get(Orders, {});
    // utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', {message:'', orders_data });
  } catch (error) {
    console.log(error)
    utils.handleError(req, res, error, 'ORDER.GET_SINGLE_ERROR');
  }
};

exports.changeStatus = async (req, res) => {
  try {
    let data = req.value;
    let check = await db.getItemByQuery({ order_no: data.order_no }, Orders, true, false, 
      { status: 1, 'line_items.product_id': 1, 'line_items.variation_id': 1, 'line_items.quantity': 1, 'line_items.sku': 1 }
    );
    
    console.log(check)
    if (['cancelled', 'refunded'].includes(data.status)) {
      // put statuses checks here
      // restore stocks in products and variations

      // Products
      // Variations
      let arr_pr = [], arr_vr = [];
        await Promise.all(check.line_items.map(async item => {
          arr_pr.push(item.product_id)
          await CrudService.updateOneInc(Products, { _id: item.product_id }, { stock_quantity: item.quantity })

          if(!_.isUndefined(item.variation_id)) {
            arr_vr.push(item.variation_id)
            await CrudService.updateOneInc(Variations, { _id: item.variation_id }, { stock_quantity: item.quantity })

          }

        }))

      //later apply query for update all and set the quantity status

      await Promise.all([
        CrudService.updateMulti(Products, { _id: { $in: arr_pr }, stock_quantity: { $ne: 0 } }, { stock_status: 'instock' }),
        CrudService.updateMulti(Variations, { _id: { $in: arr_vr }, stock_quantity: { $ne: 0 } }, { stock_status: 'instock' })
      ])
  
    }
    // return res.send(check)
    // items.docs = orderService.boItemConversion(items.docs);
    const item = await db.updateItem(check._id, Orders, { status: data.status });
    utils.handleSuccess(res, 'ORDER.STATUS_UPDATE_SUCCESS');

  } catch (error) {
    console.log(error)
    utils.handleError(req, res, error, 'ORDER.STATUS_UPDATE_ERROR');
  }
};

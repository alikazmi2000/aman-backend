// const Brand = require('../models/brands');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status } = require('../enums');

const braintree = require('../services/braintree');

/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.generateClientToken = async (req, res) => {
  try {
    const token = await braintree.generateClientToken();
    utils.handleSuccess(res, 'PAYPAL.GENERATE_TOKEN', token);
  } catch (error) {
    utils.handleError(req, res, error, 'PAYPAL.TOKEN_ERROR');
  }
};



/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.addCard = async (req, res) => {
    try {
        const data = req.value;
        const token = await braintree.addCard(req.user, data.paypal_card_token);
        utils.handleSuccess(res, 'PAYPAL.GENERATE_TOKEN', token);
    } catch (error) {
        utils.handleError(req, res, error, 'PAYPAL.TOKEN_ERROR');
    }
};




// /**
//  * Get all items function called by route
//  * @param {Object} req - request object
//  * @param {Object} res - response object
//  */
// exports.getAllItemsWithImage = async (req, res) => {
//   try {

//     let items = await db.get(Brand, {}, { name: 1, brand_image: 1 });
//     items = brandServices.mapImages(items);

//     utils.handleSuccess(res, 'Brand.LIST_SUCCESS', items);
//   } catch (error) {
//     utils.handleError(req, res, error, 'Brand.LIST_ERROR');
//   }
// };


// exports.getAllItemHaveImage = async (req, res) => {
//   try {

//     let items = await db.get(Brand, {"brand_image.src" :{$ne: ""}}, { name: 1, brand_image: 1 });

//     utils.handleSuccess(res, 'Brand.LIST_SUCCESS', items);
//   } catch (error) {
//     utils.handleError(req, res, error, 'Brand.LIST_ERROR');
//   }
// };




// exports.getAllItemsBO = async (req, res) => {
// 	try {
// 		// validation
// 		let query = await db.checkQueryString(req.query);
// 		let items = await db.getItems(req, Brand, query, false, '_id name brand_image.src');
// 		utils.handleSuccess(res, 'Brand.LIST_SUCCESS', items);
	
// 	  } catch (error) {
//       console.log(error)
// 		utils.handleError(req, res, error, 'Brand.LIST_ERROR');
// 	  }
// };




// /**
//  * Create item function called by route
//  * @param {Object} req - request object
//  * @param {Object} res - response object
//  */
// exports.createItem = async (req, res) => {
//   try {
//     const data = req.value;
//     const item = await db.createItem(data, Brand);
//     utils.handleSuccess(res, 'Brand.CREATE_SUCCESS', item);
//   } catch (error) {
//     utils.handleError(req, res, error);
//   }
// };


// /**
//  * Delete item function called by route
//  * @param {Object} req - request object
//  * @param {Object} res - response object
//  */
// exports.deleteItem = async (req, res) => {
//   try {
//     const data = req.value;
//     const item = await db.deleteItem(data.id, Brand);
//     utils.handleSuccess(res, 'Brand.DELETE_SUCCESS', item);
//   } catch (error) {
//     utils.handleError(req, res, error, 'Brand.DELETE_ERROR');
//   }
// };


// /**
//  * Get One item function called by route
//  * @param {Object} req - request object
//  * @param {Object} res - response object
//  */
// exports.getItem = async (req, res) => {
//   try {
//     const data = req.value;
//     const item = await db.getItem(data.id, Brand);

//     utils.handleSuccess(res, 'Brand.GET_SINGLE_SUCCESS', item);
//   } catch (error) {
//     utils.handleError(req, res, error, 'Brand.GET_SINGLE_ERROR');
//   }
// };



// /**
//  * Update item function called by route
//  * @param {Object} req - request object
//  * @param {Object} res - response object
//  */
// exports.updateItem = async (req, res) => {
//   try {
//     const data = req.value;
//     const doesDocumentExists = await db.itemCompositeExists(
//       {
//         name: data.name, _id: {
//           $ne: data.id
//         }
//       },
//       Brand,
//       'Brand.ALREADY_EXISTS'
//     );
//     if (!doesDocumentExists) {
//       const item = await db.updateItem(data.id, Brand, data);
//       utils.handleSuccess(res, 'Brand.UPDATE_SUCCESS', item);
//     }
//   } catch (error) {
//     utils.handleError(req, res, error);
//   }
// };
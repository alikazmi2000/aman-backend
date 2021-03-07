const Contact = require('../models/contact');

const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status } = require('../enums');
const orderService = require('../services/Orders'); 
const squareService = require('../services/Squares'); 
const productService = require('../services/Products'); 
const CrudService = require('../services/Crud');
const UtilService = require('../services/Utils');

const _ = require('lodash');


/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
    try {
      const data = req.value;
      const item = await db.createItem(data, Contact);
      utils.handleSuccess(res, 'CONTACT.CREATE_SUCCESS', item);
    } catch (error) {
      utils.handleError(req, res, error);
    }
  };

  exports.getAllItemsBO = async (req, res) => {
	try {
		// validation
		let query = await db.checkQueryString(req.query);
		let items = await db.getItems(req, Contact, query, false, '_id name email phone createdAt');
		utils.handleSuccess(res, 'CONTACT.LIST_SUCCESS', items);
	
	  } catch (error) {
      console.log(error)
		utils.handleError(req, res, error, 'CONTACT.LIST_ERROR');
	  }
};

exports.getItemDetails = async (req, res) => {
  try {
		const data = req.value;
		const item = await db.getOne(data.id, Contact, {});
		utils.handleSuccess(res, 'CONTACT.GET_SINGLE_SUCCESS', item);
	} catch (error) {
		utils.handleError(req, res, error, 'CONTACT.GET_SINGLE_ERROR');
	}
  };


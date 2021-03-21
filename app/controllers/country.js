const Country = require('../models/country');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { AttributeStatus } = require('../enums');


/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {

    const items = await db.get(Country, {}, {}, 0, 0, {}, { locale: 'en' });
    utils.handleSuccess(res, 'Country.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'Country.LIST_ERROR');
  }
};



exports.getAllItemsBO = async (req, res) => {
  try {
    // validation
    let query = await db.checkQueryString(req.query);
    let items = await db.getItems(req, Country, query, false, '');
    utils.handleSuccess(res, 'Country.LIST_SUCCESS', items);

  } catch (error) {
    console.log(error)
    utils.handleError(req, res, error, 'Country.LIST_ERROR');
  }
};




/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
  try {

    const data = req.value;

    const doesDocumentExists = await db.itemCompositeExists(
      { name: data.name },
      Country,
      'Country.ALREADY_EXISTS'
    );
    if (!doesDocumentExists) {
      console.log(data);
      const item = await db.createItem(data, Country);
      utils.handleSuccess(res, 'Country.CREATE_SUCCESS', item);
    }

    // const item = await db.createItem(data, Tax);
    // utils.handleSuccess(res, 'Country.CREATE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error);
  }
};


/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteItem = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.deleteItem(data.id, Country);
    utils.handleSuccess(res, 'Country.DELETE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'Country.DELETE_ERROR');
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
    const item = await db.getItem(data.id, Country);

    utils.handleSuccess(res, 'Country.GET_SINGLE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'Country.GET_SINGLE_ERROR');
  }
};



/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItem = async (req, res) => {
  try {
    const data = req.value;
      const item = await db.updateItem(data.id, Country, data);
      utils.handleSuccess(res, 'Country.UPDATE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error);
  }
};
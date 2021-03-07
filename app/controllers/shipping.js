const Shipping = require('../models/shipping');
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

    const items = await db.get(Shipping, {}, {}, 0, 0, {}, { locale: 'en' });
    utils.handleSuccess(res, 'Shipping.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'Shipping.LIST_ERROR');
  }
};



exports.getAllItemsBO = async (req, res) => {
  try {
    // validation
    let query = await db.checkQueryString(req.query);
    let items = await db.getItems(req, Shipping, query, false, '');
    utils.handleSuccess(res, 'Shipping.LIST_SUCCESS', items);

  } catch (error) {
    console.log(error)
    utils.handleError(req, res, error, 'Shipping.LIST_ERROR');
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
      Shipping,
      'Shipping.ALREADY_EXISTS'
    );
    if (!doesDocumentExists) {
      console.log(data);
      const item = await db.createItem(data, Shipping);
      utils.handleSuccess(res, 'Shipping.CREATE_SUCCESS', item);
    }

    // const item = await db.createItem(data, Tax);
    // utils.handleSuccess(res, 'Shipping.CREATE_SUCCESS', item);
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
    const item = await db.deleteItem(data.id, Shipping);
    utils.handleSuccess(res, 'Shipping.DELETE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'Shipping.DELETE_ERROR');
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
    const item = await db.getItem(data.id, Shipping);

    utils.handleSuccess(res, 'Shipping.GET_SINGLE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'Shipping.GET_SINGLE_ERROR');
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
    const doesDocumentExists = await db.itemCompositeExists(
      {
        $or: [{ name: data.name }, { value: data.value }],
        _id: {
          $ne: data.id
        }
      },
      Shipping,
      'Shipping.ALREADY_EXISTS'
    );
    if (!doesDocumentExists) {
      console.log(data);
      const item = await db.updateItem(data.id, Shipping, data);
      utils.handleSuccess(res, 'Shipping.UPDATE_SUCCESS', item);
    }
  } catch (error) {
    utils.handleError(req, res, error);
  }
};
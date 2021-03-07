const Attribute = require('../models/attributes');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status } = require('../enums');
const AttributeServices = require('../services/Attributes');


/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {
    

    const items = await db.get(Attribute, { status: Status.Active }, '-wp_id -deleted', 0, 0, {}, { locale: 'en' });
    utils.handleSuccess(res, 'Attribute.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'Attribute.LIST_ERROR');
  }
};



exports.getAllItemsBO = async (req, res) => {
  try {
    // validation
    let query = await db.checkQueryString(req.query);
    query = { ...query, status: Status.Active }
    let items = await db.getItems(req, Attribute, query, false, '-wp_id -deleted');
    utils.handleSuccess(res, 'Attribute.LIST_SUCCESS', items);

  } catch (error) {
    console.log(error)
    utils.handleError(req, res, error, 'Attribute.LIST_ERROR');
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
    const item = await db.createItem(data, Attribute);
    console.log(AttributeServices.resCreateDocument(item))
    utils.handleSuccess(res, 'Attribute.CREATE_SUCCESS', AttributeServices.resCreateDocument(item));
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
    const item = await db.deleteItem(data.id, Attribute);
    utils.handleSuccess(res, 'Attribute.DELETE_SUCCESS');//, item
  } catch (error) {
    utils.handleError(req, res, error, 'Attribute.DELETE_ERROR');
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
    const item = await db.getItem(data.id, Attribute, false, '-wp_id -deleted');

    utils.handleSuccess(res, 'Attribute.GET_SINGLE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'Attribute.GET_SINGLE_ERROR');
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
        name: data.name, _id: {
          $ne: data.id
        }
      },
      Attribute,
      'Attribute.ALREADY_EXISTS'
    );
    if (!doesDocumentExists) {
      console.log(data);
      const item = await db.updateItem(data.id, Attribute, data);
      utils.handleSuccess(res, 'Attribute.UPDATE_SUCCESS', item);
    }
  } catch (error) {
    utils.handleError(req, res, error);
  }
};
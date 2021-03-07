const Menu = require('../models/menu');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status } = require('../enums');
const menuService = require('../services/Menu');
/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {

    const items = await db.get(Menu, {});
    utils.handleSuccess(res, 'MENU.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'MENU.LIST_ERROR');
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
    const items = await db.getItems(req, Menu, query, menuService.servicesPopulate);
    const info = utils.setInfo(items, menuService.resDocument, true);
    utils.handleSuccess(res, 'MENU.LIST_SUCCESS', info);
  } catch (error) {
    utils.handleError(req, res, error, 'MENU.LIST_ERROR');
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
      Menu,
      'MENU.ALREADY_EXISTS'
    );
    if (!doesDocumentExists) {
      const item = await db.updateItem(data.id, Menu, data);
      utils.handleSuccess(res, 'MENU.UPDATE_SUCCESS', item);
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
    const data = req.value;
    const item = await db.createItem(data, Menu);
    utils.handleSuccess(res, 'MENU.CREATE_SUCCESS', item);
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
    const data = matchedData(req);
    const item = await db.deleteItem(data.id, Menu);
    utils.handleSuccess(res, 'MENU.DELETE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'MENU.DELETE_ERROR');
  }
};


/**
 * Get One item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItem = async (req, res) => {
  try {
    const data = matchedData(req);
    const item = await db.getItem(data.id, Menu);

    utils.handleSuccess(res, 'MENU.GET_SINGLE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'MENU.GET_SINGLE_ERROR');
  }
};



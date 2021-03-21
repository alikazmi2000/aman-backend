const Category = require('../models/categories');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status } = require('../enums');

const _ = require('lodash');
const CategoriesServices = require('../services/Categories');


/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {

    const items = await db.get(Category, { status: Status.Active });
    //const info = utils.setInfo(items, CategoriesServices.resCategoryMenu, true, false);
    utils.handleSuccess(res, 'Category.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'Category.LIST_ERROR');
  }
};


/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItemsWithParents = async (req, res) => {
  try {

    let query = [{ $match: { status: Status.Active } }]
    query.push(CategoriesServices.parentAggregateGraphLookup())
    const items = await db.getItemsUsingAggregate(req, Category, query);
    utils.handleSuccess(res, 'Category.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'Category.LIST_ERROR');
  }
};



exports.getAllItemsDropDown = async (req, res) => {
  try {

    const items = await db.get(Category, { status: Status.Active });
    const newItems = items.map((currentValue, index, arr) => {
      let obj = {
        id: currentValue._id,
        name: currentValue.name,
        parentId: currentValue.parent
      };

      if (arr.some(par => currentValue._id.toString() ==
        par.parent ?
        par.parent.toString() :
        ''
      )) {

        obj.hasSubCategory = true;
      } else {
        obj.hasSubCategory = false;
      }

      if (!currentValue.parent) {
        obj.parentId = 0;
      }

      return obj;
    })

    if (req.originalUrl.includes('api/category/drop-down')) {
      let all_product = {
        id: '',
        name: 'All Products',
        parentId: 0,
        hasSubCategory: false,
      }

      newItems.unshift(all_product);
    }


    utils.handleSuccess(res, 'Category.LIST_SUCCESS', newItems);
  } catch (error) {
    utils.handleError(req, res, error, 'Category.LIST_ERROR');
  }
}






exports.getAllItemsBO = async (req, res) => {
	try {
    let query = await db.checkQueryString(req.query);
    query = { ...query, status: Status.Active }
    let items = await db.getItems(req, Category, query, false, '_id name status');

		items.docs = CategoriesServices.boItemConversion(items.docs);
    utils.handleSuccess(res, 'Category.LIST_SUCCESS', items);
    
	  } catch (error) {
      console.log(error)
		utils.handleError(req, res, error, 'Category.LIST_ERROR');
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
    const item = await db.createItem(data, Category);
    utils.handleSuccess(res, 'Category.CREATE_SUCCESS', item);
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
    const item = await db.deleteItem(data.id, Category);
    utils.handleSuccess(res, 'Category.DELETE_SUCCESS'); //, item
  } catch (error) {
    utils.handleError(req, res, error, 'Category.DELETE_ERROR');
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
    const item = await db.getItem(data.id, Category, false, '_id name description status');

    utils.handleSuccess(res, 'Category.GET_SINGLE_SUCCESS', item);
  } catch (error) {
    utils.handleError(req, res, error, 'Category.GET_SINGLE_ERROR');
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
      Category,
      'Category.ALREADY_EXISTS'
    );
    if (!doesDocumentExists) {

      const item = await db.updateItem(data.id, Category, data);
      const childs = await db.updateItemsByQuery({parent:item._id},Category,{status : item.status});

      utils.handleSuccess(res, 'Category.UPDATE_SUCCESS', item);
    }
  } catch (error) {
    utils.handleError(req, res, error);
  }
};